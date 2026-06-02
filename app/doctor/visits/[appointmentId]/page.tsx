export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, User } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAppointmentById } from "@/lib/repositories/appointment.repository"
import { getVisit } from "@/lib/services/visit.service"
import { VisitForm } from "@/components/doctor/visit-form"
import { DoctorVisitSummaryCard } from "@/components/doctor/visit-summary-card"
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from "@/lib/constants"

type Props = {
  params: Promise<{ appointmentId: string }>
}

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default async function VisitDetailsPage({ params }: Props) {
  const { appointmentId } = await params
  const [appointment, visit] = await Promise.all([
    getAppointmentById(appointmentId),
    getVisit(appointmentId),
  ])

  if (!appointment) notFound()

  const isCompleted = appointment.status === "COMPLETED"

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/doctor"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Visit — {appointment.patient.firstName} {appointment.patient.lastName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatDateTime(appointment.scheduledAt)}
          </p>
        </div>
        <Badge className={APPOINTMENT_STATUS_COLORS[appointment.status]}>
          {APPOINTMENT_STATUS_LABELS[appointment.status]}
        </Badge>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="size-4 text-blue-700" aria-hidden />
              <CardTitle>Patient Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Name</dt>
                <dd className="font-medium text-gray-900">
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Date of Birth</dt>
                <dd className="font-medium text-gray-900">
                  {formatDate(appointment.patient.dateOfBirth)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium text-gray-900">{appointment.patient.phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium text-gray-900 text-right break-all">
                  {appointment.patient.email}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Appointment Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-blue-700" aria-hidden />
              <CardTitle>Appointment Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Date</dt>
                <dd className="font-medium text-gray-900">
                  {formatDate(appointment.scheduledAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Time</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(appointment.scheduledAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-gray-500">Reason</dt>
                <dd className="font-medium text-gray-900">{appointment.reason}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Visit Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Visit Notes</CardTitle>
          <CardDescription>
            {isCompleted
              ? "This visit is completed. You may update notes at any time."
              : "Enter clinical observations, findings, and recommendations."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointment.status === "CANCELLED" ? (
            <p className="text-sm text-red-600">
              This appointment was cancelled. No visit can be completed.
            </p>
          ) : (
            <VisitForm
              appointmentId={appointmentId}
              initialNotes={visit?.notes ?? ""}
              isCompleted={isCompleted}
            />
          )}
        </CardContent>
      </Card>

      {/* AI Visit Summary — shown only after visit is completed */}
      {isCompleted && visit && (
        <DoctorVisitSummaryCard
          appointmentId={appointmentId}
          summary={visit.summary}
        />
      )}
    </div>
  )
}
