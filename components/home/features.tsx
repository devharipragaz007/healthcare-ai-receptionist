import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Calendar, CalendarClock, ClipboardList, BrainCircuit } from "lucide-react"
import { FEATURES } from "@/lib/constants"

const FEATURE_ICONS = [Calendar, CalendarClock, ClipboardList, BrainCircuit] as const

export function Features() {
  return (
    <section className="border-b bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Everything a Modern Clinic Needs
          </h2>
          <p className="mt-3 text-base text-gray-500">
            Purpose-built capabilities that eliminate administrative friction.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => {
            const Icon = FEATURE_ICONS[index]
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
