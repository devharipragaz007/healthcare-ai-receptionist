import { NextResponse } from "next/server"
import { getPatientByEmail } from "@/lib/services/patient.service"
import { getDoctorByName } from "@/lib/services/doctor.service"
import { bookAppointment, AppointmentServiceError } from "@/lib/services/appointment.service"

export async function POST(request: Request) {
  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { patientEmail, doctorName, scheduledAt, reason } = body

  if (!patientEmail || !doctorName || !scheduledAt || !reason) {
    return NextResponse.json({
      message: "Missing required fields: patientEmail, doctorName, scheduledAt, reason.",
    })
  }

  try {
    const patient = await getPatientByEmail(patientEmail)
    if (!patient) {
      return NextResponse.json({
        message: `No patient found with email ${patientEmail}. Please verify the email address.`,
      })
    }

    const { match: doctor, all: doctors } = await getDoctorByName(doctorName)
    if (!doctor) {
      const names = doctors
        .map((d) => `Dr. ${d.firstName} ${d.lastName} (${d.specialization})`)
        .join(", ")
      return NextResponse.json({
        message: `No doctor found matching "${doctorName}". Available doctors: ${names}.`,
      })
    }

    const date = new Date(scheduledAt)
    if (isNaN(date.getTime())) {
      return NextResponse.json({
        message: `Invalid date format: "${scheduledAt}". Please provide a valid ISO 8601 date and time.`,
      })
    }

    const appointment = await bookAppointment({
      patientId: patient.id,
      doctorId: doctor.id,
      scheduledAt: date,
      reason,
    })

    return NextResponse.json({
      message: `Appointment booked successfully! Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization}) on ${formatDate(appointment.scheduledAt)}. Reason: ${appointment.reason}. Appointment ID: ${appointment.id}.`,
    })
  } catch (err) {
    if (err instanceof AppointmentServiceError && err.code === "PAST_DATE") {
      return NextResponse.json({
        message: "The requested time is in the past. Please choose a future date and time.",
      })
    }
    console.error("[api/tools/book]", err)
    return NextResponse.json({
      message: "Failed to book the appointment. Please try again or call the clinic directly.",
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
