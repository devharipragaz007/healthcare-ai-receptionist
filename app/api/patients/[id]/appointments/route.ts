import { NextRequest, NextResponse } from "next/server"
import { getPatientAppointments } from "@/lib/services/appointment.service"
import { serviceErrorToResponse } from "@/lib/api-response"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const appointments = await getPatientAppointments(id)
    return NextResponse.json(appointments)
  } catch (err) {
    return serviceErrorToResponse(err)
  }
}
