import { NextResponse } from "next/server"
import { cancelAppointment, AppointmentServiceError } from "@/lib/services/appointment.service"

export async function POST(request: Request) {
  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { appointmentId } = body

  if (!appointmentId) {
    return NextResponse.json({
      message: "Please provide the appointmentId to cancel.",
    })
  }

  try {
    const appointment = await cancelAppointment(appointmentId)
    return NextResponse.json({
      message: `Appointment cancelled successfully. The appointment with Dr. ${appointment.doctor.lastName} on ${formatDate(appointment.scheduledAt)} has been cancelled.`,
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
          message: "This appointment has already been cancelled.",
        })
      }
    }
    console.error("[api/tools/cancel]", err)
    return NextResponse.json({
      message: "Failed to cancel the appointment. Please try again or call the clinic directly.",
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
