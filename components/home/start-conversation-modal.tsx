"use client"

import { useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import { VoiceReceptionist } from "@/components/pipecat/voice-receptionist"
import { cn } from "@/lib/utils"

export function StartConversationModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(buttonVariants({ size: "lg" }), "bg-blue-700 hover:bg-blue-800 text-white")}
      >
        Start Conversation
      </button>

      <VoiceReceptionist open={open} onClose={() => setOpen(false)} />
    </>
  )
}
