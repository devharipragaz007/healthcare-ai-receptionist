"""CareAI voice receptionist — Pipecat + OpenAI Realtime bot.

Starts a WebSocket server on PIPECAT_PORT (default 8765).
The browser connects via WebSocket, sends PCM16 mic audio, and receives
WAV-wrapped PCM16 audio + JSON transcript messages back.

Each connected client gets the full conversation pipeline:
  WebSocket input → OpenAI Realtime (STT + LLM + TTS) → WebSocket output

Tools call the Next.js /api/tools/* endpoints so all business logic
stays in the Next.js service layer.
"""

import asyncio
import json
import os

import aiohttp
from dotenv import load_dotenv
from loguru import logger

from pipecat.adapters.schemas.function_schema import FunctionSchema
from pipecat.adapters.schemas.tools_schema import ToolsSchema
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_response_universal import (
    LLMContextAggregatorPair,
)
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.frames.frames import (
    BotStartedSpeakingFrame,
    BotStoppedSpeakingFrame,
    ErrorFrame,
    InputAudioRawFrame,
    InputTransportMessageFrame,
    InterimTranscriptionFrame,
    InterruptionFrame,
    OutputAudioRawFrame,
    OutputTransportMessageFrame,
    OutputTransportMessageUrgentFrame,
    TextFrame,
    TranscriptionFrame,
)
from pipecat.serializers.base_serializer import FrameSerializer
from pipecat.services.llm_service import FunctionCallParams
from pipecat.services.openai.realtime.llm import (
    OpenAIRealtimeLLMService,
    LLMContext,
    LLMContextFrame,
)
from pipecat.services.openai.realtime.events import (
    AudioConfiguration,
    AudioInput,
    InputAudioNoiseReduction,
    SessionProperties,
    InputAudioTranscription,
    TurnDetection,
)
from pipecat.transports.websocket.server import (
    WebsocketServerParams,
    WebsocketServerTransport,
)

load_dotenv()

NEXT_APP_URL = os.getenv("NEXT_APP_URL", "http://localhost:3000")
PIPECAT_PORT = int(os.getenv("PIPECAT_PORT", "8765"))

# Shared aiohttp session — created once, reused across all tool calls
_http_session: aiohttp.ClientSession | None = None


class BrowserFrameSerializer(FrameSerializer):
    """Bridge the browser's raw PCM + JSON protocol to Pipecat frames."""

    async def serialize(self, frame):
        if isinstance(frame, OutputAudioRawFrame):
            return frame.audio

        if isinstance(frame, TranscriptionFrame):
            return json.dumps(
                {
                    "type": "transcription",
                    "text": frame.text,
                    "final": frame.finalized,
                    "timestamp": frame.timestamp,
                }
            )

        if isinstance(frame, InterimTranscriptionFrame):
            return json.dumps(
                {
                    "type": "interim-transcription",
                    "text": frame.text,
                    "final": False,
                    "timestamp": frame.timestamp,
                }
            )

        if isinstance(frame, TextFrame):
            return json.dumps(
                {
                    "type": "bot-llm-text",
                    "text": frame.text,
                }
            )

        if isinstance(frame, BotStartedSpeakingFrame):
            return json.dumps({"type": "bot-started-speaking"})

        if isinstance(frame, BotStoppedSpeakingFrame):
            return json.dumps({"type": "bot-stopped-speaking"})

        if isinstance(frame, ErrorFrame):
            return json.dumps(
                {
                    "type": "error",
                    "message": frame.error,
                    "fatal": frame.fatal,
                }
            )

        if isinstance(frame, (OutputTransportMessageFrame, OutputTransportMessageUrgentFrame)):
            return json.dumps(frame.message)

        if isinstance(frame, InterruptionFrame):
            return json.dumps({"type": "interruption"})

        return None

    async def deserialize(self, data):
        if isinstance(data, bytes):
            return InputAudioRawFrame(audio=data, sample_rate=16000, num_channels=1)

        if not isinstance(data, str):
            return None

        try:
            payload = json.loads(data)
        except json.JSONDecodeError:
            logger.debug("Ignoring non-JSON text websocket frame from browser")
            return None

        if isinstance(payload, dict):
            return InputTransportMessageFrame(message=payload)

        return None


