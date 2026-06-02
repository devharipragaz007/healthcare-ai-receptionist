import { z } from "zod"
import { AppointmentStatus } from "@/app/generated/prisma/enums"

export const appointmentSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  scheduledAt: z.coerce.date(),
  status: z.enum([
    AppointmentStatus.BOOKED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.RESCHEDULED,
  ]),
  reason: z.string().min(1),
})

export const appointmentUpdateSchema = appointmentSchema.partial()

export const bookAppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  scheduledAt: z.coerce.date(),
  reason: z.string().min(1, "Reason is required").max(500),
})

export const rescheduleAppointmentSchema = z.object({
  scheduledAt: z.coerce.date(),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>
export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>
export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>
export type RescheduleAppointmentInput = z.infer<
  typeof rescheduleAppointmentSchema
>
