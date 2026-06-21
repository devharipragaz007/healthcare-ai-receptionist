# CareAI Receptionist

> An AI-powered healthcare receptionist and clinic workflow platform — voice-first patient intake, real-time appointment management, and AI-generated visit summaries.

---

## Overview

CareAI Receptionist replaces the clinic front desk with a conversational voice AI. Patients speak naturally to book, reschedule, or cancel appointments — no hold music, no forms, no friction. Behind the scenes, doctors get a clean workflow to manage their daily schedule, document clinical visits, and deliver AI-generated visit summaries back to patients.

This is a full-stack demonstration of what a modern healthcare platform looks like when voice AI, patient portals, and clinical tooling are built together from the ground up.

---

## Problem Statement

Healthcare clinics are operationally expensive at the front desk. A high percentage of inbound calls are appointment-related — scheduling, rescheduling, cancellations, and status checks. These calls:

- Require dedicated administrative staff during business hours
- Create hold times that erode patient satisfaction
- Generate no structured data without manual entry
- Leave patients with no self-service visibility into their own records

At the same time, the doctor-side of the workflow is fragmented. Clinical notes are captured in one system, appointment schedules in another, and patient-facing communication falls through the gaps entirely.

---

## Solution

CareAI Receptionist demonstrates three tightly integrated layers:

1. **Voice AI front desk** — a self-hosted voice agent that handles natural-language appointment management 24/7, with real-time tool calls into the clinic's scheduling system.
2. **Patient portal** — a live view of upcoming appointments, appointment history, and AI-generated plain-language visit summaries.
3. **Doctor workflow** — a schedule-driven dashboard where doctors open visits, enter clinical notes, complete appointments, and trigger AI summary generation automatically.

All three layers share a single data layer. A booking made through the voice AI appears immediately in both the patient portal and the doctor's dashboard.

---

## Core Capabilities

### Voice AI Receptionist

- **Natural language appointment booking** — patients speak in full sentences; the AI extracts intent, patient identity, doctor preference, date, and reason without a form
- **Appointment rescheduling** — change dates and times conversationally
- **Appointment cancellation** — cancel with a single spoken request
- **Appointment lookup** — ask the AI to read back upcoming appointments
- **Live tool calling** — every voice action writes to or reads from the live database in real time; no mock data
- **Real-time transcripts** — conversation transcript displayed in the UI as the call progresses

### Patient Experience

- View upcoming, past, and cancelled appointments in a unified portal
- Book appointments through voice or a self-service form
- Reschedule or cancel upcoming appointments directly from the portal
- Read AI-generated visit summaries after each completed appointment — plain language, no clinical jargon
- No access to raw clinical notes; patients receive only the curated summary

### Doctor Experience

- Daily schedule dashboard showing all active appointments sorted by time
- One-click navigation from appointment to visit page
- Clinical notes editor with draft-save support mid-visit
- One-click visit completion that triggers AI summary generation automatically
- Recent visits log with note previews
- Notes are preserved for completed visits and remain editable after completion

### AI Capabilities

- **Speech-to-speech voice interaction** — OpenAI Realtime API handles STT, reasoning, and TTS in a single pass with sub-second latency
- **Structured tool calling** — the voice model calls typed API endpoints to read and write appointments in real time during a conversation
- **Clinical note summarization** — GPT-4o-mini converts raw clinical notes into structured, patient-friendly visit summaries
- **Non-blocking AI generation** — summary generation is fire-and-forget; visit completion never fails due to an AI error; fallback text is stored if the model is unavailable

---

## End-to-End Workflow

```
Patient
  └─▶  Voice AI Receptionist  (natural language → structured booking)
         └─▶  Appointment Created  (live in database)
                └─▶  Doctor Dashboard  (appointment visible on schedule)
                       └─▶  Visit Page  (doctor opens, enters clinical notes)
                              └─▶  Complete Visit  (AI summary generated)
                                     └─▶  Patient Portal  (summary visible to patient)
```

The entire cycle — from voice booking to the patient reading their AI-generated visit summary — runs end-to-end in a single application with no external SaaS dependencies beyond the OpenAI API.

---

## Demo Personas

The application ships with pre-seeded demo data. No sign-up or configuration is required to explore either portal.

| Role | Name | Portal |
|---|---|---|
| Patient | James Harrington | `/patient` |
| Doctor | Dr. Anika Kumar | `/doctor` |

The seed dataset includes 10 patients, 3 doctors, 15 appointments across statuses, and 5 completed visits with clinical notes — enough context to demonstrate every feature without manual setup.

---

## Example User Journey

**Patient calls the AI receptionist:**

> "Hi, I'd like to book an appointment with Dr. Kumar. My name is James Harrington. I need to come in next Monday at 10am for a blood pressure check."

The AI confirms name, email, doctor, date, and reason through natural conversation. The appointment is written to the database in real time.

**Patient opens their portal (`/patient`):**

The new appointment appears immediately under Upcoming Appointments, with options to reschedule or cancel.

**Dr. Anika Kumar opens her dashboard (`/doctor`):**

James Harrington's appointment appears on her daily schedule. She clicks through to the visit page.

**Doctor documents the visit:**

> "Patient presents with elevated blood pressure at 148/92 mmHg. Reports increased stress over the past two weeks. No chest pain. Advised dietary changes and follow-up in 4 weeks."

She saves the notes and clicks **Complete Visit**.

**AI generates the visit summary automatically:**

The system calls GPT-4o-mini, which converts the clinical notes into a patient-friendly summary. The summary is stored alongside the visit record.

**Patient returns to their portal:**

Under Past Appointments, James sees a plain-language summary of his visit — diagnosis context, key observations, and follow-up guidance — without exposure to raw clinical terminology.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Web framework | Next.js (App Router, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ORM + database | Prisma + SQLite |
| Voice server | Pipecat (self-hosted Python) |
| Voice AI | OpenAI Realtime API (`gpt-4o-realtime-preview`) |
| Summary AI | OpenAI (`gpt-4o-mini`) |

---

## Why This Project Exists

CareAI Receptionist demonstrates end-to-end fluency across the technical domains that define modern healthcare SaaS:

- **Voice AI integration** — real-time speech-to-speech with live tool calling into a production data layer, not a demo sandbox
- **Healthcare data modeling** — appointments, visits, clinical notes, and patient records with enforced business rules (no past bookings, no double-cancels, status transitions)
- **Patient-facing product design** — portals that surface the right information at the right level of detail; patients see summaries, not raw clinical data
- **Doctor-facing workflow tooling** — schedule-driven UX with one-click visit management built around how clinicians actually work
- **AI-augmented clinical workflows** — automated note-to-summary generation that is non-blocking, fault-tolerant, and regenerable on demand
- **Full-stack ownership** — a single engineer-built system spanning a Python voice server, Next.js API layer, Prisma data model, and React portals for two distinct user roles
