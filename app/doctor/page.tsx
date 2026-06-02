export const dynamic = "force-dynamic"

import { CalendarDays, FileText } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { getDoctorByEmail } from "@/lib/repositories/doctor.repository"
import { getDoctorAppointments } from "@/lib/repositories/appointment.repository"
import { getRecentVisits } from "@/lib/services/visit.service"
import { AppointmentsTable } from "@/components/doctor/appointments-table"
import { RecentVisits } from "@/components/doctor/recent-visits"

const DEMO_DOCTOR_EMAIL = "a.kumar@healthclinic.com"

export default async function DoctorPortalPage() {
  const doctor = await getDoctorByEmail(DEMO_DOCTOR_EMAIL)

  if (!doctor) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-red-600">Demo doctor not found. Please re-run the seed.</p>
      </div>
    )
  }

  const [appointments, recentVisits] = await Promise.all([
    getDoctorAppointments(doctor.id),
    getRecentVisits(doctor.id, 10),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Portal</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome, Dr. {doctor.firstName} {doctor.lastName} &mdash;{" "}
          {doctor.specialization}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-blue-700" aria-hidden />
            <CardTitle>Today&apos;s Appointments</CardTitle>
          </div>
          <CardDescription>
            Active appointments scheduled from today onwards. Click an appointment
            to open the visit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentsTable appointments={appointments} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-blue-700" aria-hidden />
            <CardTitle>Recent Visits</CardTitle>
          </div>
          <CardDescription>Last 10 completed visit notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentVisits visits={recentVisits} />
        </CardContent>
      </Card>
    </div>
  )
}
