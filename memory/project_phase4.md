---
name: project-phase4-pipecat
description: Phase 4 voice layer migrated from Vapi to Pipecat + OpenAI Realtime; architecture, key files, env vars
metadata:
  type: project
---

Phase 4 voice stack migrated from Vapi Cloud to self-hosted Pipecat + OpenAI Realtime.

**Why:** Replace the Vapi Cloud SaaS dependency with a self-hosted Python voice server.

**How to apply:** When touching voice components or APIs, reference the Pipecat architecture, not Vapi.

## What runs where
- `voice-server/bot.py` — Python Pipecat WebSocket server (port 8765 default)
- `components/pipecat/` — React modal, provider, status badge
- `app/api/tools/*` — Four Next.js endpoints (book, reschedule, cancel, get-appointments) called by Python bot

## Key env vars
- `NEXT_PUBLIC_PIPECAT_SERVER_URL` (browser) — ws://localhost:8765
- `OPENAI_API_KEY` (voice-server/.env) — for gpt-4o-realtime-preview
- `NEXT_APP_URL` (voice-server/.env) — http://localhost:3000

## Audio protocol
- Browser → server: raw PCM16, 16kHz, binary WebSocket frames
- Server → browser: WAV-wrapped PCM16 (`add_wav_header=True`), binary frames
- Server → browser: JSON text frames for transcripts and events

## Deleted
- `components/vapi/`, `lib/vapi/`, `app/api/vapi/`
- `@vapi-ai/web` npm package
- All VAPI_* env vars

## Status
Code complete. Voice verification requires Python env + OpenAI key with Realtime access.
