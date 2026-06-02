"use server"

import { revalidatePath } from "next/cache"
import {
  saveVisitNotes,
  completeVisit,
  regenerateSummary,
  VisitServiceError,
} from "@/lib/services/visit.service"

export type ActionResult =
  | { success: true; message: string }
  | { success: false; message: string }

export async function saveVisitNotesAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const appointmentId = formData.get("appointmentId") as string | null
  const notes = formData.get("notes") as string | null

  if (!appointmentId) return { success: false, message: "Appointment ID is required." }
  if (!notes) return { success: false, message: "Visit notes are required." }

  try {
    await saveVisitNotes(appointmentId, notes)
    revalidatePath(`/doctor/visits/${appointmentId}`)
    revalidatePath("/doctor")
    return { success: true, message: "Visit notes saved." }
  } catch (err) {
    if (err instanceof VisitServiceError) return { success: false, message: err.message }
    return { success: false, message: "Unable to save visit notes." }
  }
}

export async function completeVisitAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const appointmentId = formData.get("appointmentId") as string | null
  const notes = formData.get("notes") as string | null

  if (!appointmentId) return { success: false, message: "Appointment ID is required." }
  if (!notes) return { success: false, message: "Visit notes are required." }

  try {
    await completeVisit(appointmentId, notes)
    revalidatePath("/doctor")
    revalidatePath(`/doctor/visits/${appointmentId}`)
    revalidatePath("/patient")
    return { success: true, message: "Visit completed." }
  } catch (err) {
    if (err instanceof VisitServiceError) return { success: false, message: err.message }
    return { success: false, message: "Unable to complete visit." }
  }
}

export async function regenerateVisitSummaryAction(
  appointmentId: string,
): Promise<ActionResult> {
  try {
    await regenerateSummary(appointmentId)
    revalidatePath(`/doctor/visits/${appointmentId}`)
    return { success: true, message: "Summary generated." }
  } catch (err) {
    if (err instanceof VisitServiceError) return { success: false, message: err.message }
    return { success: false, message: "Regeneration failed." }
  }
}
