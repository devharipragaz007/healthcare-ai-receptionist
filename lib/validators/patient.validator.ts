import { z } from "zod"

export const patientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  dateOfBirth: z.coerce.date(),
})

export const patientUpdateSchema = patientSchema.partial()

export type PatientInput = z.infer<typeof patientSchema>
export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>
