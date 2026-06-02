export const APP_NAME = "CareAI Receptionist"
export const APP_TAGLINE = "AI Powered Healthcare Receptionist"
export const APP_DESCRIPTION =
  "Book appointments, reschedule visits, cancel appointments, and access visit history through a conversational AI assistant."

export const HERO_HEADLINE = "Your AI Front Desk for Modern Clinics"
export const HERO_DESCRIPTION =
  "Reduce administrative overhead and provide patients with instant access to appointment management through voice and AI."

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Patient Portal", href: "/patient" },
  { label: "Doctor Portal", href: "/doctor" },
  { label: "Debug", href: "/debug" },
] as const satisfies ReadonlyArray<{ label: string; href: string }>

export const FEATURES = [
  {
    title: "Appointment Scheduling",
    description:
      "Patients can book new appointments through natural conversation without navigating complex forms.",
  },
  {
    title: "Appointment Rescheduling",
    description:
      "Easily move appointments to a new time with a simple voice or text request to the AI receptionist.",
  },
  {
    title: "Visit History Access",
    description:
      "Patients can review past visits, treatment notes, and appointment records at any time.",
  },
  {
    title: "AI Powered Front Desk",
    description:
      "An intelligent receptionist available 24/7, handling routine scheduling so clinic staff can focus on care.",
  },
] as const satisfies ReadonlyArray<{ title: string; description: string }>

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Talk to AI Receptionist",
    description:
      "Start a conversation through voice or text. The AI understands your scheduling needs instantly.",
  },
  {
    step: 2,
    title: "Manage Appointment",
    description:
      "Book, reschedule, or cancel appointments. Review your visit history — all within a single interaction.",
  },
  {
    step: 3,
    title: "Meet Your Doctor",
    description:
      "Arrive at your confirmed appointment. The clinic has everything prepared before you walk through the door.",
  },
] as const satisfies ReadonlyArray<{
  step: number
  title: string
  description: string
}>

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  BOOKED: "Booked",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RESCHEDULED: "Rescheduled",
}

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  BOOKED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RESCHEDULED: "bg-yellow-100 text-yellow-800",
}

export const DOCTOR_SPECIALIZATIONS = [
  "Cardiology",
  "General Medicine",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery",
  "Oncology",
] as const

export type DoctorSpecialization = (typeof DOCTOR_SPECIALIZATIONS)[number]
