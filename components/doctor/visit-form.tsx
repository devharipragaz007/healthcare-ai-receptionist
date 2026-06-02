"use client"

import { useActionState, useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import {
  saveVisitNotesAction,
  completeVisitAction,
  type ActionResult,
} from "@/app/doctor/actions"
import { Button } from "@/components/ui/button"

type Props = {
  appointmentId: string
  initialNotes: string
  isCompleted: boolean
}

export function VisitForm({ appointmentId, initialNotes, isCompleted }: Props) {
  const router = useRouter()
  const [notes, setNotes] = useState(initialNotes)

  const [saveState, saveFormAction, savePending] =
    useActionState<ActionResult | null, FormData>(saveVisitNotesAction, null)

  const [completePending, startCompleteTransition] = useTransition()
  const [completeError, setCompleteError] = useState<string | null>(null)

  const pending = savePending || completePending

  function handleComplete() {
    setCompleteError(null)
    const formData = new FormData()
    formData.set("appointmentId", appointmentId)
    formData.set("notes", notes)

    startCompleteTransition(async () => {
      const result = await completeVisitAction(null, formData)
      if (result.success) {
        router.push("/doctor")
      } else {
        setCompleteError(result.message)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Clinical Notes
        </label>
        <p className="mt-0.5 text-xs text-gray-500">
          Minimum 20 characters required to save or complete.
        </p>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={10}
          placeholder="Enter clinical observations, findings, and recommendations…"
          className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {saveState && (
        <p
          className={`text-sm ${saveState.success ? "text-green-600" : "text-red-600"}`}
          role="alert"
          aria-live="polite"
        >
          {saveState.message}
        </p>
      )}

      {completeError && (
        <p className="text-sm text-red-600" role="alert" aria-live="polite">
          {completeError}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <form action={saveFormAction}>
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <input type="hidden" name="notes" value={notes} />
          <Button type="submit" variant="outline" disabled={pending}>
            {savePending ? "Saving…" : "Save Notes"}
          </Button>
        </form>

        {!isCompleted && (
          <Button onClick={handleComplete} disabled={pending}>
            {completePending ? "Completing…" : "Complete Visit"}
          </Button>
        )}

        {isCompleted && (
          <Button onClick={handleComplete} disabled={pending}>
            {completePending ? "Saving…" : "Update Notes"}
          </Button>
        )}
      </div>
    </div>
  )
}
