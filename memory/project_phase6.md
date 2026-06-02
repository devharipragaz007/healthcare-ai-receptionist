---
name: project-phase6-ai-summary
description: Phase 6 AI visit summary — OpenAI gpt-4o-mini, lib/ai/ module, completeVisit flow, doctor/patient summary cards
metadata:
  type: project
---

Phase 6 implemented AI visit summary generation using OpenAI `gpt-4o-mini`.

**Why:** Demonstrate healthcare-specific AI functionality — convert clinical notes into patient-friendly structured summaries.

**How to apply:** When touching visit completion or summary display, understand the full flow below.

## New files
- `lib/ai/openai.ts` — lazy singleton OpenAI client (throws if `OPENAI_API_KEY` missing)
- `lib/ai/prompts.ts` — `VISIT_SUMMARY_SYSTEM_PROMPT` constant
- `lib/ai/visit-summary.ts` — `generateVisitSummary(notes)` → `{ summary }`
- `components/doctor/visit-summary-card.tsx` — read-only card + Regenerate button
- `components/patient/visit-summary-card.tsx` — patient-facing summary card

## Modified files
- `lib/repositories/visit.repository.ts` — added `updateVisitSummary(id, summary)`
- `lib/services/visit.service.ts` — `completeVisit()` now calls AI and stores summary; added `regenerateSummary(appointmentId)`
- `app/doctor/actions.ts` — added `regenerateVisitSummaryAction(appointmentId)`
- `app/doctor/visits/[appointmentId]/page.tsx` — shows `DoctorVisitSummaryCard` for completed visits
- `app/patient/page.tsx` — shows `PatientVisitSummaryCard` instead of raw notes for completed appointments

## Key decisions
- `Visit.summary` field already existed in schema — no migration required
- AI failure is non-blocking: try/catch in `completeVisit()` stores `"Summary unavailable."` and continues
- `OPENAI_API_KEY` stays optional in env schema; missing key is caught in the service
- Model: `gpt-4o-mini`, `temperature: 0.1`, `max_tokens: 600`
- Patients never see raw clinical notes — only the AI-generated summary

## Status
Build and lint pass. Voice server unaffected. All existing features preserved.
