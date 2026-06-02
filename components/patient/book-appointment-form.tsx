"use client"

import { useActionState } from "react"
import { bookAppointmentAction, type ActionResult } from "@/app/patient/actions"
import { Button } from "@/components/ui/button"

type Doctor = {
  id: string
  firstName: string
  lastName: string
  specialization: string
}

type Props = {
  patientId: string
  doctors: Doctor[]
}

function minDatetimeLocal() {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 30)
  return now.toISOString().slice(0, 16)
}

export function BookAppointmentForm({ patientId, doctors }: Props) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    bookAppointmentAction,
    null,
  )

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="patientId" value={patientId} />

      <div>
        <label
          htmlFor="doctorId"
          className="block text-sm font-medium text-gray-700"
        >
          Doctor
        </label>
        <select
          id="doctorId"
          name="doctorId"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a doctor</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              Dr. {d.firstName} {d.lastName} — {d.specialization}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="scheduledAt"
          className="block text-sm font-medium text-gray-700"
        >
          Date &amp; Time
        </label>
        <input
          id="scheduledAt"
          name="scheduledAt"
          type="datetime-local"
          required
          min={minDatetimeLocal()}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-gray-700"
        >
          Reason for Visit
        </label>
        <textarea
          id="reason"
          name="reason"
          required
          rows={3}
          maxLength={500}
          placeholder="Briefly describe your reason for the appointment"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {state && (
        <p
          className={`text-sm font-medium ${state.success ? "text-green-600" : "text-red-600"}`}
          role="alert"
          aria-live="polite"
        >
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Scheduling…" : "Book Appointment"}
      </Button>
    </form>
  )
}
