import { NextRequest, NextResponse } from "next/server"
import { rescheduleAppointmentSchema } from "@/lib/validators/appointment.validator"
import {
  rescheduleAppointment,
  cancelAppointment,
} from "@/lib/services/appointment.service"
import { apiError, serviceErrorToResponse } from "@/lib/api-response"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError("Invalid JSON body", 400)
  }

  const result = rescheduleAppointmentSchema.safeParse(body)
  if (!result.success) {
    return apiError("Validation failed", 400, result.error.flatten().fieldErrors)
  }

  try {
    const appointment = await rescheduleAppointment(id, result.data.scheduledAt)
    return NextResponse.json(appointment)
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const appointment = await cancelAppointment(id)
    return NextResponse.json(appointment)
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
