import { NextResponse } from "next/server"
import { AppointmentServiceError } from "@/lib/services/appointment.service"

export function apiError(message: string, status: number, details?: unknown) {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status })
}

export function serviceErrorToResponse(err: unknown): NextResponse {
  if (err instanceof AppointmentServiceError) {
    switch (err.code) {
      case "NOT_FOUND":
        return apiError(err.message, 404)
      case "PAST_DATE":
      case "CONFLICT":
      case "VALIDATION":
        return apiError(err.message, 400)
      case "ALREADY_CANCELLED":
        return apiError(err.message, 409)
    }
  }
  console.error(err)
  return apiError("Internal server error", 500)
}
