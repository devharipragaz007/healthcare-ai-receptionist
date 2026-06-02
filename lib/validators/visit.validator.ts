import { z } from "zod"

export const visitSchema = z.object({
  patientId: z.string().min(1),
  appointmentId: z.string().min(1),
  notes: z.string().min(1),
  summary: z.string().optional(),
})

export const visitNotesSchema = z.object({
  appointmentId: z.string().min(1),
  notes: z
    .string()
    .min(20, "Visit notes must be at least 20 characters"),
})

export const visitUpdateSchema = visitSchema.partial()

export type VisitInput = z.infer<typeof visitSchema>
export type VisitNotesInput = z.infer<typeof visitNotesSchema>
export type VisitUpdateInput = z.infer<typeof visitUpdateSchema>
