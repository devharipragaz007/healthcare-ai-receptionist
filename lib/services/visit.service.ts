import {
  getAllVisits,
  getVisitById,
  getVisitByAppointmentId,
  getPatientVisits,
  createVisit as createVisitRepo,
  updateVisitNotes,
  updateVisitSummary,
  getRecentVisitsForDoctor,
} from "@/lib/repositories/visit.repository"
import {
  getAppointmentById,
  markAppointmentCompleted,
} from "@/lib/repositories/appointment.repository"
import { generateVisitSummary } from "@/lib/ai/visit-summary"

export class VisitServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NOT_FOUND"
      | "VALIDATION"
      | "CONFLICT"
      | "CANCELLED",
  ) {
    super(message)
    this.name = "VisitServiceError"
  }
}

export async function listVisits() {
  return getAllVisits()
}

export async function findVisit(id: string) {
  return getVisitById(id)
}

export async function findVisitByAppointment(appointmentId: string) {
  return getVisitByAppointmentId(appointmentId)
}

export async function listVisitsForPatient(patientId: string) {
  return getPatientVisits(patientId)
}

export async function saveVisitNotes(appointmentId: string, notes: string) {
  if (notes.trim().length < 20) {
    throw new VisitServiceError(
      "Visit notes must be at least 20 characters",
      "VALIDATION",
    )
  }

  const appointment = await getAppointmentById(appointmentId)
  if (!appointment) {
    throw new VisitServiceError(
      `Appointment not found: ${appointmentId}`,
      "NOT_FOUND",
    )
  }

  const existing = await getVisitByAppointmentId(appointmentId)
  if (existing) {
    return updateVisitNotes(existing.id, notes.trim())
  }
  return createVisitRepo({
    patientId: appointment.patientId,
    appointmentId,
    notes: notes.trim(),
  })
}

export async function completeVisit(appointmentId: string, notes: string) {
  if (notes.trim().length < 20) {
    throw new VisitServiceError(
      "Visit notes must be at least 20 characters",
      "VALIDATION",
    )
  }

  const appointment = await getAppointmentById(appointmentId)
  if (!appointment) {
    throw new VisitServiceError(
      `Appointment not found: ${appointmentId}`,
      "NOT_FOUND",
    )
  }

  if (appointment.status === "CANCELLED") {
    throw new VisitServiceError(
      "Cannot complete a cancelled appointment",
      "CANCELLED",
    )
  }

  const existing = await getVisitByAppointmentId(appointmentId)
  let visit
  if (existing) {
    visit = await updateVisitNotes(existing.id, notes.trim())
  } else {
    visit = await createVisitRepo({
      patientId: appointment.patientId,
      appointmentId,
      notes: notes.trim(),
    })
  }

  // Generate AI summary — failure must not block visit completion
  try {
    const { summary } = await generateVisitSummary(visit.notes)
    await updateVisitSummary(visit.id, summary)
  } catch (err) {
    console.error("[visit.service] AI summary generation failed:", err)
    await updateVisitSummary(visit.id, "Summary unavailable.")
  }

  return markAppointmentCompleted(appointmentId)
}

export async function regenerateSummary(appointmentId: string) {
  const visit = await getVisitByAppointmentId(appointmentId)
  if (!visit) {
    throw new VisitServiceError(
      `Visit not found for appointment: ${appointmentId}`,
      "NOT_FOUND",
    )
  }
  const { summary } = await generateVisitSummary(visit.notes)
  return updateVisitSummary(visit.id, summary)
}

export async function getVisit(appointmentId: string) {
  return getVisitByAppointmentId(appointmentId)
}

export async function getRecentVisits(doctorId: string, limit = 10) {
  return getRecentVisitsForDoctor(doctorId, limit)
}
