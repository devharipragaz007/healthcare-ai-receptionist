# CareAI Receptionist

> AI-powered healthcare receptionist for modern clinics.

---

## Project Overview

CareAI Receptionist demonstrates a modern healthcare workflow powered by voice AI and intelligent automation. Patients interact with a conversational AI to:

- Book appointments
- Reschedule appointments
- Cancel appointments
- Access visit history

Designed to reduce administrative overhead for clinic staff while giving patients instant, 24/7 access to their healthcare scheduling.

---

## Vision

A fully voice-enabled AI receptionist that integrates with clinic scheduling systems and surfaces AI-generated visit summaries for doctors — all in a clean, accessible web interface.

---

## Current Progress

| Phase | Status |
|---|---|
| Phase 0 — Project Setup | Complete |
| Phase 1 — Data Model | Complete |
| Phase 2 — Landing Page & AI Receptionist Experience | Complete |
| Phase 3 — Appointment APIs & Patient Portal | Complete |
| Phase 4 — Pipecat Voice Receptionist | Code Complete — Voice Verification Pending |
| Phase 5 — Doctor Workflow and Visit Management | Complete |
| Phase 6 — AI Visit Summary Generation | Complete |
| Phase 7 — Realtime Updates + Production Readiness | Next |
| Phase 8 — Demo Polish | Planned |
| Phase 9 — Deployment | Planned |

See [docs/roadmap.md](docs/roadmap.md) for full phase details.

---

## Tech Stack

### Frontend
- [Next.js 16](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/) (strict mode)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (base-ui variant)
- [Lucide React](https://lucide.dev/) (icons)

### Backend
- Next.js Route Handlers + Server Actions

### Database
- [Prisma 7](https://www.prisma.io/) ORM
- SQLite (via `better-sqlite3` + `@prisma/adapter-better-sqlite3`)

### AI / Voice
- [Pipecat](https://github.com/pipecat-ai/pipecat) — self-hosted Python voice server
- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime) — `gpt-4o-realtime-preview` (speech-to-speech)
- [OpenAI](https://openai.com/) — `gpt-4o-mini` for AI visit summary generation (Phase 6)

---

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.10+
- npm

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

At minimum populate:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_PIPECAT_SERVER_URL="ws://localhost:8765"
```

### Database Commands

```bash
npm run db:generate   # regenerate Prisma client after schema changes
npx prisma migrate deploy
npm run db:seed       # 10 patients, 3 doctors, 15 appointments, 5 visits
```

### Run the Next.js Dev Server

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

### Run the Pipecat Voice Server

```bash
cd voice-server
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # add your OPENAI_API_KEY
python bot.py
```

Voice server listens at `ws://localhost:8765`.

---

## Routes & API

| Route / Endpoint | Type | Description |
|---|---|---|
| `/` | Server | Landing page — Hero, Features, HowItWorks |
| `/patient` | Server | Patient portal — upcoming/past/cancelled appointments |
| `/doctor` | Server | Doctor dashboard — today's schedule, recent visits |
| `/doctor/visits/[appointmentId]` | Server | Visit detail + note editor |
| `/debug` | Server | DB entity counts |
| `POST /api/appointments` | Route | Book appointment |
| `PATCH /api/appointments/[id]` | Route | Reschedule appointment |
| `DELETE /api/appointments/[id]` | Route | Cancel appointment |
| `GET /api/patients/[id]/appointments` | Route | Get patient appointments |
| `POST /api/tools/book` | Route | Voice tool — book appointment |
| `POST /api/tools/reschedule` | Route | Voice tool — reschedule appointment |
| `POST /api/tools/cancel` | Route | Voice tool — cancel appointment |
| `POST /api/tools/get-appointments` | Route | Voice tool — list patient appointments |

---

## Voice Architecture

See [docs/pipecat-architecture.md](docs/pipecat-architecture.md) for the full voice architecture, audio protocol, and deployment guide.

**Quick summary:**
- Browser opens a WebSocket to the Pipecat server
- Microphone audio → PCM16 → WebSocket → Pipecat → OpenAI Realtime API
- OpenAI Realtime handles STT + LLM + TTS in one speech-to-speech pass
- Tool calls → Pipecat → HTTP POST to `/api/tools/*` → Next.js service layer → SQLite

---

### Lint and Build

```bash
npm run lint
npm run build
```

---

## Project Phases

See [docs/roadmap.md](docs/roadmap.md) for a full breakdown of each phase.

- [Phase 0](docs/phase-0.md) — Project setup, database foundation, UI shell
- [Phase 1](docs/phase-1.md) — Healthcare data model, repositories, validators, services
- [Phase 2](docs/phase-2.md) — Landing page, brand, portal shells, documentation
- [Phase 3](docs/phase-3.md) — Appointment APIs, patient portal, booking/reschedule/cancel
- [Phase 4](docs/phase-4.md) — Pipecat voice receptionist, tool endpoints, transcript display
- [Phase 5](docs/phase-5.md) — Doctor workflow, visit management, patient portal enhancement
- [Phase 6](docs/phase-6.md) — AI visit summary generation, regenerate action, patient summary view
- [Pipecat Architecture](docs/pipecat-architecture.md) — Voice stack deep-dive
- [Demo Script](docs/demo-script.md) — founder demo walkthrough
