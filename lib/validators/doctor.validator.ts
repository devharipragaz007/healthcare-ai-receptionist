import { z } from "zod"
import { DOCTOR_SPECIALIZATIONS } from "@/lib/constants"

export const doctorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  specialization: z.enum(DOCTOR_SPECIALIZATIONS),
  email: z.string().email(),
})

export const doctorUpdateSchema = doctorSchema.partial()

export type DoctorInput = z.infer<typeof doctorSchema>
export type DoctorUpdateInput = z.infer<typeof doctorUpdateSchema>
