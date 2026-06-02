import { countPatients } from "@/lib/repositories/patient.repository"
import { countDoctors } from "@/lib/repositories/doctor.repository"
import { countAppointments } from "@/lib/repositories/appointment.repository"
import { countVisits } from "@/lib/repositories/visit.repository"

export default async function DebugPage() {
  const [patients, doctors, appointments, visits] = await Promise.all([
    countPatients(),
    countDoctors(),
    countAppointments(),
    countVisits(),
  ])

  const stats = [
    { label: "Patients", count: patients },
    { label: "Doctors", count: doctors },
    { label: "Appointments", count: appointments },
    { label: "Visits", count: visits },
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Database Debug
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Temporary page — Phase 1 seed verification.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {stats.map(({ label, count }) => (
          <div
            key={label}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-4xl font-bold text-gray-900">{count}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
