import { NextResponse } from "next/server"
import { getPatientByEmail } from "@/lib/services/patient.service"
import { getPatientAppointments } from "@/lib/services/appointment.service"

export async function POST(request: Request) {
  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { patientEmail } = body

  if (!patientEmail) {
    return NextResponse.json({
      message: "Please provide your email address so I can look up your appointments.",
    })
  }

  try {
    const patient = await getPatientByEmail(patientEmail)
    if (!patient) {
      return NextResponse.json({
        message: `No patient found with email ${patientEmail}. Please check the email and try again.`,
      })
    }

    const { upcoming, past, cancelled } = await getPatientAppointments(patient.id)

    const parts: string[] = [`Found appointments for ${patient.firstName} ${patient.lastName}:`]

    if (upcoming.length > 0) {
      parts.push("\nUpcoming:")
      for (const a of upcoming) {
        parts.push(
          `  - ID: ${a.id} | ${formatDate(a.scheduledAt)} | Dr. ${a.doctor.lastName} (${a.doctor.specialization}) | Reason: ${a.reason}`,
        )
      }
    } else {
      parts.push("\nNo upcoming appointments.")
    }

    if (past.length > 0) {
      parts.push("\nPast:")
      for (const a of past) {
        parts.push(
          `  - ID: ${a.id} | ${formatDate(a.scheduledAt)} | Dr. ${a.doctor.lastName} | ${a.status}`,
        )
      }
    }

    if (cancelled.length > 0) {
      parts.push("\nCancelled:")
      for (const a of cancelled) {
        parts.push(`  - ID: ${a.id} | ${formatDate(a.scheduledAt)} | Dr. ${a.doctor.lastName}`)
      }
    }

    return NextResponse.json({ message: parts.join("\n") })
  } catch (err) {
    console.error("[api/tools/get-appointments]", err)
    return NextResponse.json({
      message: "Failed to retrieve appointments. Please try again or call the clinic directly.",
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