class UserTranscriptRelay(FrameProcessor):
    """Mirror upstream user transcription frames back to the browser."""

    async def process_frame(self, frame, direction):
        await super().process_frame(frame, direction)

        if direction is FrameDirection.UPSTREAM:
            if isinstance(frame, InterimTranscriptionFrame):
                await self.push_frame(
                    OutputTransportMessageFrame(
                        message={
                            "type": "interim-transcription",
                            "text": frame.text,
                            "final": False,
                            "timestamp": frame.timestamp,
                        }
                    ),
                    FrameDirection.DOWNSTREAM,
                )
            elif isinstance(frame, TranscriptionFrame):
                await self.push_frame(
                    OutputTransportMessageFrame(
                        message={
                            "type": "transcription",
                            "text": frame.text,
                            "final": frame.finalized,
                            "timestamp": frame.timestamp,
                        }
                    ),
                    FrameDirection.DOWNSTREAM,
                )

        await self.push_frame(frame, direction)


def get_http_session() -> aiohttp.ClientSession:
    global _http_session
    if _http_session is None or _http_session.closed:
        timeout = aiohttp.ClientTimeout(total=10)
        _http_session = aiohttp.ClientSession(timeout=timeout)
    return _http_session


SYSTEM_PROMPT = """You are CareAI, a professional AI healthcare receptionist for a medical clinic.

When the conversation starts, immediately greet the user with:
"Hello! I'm CareAI, your healthcare receptionist. I can help you book, reschedule, or cancel appointments, or review your upcoming visits. How can I help you today?"

You help patients with:
- Booking new appointments
- Rescheduling existing appointments
- Cancelling appointments
- Reviewing their upcoming and past appointments

Rules:
- Always gather ALL required information before invoking any tool.
- Be concise, warm, and professional.
- Do NOT provide medical advice or diagnoses.
- Only assist with appointment scheduling and management.
- When booking, always confirm the details with the patient before proceeding.
- When listing appointments, present them clearly with date, time, and doctor name.
- If a tool call fails, apologize briefly and offer to try again or suggest calling the clinic directly.
- Patient identification: ask for the patient's email address to look them up in the system.
- Available specializations: Cardiology, General Medicine, Dermatology."""

TOOLS = [
    {
        "type": "function",
        "name": "getAppointments",
        "description": (
            "Retrieve a patient's appointments (upcoming, past, and cancelled) "
            "using their email address."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "patientEmail": {
                    "type": "string",
                    "description": "The patient's email address.",
                },
            },
            "required": ["patientEmail"],
        },
    },
    {
        "type": "function",
        "name": "bookAppointment",
        "description": (
            "Book a new appointment for a patient. "
            "Confirm all details with the patient before calling this tool."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "patientEmail": {
                    "type": "string",
                    "description": "The patient's email address.",
                },
                "doctorName": {
                    "type": "string",
                    "description": "The doctor's last name or full name.",
                },
                "scheduledAt": {
                    "type": "string",
                    "description": (
                        "Appointment date and time in ISO 8601 format "
                        "(e.g. 2026-06-15T10:00:00)."
                    ),
                },
                "reason": {
                    "type": "string",
                    "description": "The reason for the appointment.",
                },
            },
            "required": ["patientEmail", "doctorName", "scheduledAt", "reason"],
        },
    },
    {
        "type": "function",
        "name": "rescheduleAppointment",
        "description": (
            "Reschedule an existing appointment to a new date and time. "
            "Use getAppointments first to find the appointment ID."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "appointmentId": {
                    "type": "string",
                    "description": "The ID of the appointment to reschedule.",
                },
                "scheduledAt": {
                    "type": "string",
                    "description": "The new appointment date and time in ISO 8601 format.",
                },
            },
            "required": ["appointmentId", "scheduledAt"],
        },
    },
    {
        "type": "function",
        "name": "cancelAppointment",
        "description": (
            "Cancel an existing appointment. "
            "Use getAppointments first to find the appointment ID."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "appointmentId": {
                    "type": "string",
                    "description": "The ID of the appointment to cancel.",
                },
            },
            "required": ["appointmentId"],
        },
    },
]


def build_tools_schema(tool_definitions: list[dict]) -> ToolsSchema:
    return ToolsSchema(
        [
            FunctionSchema(
                name=tool["name"],
                description=tool["description"],
                properties=tool["parameters"]["properties"],
                required=tool["parameters"]["required"],
            )
            for tool in tool_definitions
        ]
    )


TOOLS_SCHEMA = build_tools_schema(TOOLS)


async def _post_tool(path: str, args: dict) -> str:
    """Call a Next.js /api/tools/* endpoint and return the message string."""
    session = get_http_session()
    async with session.post(f"{NEXT_APP_URL}{path}", json=args) as resp:
        data = await resp.json()
    return data.get("message", "Tool call returned no message.")


