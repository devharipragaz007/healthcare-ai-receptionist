"use client"

import { useState, useActionState, useTransition } from "react"
import {
  rescheduleAppointmentAction,
  cancelAppointmentAction,
  type ActionResult,
} from "@/app/patient/actions"
import { Button } from "@/components/ui/button"

type Props = {
  appointmentId: string
}

function minDatetimeLocal() {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 30)
  return now.toISOString().slice(0, 16)
}

export function AppointmentActions({ appointmentId }: Props) {
  const [showReschedule, setShowReschedule] = useState(false)
  const [cancelPending, startCancelTransition] = useTransition()
  const [cancelResult, setCancelResult] = useState<ActionResult | null>(null)

  const [rescheduleState, rescheduleFormAction, reschedulePending] =
    useActionState<ActionResult | null, FormData>(rescheduleAppointmentAction, null)

  function handleCancel() {
    startCancelTransition(async () => {
      const result = await cancelAppointmentAction(appointmentId)
      setCancelResult(result)
    })
  }

  if (cancelResult?.success) {
    return (
      <p className="text-sm text-green-600" role="status">
        {cancelResult.message}
      </p>
    )
  }

  return (
    <div className="mt-3 space-y-2">
      {!showReschedule && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowReschedule(true)}
            disabled={cancelPending}
          >
            Reschedule
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelPending}
          >
            {cancelPending ? "Cancelling…" : "Cancel"}
          </Button>
        </div>
      )}

      {cancelResult && !cancelResult.success && (
        <p className="text-sm text-red-600" role="alert">
          {cancelResult.message}
        </p>
      )}

      {showReschedule && (
        <form action={rescheduleFormAction} className="space-y-2">
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <div>
            <label
              htmlFor={`reschedule-${appointmentId}`}
              className="block text-xs font-medium text-gray-600"
            >
              New Date &amp; Time
            </label>
            <input
              id={`reschedule-${appointmentId}`}
              name="scheduledAt"
              type="datetime-local"
              required
              min={minDatetimeLocal()}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {rescheduleState && (
            <p
              className={`text-sm ${rescheduleState.success ? "text-green-600" : "text-red-600"}`}
              role="alert"
              aria-live="polite"
            >
              {rescheduleState.message}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={reschedulePending}>
              {reschedulePending ? "Saving…" : "Confirm"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowReschedule(false)}
              disabled={reschedulePending}
            >
              Back
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
