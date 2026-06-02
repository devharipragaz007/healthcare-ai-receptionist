import Link from "next/link"

type PatientName = {
  firstName: string
  lastName: string
}

type VisitAppointment = {
  id: string
}

type RecentVisit = {
  id: string
  notes: string
  createdAt: Date
  patient: PatientName
  appointment: VisitAppointment
}

type Props = {
  visits: RecentVisit[]
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function RecentVisits({ visits }: Props) {
  if (visits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-10 text-center">
        <p className="text-sm font-medium text-gray-500">No recent visits</p>
        <p className="mt-1 text-xs text-gray-400">Completed visit notes will appear here.</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {visits.map((visit) => (
        <li key={visit.id}>
          <Link
            href={`/doctor/visits/${visit.appointment.id}`}
            className="block py-4 hover:bg-gray-50 -mx-1 px-1 rounded-md transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-semibold text-gray-900">
                {visit.patient.firstName} {visit.patient.lastName}
              </p>
              <p className="shrink-0 text-xs text-gray-400">{formatDate(visit.createdAt)}</p>
            </div>
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{visit.notes}</p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
