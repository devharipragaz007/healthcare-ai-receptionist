import { NextRequest, NextResponse } from "next/server"
import { bookAppointmentSchema } from "@/lib/validators/appointment.validator"
import { bookAppointment } from "@/lib/services/appointment.service"
import { apiError, serviceErrorToResponse } from "@/lib/api-response"

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError("Invalid JSON body", 400)
  }

  const result = bookAppointmentSchema.safeParse(body)
  if (!result.success) {
    return apiError("Validation failed", 400, result.error.flatten().fieldErrors)
  }

  try {
    const appointment = await bookAppointment(result.data)
    return NextResponse.json(appointment, { status: 201 })
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
