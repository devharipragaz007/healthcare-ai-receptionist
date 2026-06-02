"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, RefreshCw } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { regenerateVisitSummaryAction } from "@/app/doctor/actions"

type Props = {
  appointmentId: string
  summary: string | null | undefined
}

function SummaryText({ summary }: { summary: string }) {
  const lines = summary.split("\n")
  return (
    <div className="space-y-3 text-sm text-gray-700">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return null
        if (trimmed.endsWith(":")) {
          return (
            <p key={i} className="font-semibold text-gray-900 mt-4 first:mt-0">
              {trimmed}
            </p>
          )
        }
        if (trimmed.startsWith("-")) {
          return (
            <p key={i} className="pl-4">
              {trimmed}
            </p>
          )
        }
        return <p key={i}>{trimmed}</p>
      })}
    </div>
  )
}

export function DoctorVisitSummaryCard({ appointmentId, summary }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleRegenerate() {
    startTransition(async () => {
      const result = await regenerateVisitSummaryAction(appointmentId)
      if (result.success) {
        router.refresh()
      }
    })
  }

  const isUnavailable =
    !summary ||
    summary === "Summary unavailable." ||
    summary === "Unable to generate summary."

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-blue-700" aria-hidden />
            <CardTitle>AI Visit Summary</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`size-3 ${isPending ? "animate-spin" : ""}`} aria-hidden />
            {isPending ? "Generating…" : "Regenerate"}
          </Button>
        </div>
        <CardDescription>
          AI-generated summary from clinical notes. Read-only — for reference only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isUnavailable ? (
          <p className="text-sm text-amber-600">
            {summary ?? "Summary not yet generated."}
          </p>
        ) : (
          <SummaryText summary={summary!} />
        )}
      </CardContent>
    </Card>
  )
}
