"use server"

import { revalidatePath } from "next/cache"
import {
  bookAppointment,
  rescheduleAppointment,
  cancelAppointment,
  AppointmentServiceError,
} from "@/lib/services/appointment.service"
import {
  bookAppointmentSchema,
  rescheduleAppointmentSchema,
} from "@/lib/validators/appointment.validator"

export type ActionResult =
  | { success: true; message: string }
  | { success: false; message: string }

export async function bookAppointmentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    patientId: formData.get("patientId"),
    doctorId: formData.get("doctorId"),
    scheduledAt: formData.get("scheduledAt"),
    reason: formData.get("reason"),
  }

  const result = bookAppointmentSchema.safeParse(raw)
  if (!result.success) {
    const first = Object.values(result.error.flatten().fieldErrors)[0]?.[0]
    return { success: false, message: first ?? "Invalid input" }
  }

  try {
    await bookAppointment(result.data)
    revalidatePath("/patient")
    return { success: true, message: "Appointment scheduled successfully." }
  } catch (err) {
    if (err instanceof AppointmentServiceError) {
      return { success: false, message: err.message }
    }
    return { success: false, message: "Unable to schedule appointment." }
  }
}

export async function rescheduleAppointmentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const appointmentId = formData.get("appointmentId") as string | null
  if (!appointmentId) {
    return { success: false, message: "Appointment ID is required." }
  }

  const raw = { scheduledAt: formData.get("scheduledAt") }
  const result = rescheduleAppointmentSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, message: "A valid future date is required." }
  }

  try {
    await rescheduleAppointment(appointmentId, result.data.scheduledAt)
    revalidatePath("/patient")
    return { success: true, message: "Appointment rescheduled successfully." }
  } catch (err) {
    if (err instanceof AppointmentServiceError) {
      return { success: false, message: err.message }
    }
    return { success: false, message: "Unable to reschedule appointment." }
  }
}

export async function cancelAppointmentAction(
  appointmentId: string,
): Promise<ActionResult> {
  try {
    await cancelAppointment(appointmentId)
    revalidatePath("/patient")
    return { success: true, message: "Appointment cancelled." }
  } catch (err) {
    if (err instanceof AppointmentServiceError) {
      return { success: false, message: err.message }
    }
    return { success: false, message: "Unable to cancel appointment." }
  }
}
