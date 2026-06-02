"use client"

import { useEffect, useRef, useState } from "react"
import { X, Phone, PhoneOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePipecat } from "@/components/pipecat/pipecat-provider"
import { cn } from "@/lib/utils"

interface VoiceReceptionistProps {
  open: boolean
  onClose: () => void
}

type CallStatus = "idle" | "connecting" | "listening" | "speaking" | "ending" | "error"

// AudioWorklet processor: converts float32 mic samples → PCM16 binary chunks
// sent over WebSocket to the Pipecat server.
const RECORDER_WORKLET_CODE = `
class PCMRecorderProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0]
    if (input && input[0]) {
      const samples = input[0]
      const int16 = new Int16Array(samples.length)
      for (let i = 0; i < samples.length; i++) {
        const clamped = Math.max(-1, Math.min(1, samples[i]))
        int16[i] = clamped < 0 ? clamped * 32768 : clamped * 32767
      }
      this.port.postMessage({ pcm: int16.buffer }, [int16.buffer])
    }
    return true
  }
}
registerProcessor('pcm-recorder', PCMRecorderProcessor)
`

export function VoiceReceptionist({ open, onClose }: VoiceReceptionistProps) {
  const { serverUrl, configured } = usePipecat()
  const [callStatus, setCallStatus] = useState<CallStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // WebSocket + audio refs (not state — changes don't need re-renders)
  const wsRef = useRef<WebSocket | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const workletNodeRef = useRef<AudioWorkletNode | null>(null)
  const nextPlayTimeRef = useRef<number>(0)
  // Mute mic while bot is speaking to prevent echo → self-interruption
  const botSpeakingRef = useRef(false)

  const isCallActive =
    callStatus === "connecting" || callStatus === "listening" || callStatus === "speaking"

  // End call when modal closes while active
  useEffect(() => {
    if (!open && isCallActive) void stopCall()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Cleanup on unmount
  useEffect(() => {
    return () => { void stopCall() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startCall() {
    if (!configured || !serverUrl) {
      setErrorMessage("Voice server not configured. Set NEXT_PUBLIC_PIPECAT_SERVER_URL.")
      setCallStatus("error")
      return
    }

    setCallStatus("connecting")
    setErrorMessage(null)
    nextPlayTimeRef.current = 0
    botSpeakingRef.current = false

    // --- microphone access ---
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMessage(friendlyError(msg))
      setCallStatus("error")
      return
    }
    micStreamRef.current = stream

    // --- AudioContext for capture + playback ---
    const audioCtx = new AudioContext({ sampleRate: 16000 })
    audioCtxRef.current = audioCtx

    // Load inline AudioWorklet for PCM16 conversion
    try {
      const blob = new Blob([RECORDER_WORKLET_CODE], { type: "application/javascript" })
      const workletUrl = URL.createObjectURL(blob)
      await audioCtx.audioWorklet.addModule(workletUrl)
      URL.revokeObjectURL(workletUrl)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMessage(friendlyError(msg))
      setCallStatus("error")
      cleanupAudio()
      return
    }

    // --- WebSocket connection ---
    let ws: WebSocket
    try {
      ws = new WebSocket(serverUrl)
      ws.binaryType = "arraybuffer"
      wsRef.current = ws
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMessage(friendlyError(msg))
      setCallStatus("error")
      cleanupAudio()
      return
    }

    ws.onopen = () => {
      // Wire microphone → AudioWorklet → WebSocket
      const micSource = audioCtx.createMediaStreamSource(stream)
      const workletNode = new AudioWorkletNode(audioCtx, "pcm-recorder")
      workletNode.port.onmessage = (event: MessageEvent) => {
        if (ws.readyState === WebSocket.OPEN && !botSpeakingRef.current) {
          ws.send(event.data.pcm as ArrayBuffer)
        }
      }
      micSource.connect(workletNode)
      workletNodeRef.current = workletNode
      setCallStatus("listening")
    }

    ws.onmessage = async (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        // Mute mic immediately on first audio chunk — don't wait for bot-started-speaking JSON
        botSpeakingRef.current = true
        setCallStatus("speaking")
        try {
          await playWAVChunk(audioCtx, event.data)
        } catch {
          // Ignore decode errors on individual audio chunks
        }
      } else if (typeof event.data === "string") {
        try {
          const msg = JSON.parse(event.data) as Record<string, unknown>
          handleServerMessage(msg)
        } catch {
          // Non-JSON text — ignore
        }
      }
    }

    ws.onerror = () => {
      setErrorMessage(
        "Voice server unavailable. Please start the Pipecat backend.\n\n" +
          "Run: cd voice-server && python bot.py",
      )
      setCallStatus("error")
      cleanupAudio()
    }

    ws.onclose = (event) => {
      if (event.code !== 1000 && event.code !== 1001 && callStatus !== "ending") {
        setErrorMessage("Connection closed unexpectedly. Please try again.")
        setCallStatus("error")
      } else {
        setCallStatus("idle")
      }
      cleanupAudio()
    }
  }

  function handleServerMessage(msg: Record<string, unknown>) {
    const type = msg.type as string | undefined

    if (type === "bot-started-speaking" || type === "BotStartedSpeakingFrame") {
      botSpeakingRef.current = true
      setCallStatus("speaking")
    } else if (type === "bot-stopped-speaking" || type === "BotStoppedSpeakingFrame") {
      botSpeakingRef.current = false
      setCallStatus("listening")
    } else if (type === "error" || type === "ErrorFrame") {
      const errMsg = (msg.message ?? "An error occurred in the voice server.") as string
      setErrorMessage(String(errMsg))
      setCallStatus("error")
    }
  }

  async function stopCall() {
    setCallStatus("ending")
    wsRef.current?.close(1000)
    wsRef.current = null
    cleanupAudio()
    setCallStatus("idle")
  }

  function cleanupAudio() {
    workletNodeRef.current?.disconnect()
    workletNodeRef.current = null
    micStreamRef.current?.getTracks().forEach((t) => t.stop())
    micStreamRef.current = null
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    nextPlayTimeRef.current = 0
  }

  async function playWAVChunk(ctx: AudioContext, data: ArrayBuffer): Promise<void> {
    const copy = data.slice(0)
    const buffer = await ctx.decodeAudioData(copy)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    const now = ctx.currentTime
    const startTime = Math.max(now, nextPlayTimeRef.current)
    source.start(startTime)
    nextPlayTimeRef.current = startTime + buffer.duration
  }

  function handleClose() {
    if (isCallActive) void stopCall()
    onClose()
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vr-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />

      {/* Panel */}
      <div className="relative z-10 flex w-full max-w-sm flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">

        {/* Close */}
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="size-5" aria-hidden />
        </button>

        {/* Main IVR body */}
        <div className="flex flex-col items-center gap-6 px-8 pb-8 pt-10">

          {/* Avatar + animation rings */}
          <div className="relative flex items-center justify-center">
            {callStatus === "speaking" && (
              <>
                <span className="absolute size-24 animate-ping rounded-full bg-blue-200 opacity-60" style={{ animationDuration: "1.2s" }} />
                <span className="absolute size-32 animate-ping rounded-full bg-blue-100 opacity-40" style={{ animationDuration: "1.6s", animationDelay: "0.3s" }} />
              </>
            )}
            {callStatus === "listening" && (
              <span className="absolute size-20 animate-pulse rounded-full bg-green-100" />
            )}
            <div
              className={cn(
                "relative flex size-16 items-center justify-center rounded-full text-white text-2xl font-bold shadow-lg transition-colors duration-300",
                callStatus === "speaking" ? "bg-blue-600" :
                callStatus === "listening" ? "bg-green-500" :
                callStatus === "connecting" ? "bg-gray-400" :
                "bg-gray-300"
              )}
            >
              {callStatus === "connecting" ? (
                <span className="size-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <span aria-hidden>🤖</span>
              )}
            </div>
          </div>

          {/* Name + status */}
          <div className="text-center">
            <h2 id="vr-title" className="text-base font-semibold text-gray-900">CareAI Receptionist</h2>
            <p className={cn(
              "mt-1 text-sm font-medium",
              callStatus === "speaking" ? "text-blue-600" :
              callStatus === "listening" ? "text-green-600" :
              callStatus === "connecting" ? "text-gray-500" :
              callStatus === "error" ? "text-red-600" :
              "text-gray-400"
            )}>
              {callStatus === "idle" && "Ready to call"}
              {callStatus === "connecting" && "Connecting…"}
              {callStatus === "speaking" && "Speaking"}
              {callStatus === "listening" && "Listening"}
              {callStatus === "ending" && "Ending call…"}
              {callStatus === "error" && "Connection error"}
            </p>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="flex w-full items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span className="whitespace-pre-wrap">{errorMessage}</span>
            </div>
          )}

          {/* Idle prompt */}
          {callStatus === "idle" && !errorMessage && (
            <p className="text-center text-sm text-gray-400">
              {!configured
                ? "Voice server not configured. Set NEXT_PUBLIC_PIPECAT_SERVER_URL."
                : "Start a call — CareAI will greet you automatically."}
            </p>
          )}

          {/* Listening dots */}
          {callStatus === "listening" && (
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-2 animate-bounce rounded-full bg-green-400"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}

          {/* Call button */}
          {!isCallActive ? (
            <Button
              onClick={() => void startCall()}
              disabled={!configured || callStatus === "ending"}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Phone className="size-4" aria-hidden />
              Start Call
            </Button>
          ) : (
            <Button
              onClick={() => void stopCall()}
              variant="destructive"
              className="w-full gap-2"
            >
              <PhoneOff className="size-4" aria-hidden />
              End Call
            </Button>
          )}

        </div>
      </div>
    </div>
  )
}

function friendlyError(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.includes("microphone") || lower.includes("permission") || lower.includes("notallowed")) {
    return "Microphone access was denied. Please allow microphone permission in your browser settings."
  }
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("connect") || lower.includes("websocket")) {
    return "Voice server unavailable. Please start the Pipecat backend.\n\nRun: cd voice-server && python bot.py"
  }
  if (lower.includes("worklet") || lower.includes("audio")) {
    return "Audio system error. Please use a modern browser (Chrome or Firefox recommended)."
  }
  return raw || "Something went wrong. Please try again."
}
