export const dynamic = "force-dynamic"

import { Calendar, CheckCircle, XCircle, PlusCircle } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPatientByEmail } from "@/lib/repositories/patient.repository"
import { getAllDoctors } from "@/lib/repositories/doctor.repository"
import { getPatientAppointments } from "@/lib/services/appointment.service"
import { BookAppointmentForm } from "@/components/patient/book-appointment-form"
import { AppointmentActions } from "@/components/patient/appointment-actions"
import { PatientVisitSummaryCard } from "@/components/patient/visit-summary-card"
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from "@/lib/constants"

const DEMO_PATIENT_EMAIL = "james.harrington@email.com"

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default async function PatientPortalPage() {
  const [patient, doctors] = await Promise.all([
    getPatientByEmail(DEMO_PATIENT_EMAIL),
    getAllDoctors(),
  ])

  if (!patient) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-red-600">Demo patient not found. Please re-run the seed.</p>
      </div>
    )
  }

  const { upcoming, past, cancelled } = await getPatientAppointments(patient.id)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome, {patient.firstName} {patient.lastName}. Manage your
          appointments below.
        </p>
      </div>

      {/* Book Appointment */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PlusCircle className="size-5 text-blue-700" aria-hidden />
            <CardTitle>Book an Appointment</CardTitle>
          </div>
          <CardDescription>
            Schedule a new appointment with one of our doctors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookAppointmentForm patientId={patient.id} doctors={doctors} />
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-blue-700" aria-hidden />
            <CardTitle>Upcoming Appointments</CardTitle>
          </div>
          <CardDescription>
            Your scheduled appointments with your care team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-10 text-center">
              <Calendar className="mb-3 size-8 text-gray-300" aria-hidden />
              <p className="text-sm font-medium text-gray-500">
                No upcoming appointments
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcoming.map((appt) => (
                <li key={appt.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        Dr. {appt.doctor.firstName} {appt.doctor.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appt.doctor.specialization}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {formatDateTime(appt.scheduledAt)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 truncate">
                        {appt.reason}
                      </p>
                    </div>
                    <Badge
                      className={APPOINTMENT_STATUS_COLORS[appt.status]}
                    >
                      {APPOINTMENT_STATUS_LABELS[appt.status]}
                    </Badge>
                  </div>
                  <AppointmentActions appointmentId={appt.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="size-5 text-blue-700" aria-hidden />
            <CardTitle>Past Appointments</CardTitle>
          </div>
          <CardDescription>
            Completed and prior visits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {past.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-10 text-center">
              <CheckCircle className="mb-3 size-8 text-gray-300" aria-hidden />
              <p className="text-sm font-medium text-gray-500">
                No past appointments
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {past.map((appt) => (
                <li key={appt.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        Dr. {appt.doctor.firstName} {appt.doctor.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appt.doctor.specialization}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {formatDateTime(appt.scheduledAt)}
                      </p>
                    </div>
                    <Badge
                      className={APPOINTMENT_STATUS_COLORS[appt.status]}
                    >
                      {APPOINTMENT_STATUS_LABELS[appt.status]}
                    </Badge>
                  </div>
                  {appt.status === "COMPLETED" && appt.visit && (
                    <PatientVisitSummaryCard
                      summary={appt.visit.summary}
                      visitDate={appt.visit.createdAt}
                      doctorName={`Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}`}
                    />
                  )}
                  {appt.status === "COMPLETED" && !appt.visit && (
                    <div className="mt-3 rounded-md bg-gray-50 px-3 py-2 border border-gray-100">
                      <p className="text-xs text-gray-400">No visit record found.</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Cancelled Appointments */}
      {cancelled.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="size-5 text-red-500" aria-hidden />
              <CardTitle>Cancelled Appointments</CardTitle>
            </div>
            <CardDescription>Appointments that were cancelled.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-100">
              {cancelled.map((appt) => (
                <li key={appt.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        Dr. {appt.doctor.firstName} {appt.doctor.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appt.doctor.specialization}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {formatDateTime(appt.scheduledAt)}
                      </p>
                    </div>
                    <Badge className={APPOINTMENT_STATUS_COLORS[appt.status]}>
                      {APPOINTMENT_STATUS_LABELS[appt.status]}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
