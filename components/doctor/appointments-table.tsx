import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from "@/lib/constants"

type Patient = {
  firstName: string
  lastName: string
}

type Appointment = {
  id: string
  scheduledAt: Date
  reason: string
  status: string
  patient: Patient
}

type Props = {
  appointments: Appointment[]
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function AppointmentsTable({ appointments }: Props) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-10 text-center">
        <p className="text-sm font-medium text-gray-500">No appointments scheduled</p>
        <p className="mt-1 text-xs text-gray-400">Upcoming appointments will appear here.</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {appointments.map((appt) => (
        <li key={appt.id}>
          <Link
            href={`/doctor/visits/${appt.id}`}
            className="flex items-start justify-between gap-4 py-4 hover:bg-gray-50 -mx-1 px-1 rounded-md transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {appt.patient.firstName} {appt.patient.lastName}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 truncate">{appt.reason}</p>
              <p className="mt-1 text-xs text-gray-400">{formatTime(appt.scheduledAt)}</p>
            </div>
            <Badge className={APPOINTMENT_STATUS_COLORS[appt.status]}>
              {APPOINTMENT_STATUS_LABELS[appt.status]}
            </Badge>
          </Link>
        </li>
      ))}
    </ul>
  )
}