async def handle_get_appointments(params: FunctionCallParams):
    try:
        result = await _post_tool("/api/tools/get-appointments", dict(params.arguments))
    except Exception as exc:
        logger.error(f"getAppointments failed: {exc}")
        result = "Failed to retrieve appointments. Please try again or call the clinic directly."
    await params.result_callback(result)


async def handle_book_appointment(params: FunctionCallParams):
    try:
        result = await _post_tool("/api/tools/book", dict(params.arguments))
    except Exception as exc:
        logger.error(f"bookAppointment failed: {exc}")
        result = "Failed to book the appointment. Please try again or call the clinic directly."
    await params.result_callback(result)


async def handle_reschedule_appointment(params: FunctionCallParams):
    try:
        result = await _post_tool("/api/tools/reschedule", dict(params.arguments))
    except Exception as exc:
        logger.error(f"rescheduleAppointment failed: {exc}")
        result = "Failed to reschedule. Please try again or call the clinic directly."
    await params.result_callback(result)


async def handle_cancel_appointment(params: FunctionCallParams):
    try:
        result = await _post_tool("/api/tools/cancel", dict(params.arguments))
    except Exception as exc:
        logger.error(f"cancelAppointment failed: {exc}")
        result = "Failed to cancel the appointment. Please try again or call the clinic directly."
    await params.result_callback(result)


async def main():
    transport = WebsocketServerTransport(
        params=WebsocketServerParams(
            audio_in_enabled=True,  # FIX: was missing — required to receive mic audio
            audio_out_enabled=True,
            add_wav_header=True,
            serializer=BrowserFrameSerializer(),
            # OpenAI Realtime uses server-side VAD; disable Pipecat VAD to avoid
            # double-processing. Re-enable with vad_analyzer=SileroVADAnalyzer()
            # if you need client-side VAD instead.
            vad_enabled=False,
        ),
        host="0.0.0.0",  # empty string may not bind on all OSes
        port=PIPECAT_PORT,
    )

    # FIX: explicitly configure server-side VAD and transcription via
    # SessionProperties so OpenAI Realtime activates them — without this the
    # Realtime API defaults may differ from what the bot expects.
    session_properties = SessionProperties(
        audio=AudioConfiguration(
            input=AudioInput(
                transcription=InputAudioTranscription(model="whisper-1"),
                noise_reduction=InputAudioNoiseReduction(type="near_field"),
                turn_detection=TurnDetection(
                    type="server_vad",
                    threshold=0.9,
                    prefix_padding_ms=300,
                    silence_duration_ms=1000,
                ),
            )
        ),
        input_audio_transcription=InputAudioTranscription(model="whisper-1"),
        turn_detection=TurnDetection(
            type="server_vad",
            threshold=0.72,
            prefix_padding_ms=200,
            silence_duration_ms=700,
        ),
        tools=TOOLS_SCHEMA,
        tool_choice="auto",
    )

    llm = OpenAIRealtimeLLMService(
        api_key=os.environ["OPENAI_API_KEY"],
        voice="alloy",
        settings=OpenAIRealtimeLLMService.Settings(
            model="gpt-realtime",
            system_instruction=SYSTEM_PROMPT,
            session_properties=session_properties,
        ),
    )

    llm.register_function("getAppointments", handle_get_appointments)
    llm.register_function("bookAppointment", handle_book_appointment)
    llm.register_function("rescheduleAppointment", handle_reschedule_appointment)
    llm.register_function("cancelAppointment", handle_cancel_appointment)

    # FIX: build context with the system prompt so the greeting trigger works
    context = LLMContext(
        messages=[],
        tools=TOOLS_SCHEMA,
    )
    context_aggregator = LLMContextAggregatorPair(context)
    user_transcript_relay = UserTranscriptRelay()

    pipeline = Pipeline(
        [
            transport.input(),
            context_aggregator.user(),
            user_transcript_relay,
            llm,
            transport.output(),
            context_aggregator.assistant(),
        ]
    )

    task = PipelineTask(
        pipeline,
        params=PipelineParams(allow_interruptions=True),
    )

    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        logger.info("Client connected — queuing context frame to trigger greeting")
        await task.queue_frames([LLMContextFrame(context=context)])

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        logger.info("Client disconnected")
        # Close the shared HTTP session when the last client leaves.
        # For multi-client servers, move this to a server shutdown hook instead.
        global _http_session
        if _http_session and not _http_session.closed:
            await _http_session.close()

    runner = PipelineRunner()
    logger.info(f"CareAI voice server listening on ws://0.0.0.0:{PIPECAT_PORT}")
    await runner.run(task)


if __name__ == "__main__":
    asyncio.run(main())
