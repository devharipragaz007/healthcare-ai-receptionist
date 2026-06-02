import { HOW_IT_WORKS_STEPS } from "@/lib/constants"

export function HowItWorks() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            How It Works
          </h2>
          <p className="mt-3 text-base text-gray-500">
            From first contact to confirmed appointment in three steps.
          </p>
        </div>

        <div className="relative grid gap-8 sm:grid-cols-3">
          {/* Connector line visible on md+ */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-5 hidden border-t border-dashed border-gray-200 sm:block"
          />

          {HOW_IT_WORKS_STEPS.map((item) => (
            <div key={item.step} className="relative flex flex-col items-center text-center">
              <div className="mb-4 flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white ring-4 ring-white">
                {item.step}
              </div>
              <h3 className="mb-2 text-base font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
