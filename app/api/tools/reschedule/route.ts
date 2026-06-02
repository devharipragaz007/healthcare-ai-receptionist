import { NextResponse } from "next/server"
import { rescheduleAppointment, AppointmentServiceError } from "@/lib/services/appointment.service"

export async function POST(request: Request) {
  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { appointmentId, scheduledAt } = body

  if (!appointmentId || !scheduledAt) {
    return NextResponse.json({
      message: "Please provide appointmentId and the new scheduledAt date and time.",
    })
  }

  const date = new Date(scheduledAt)
  if (isNaN(date.getTime())) {
    return NextResponse.json({
      message: `Invalid date format: "${scheduledAt}". Please provide a valid ISO 8601 date and time.`,
    })
  }

  try {
    const appointment = await rescheduleAppointment(appointmentId, date)
    return NextResponse.json({
      message: `Appointment rescheduled successfully! New time: ${formatDate(appointment.scheduledAt)}. Dr. ${appointment.doctor.lastName}. Appointment ID: ${appointment.id}.`,
    })
  } catch (err) {
    if (err instanceof AppointmentServiceError) {
      if (err.code === "NOT_FOUND") {
        return NextResponse.json({
          message: `Appointment ID "${appointmentId}" was not found. Please check the ID and try again.`,
        })
      }
      if (err.code === "ALREADY_CANCELLED") {
        return NextResponse.json({
          message: "This appointment has already been cancelled and cannot be rescheduled.",
        })
      }
      if (err.code === "PAST_DATE") {
        return NextResponse.json({
          message: "The new time is in the past. Please choose a future date and time.",
        })
      }
    }
    console.error("[api/tools/reschedule]", err)
    return NextResponse.json({
      message: "Failed to reschedule the appointment. Please try again or call the clinic directly.",
    })
  }
}

function formatDate(date: Date) {
  return new Date(date).toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}
