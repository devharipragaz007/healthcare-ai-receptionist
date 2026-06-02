import {
  getAllAppointments,
  getAppointmentById,
  getUpcomingAppointments,
  getCompletedAppointments,
  getAppointmentsByPatientId,
  getAppointmentsByDoctorId,
  createAppointment,
  updateAppointmentSchedule,
  cancelAppointment as cancelAppointmentRepo,
} from "@/lib/repositories/appointment.repository"
import { getPatientById } from "@/lib/repositories/patient.repository"
import { getDoctorById } from "@/lib/repositories/doctor.repository"

export class AppointmentServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NOT_FOUND"
      | "VALIDATION"
      | "CONFLICT"
      | "PAST_DATE"
      | "ALREADY_CANCELLED",
  ) {
    super(message)
    this.name = "AppointmentServiceError"
  }
}

export async function listAppointments() {
  return getAllAppointments()
}

export async function findAppointment(id: string) {
  return getAppointmentById(id)
}

export async function listUpcomingAppointments() {
  return getUpcomingAppointments()
}

export async function listCompletedAppointments() {
  return getCompletedAppointments()
}

export async function listAppointmentsForPatient(patientId: string) {
  return getAppointmentsByPatientId(patientId)
}

export async function listAppointmentsForDoctor(doctorId: string) {
  return getAppointmentsByDoctorId(doctorId)
}

export async function bookAppointment(data: {
  patientId: string
  doctorId: string
  scheduledAt: Date
  reason: string
}) {
  if (data.scheduledAt <= new Date()) {
    throw new AppointmentServiceError(
      "Appointment must be scheduled in the future",
      "PAST_DATE",
    )
  }

  const patient = await getPatientById(data.patientId)
  if (!patient) {
    throw new AppointmentServiceError(
      `Patient not found: ${data.patientId}`,
      "NOT_FOUND",
    )
  }

  const doctor = await getDoctorById(data.doctorId)
  if (!doctor) {
    throw new AppointmentServiceError(
      `Doctor not found: ${data.doctorId}`,
      "NOT_FOUND",
    )
  }

  return createAppointment(data)
}

export async function rescheduleAppointment(id: string, scheduledAt: Date) {
  const appointment = await getAppointmentById(id)
  if (!appointment) {
    throw new AppointmentServiceError(
      `Appointment not found: ${id}`,
      "NOT_FOUND",
    )
  }

  if (appointment.status === "CANCELLED") {
    throw new AppointmentServiceError(
      "Cannot reschedule a cancelled appointment",
      "ALREADY_CANCELLED",
    )
  }

  if (scheduledAt <= new Date()) {
    throw new AppointmentServiceError(
      "New appointment time must be in the future",
      "PAST_DATE",
    )
  }

  return updateAppointmentSchedule(id, scheduledAt)
}

export async function cancelAppointment(id: string) {
  const appointment = await getAppointmentById(id)
  if (!appointment) {
    throw new AppointmentServiceError(
      `Appointment not found: ${id}`,
      "NOT_FOUND",
    )
  }

  if (appointment.status === "CANCELLED") {
    throw new AppointmentServiceError(
      "Appointment is already cancelled",
      "ALREADY_CANCELLED",
    )
  }

  return cancelAppointmentRepo(id)
}

export async function getPatientAppointments(patientId: string) {
  const patient = await getPatientById(patientId)
  if (!patient) {
    throw new AppointmentServiceError(
      `Patient not found: ${patientId}`,
      "NOT_FOUND",
    )
  }

  const all = await getAppointmentsByPatientId(patientId)
  const now = new Date()

  const upcoming = all.filter(
    (a) =>
      (a.status === "BOOKED" || a.status === "RESCHEDULED") &&
      a.scheduledAt > now,
  )

  const past = all.filter(
    (a) =>
      a.status === "COMPLETED" ||
      ((a.status === "BOOKED" || a.status === "RESCHEDULED") &&
        a.scheduledAt <= now),
  )

  const cancelled = all.filter((a) => a.status === "CANCELLED")

  return { upcoming, past, cancelled }
}
