import { Sparkles } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

type Props = {
  summary: string | null | undefined
  visitDate: Date
  doctorName: string
}

function SummaryText({ summary }: { summary: string }) {
  const lines = summary.split("\n")
  return (
    <div className="space-y-1 text-sm text-gray-700">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return null
        if (trimmed.endsWith(":")) {
          return (
            <p key={i} className="font-semibold text-gray-900 mt-3 first:mt-0">
              {trimmed}
            </p>
          )
        }
        if (trimmed.startsWith("-")) {
          return (
            <p key={i} className="pl-4 text-gray-600">
              {trimmed}
            </p>
          )
        }
        return <p key={i}>{trimmed}</p>
      })}
    </div>
  )
}

export function PatientVisitSummaryCard({ summary, visitDate, doctorName }: Props) {
  const isUnavailable = !summary || summary === "Summary unavailable."

  return (
    <Card className="mt-3 border-blue-100 bg-blue-50/30">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-blue-600" aria-hidden />
          <CardTitle className="text-sm text-blue-800">Visit Summary</CardTitle>
        </div>
        <CardDescription className="text-xs text-blue-600/80">
          {doctorName} &middot;{" "}
          {new Date(visitDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {isUnavailable ? (
          <p className="text-xs text-amber-600">
            Summary not available for this visit.
          </p>
        ) : (
          <SummaryText summary={summary!} />
        )}
      </CardContent>
    </Card>
  )
}
