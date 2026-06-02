import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  APP_NAME,
  APP_TAGLINE,
  HERO_HEADLINE,
  HERO_DESCRIPTION,
} from "@/lib/constants"
import { StartConversationModal } from "@/components/home/start-conversation-modal"

export function Hero() {
  return (
    <section className="border-b bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
            {APP_TAGLINE}
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            {HERO_HEADLINE}
          </h1>
          <p className="mb-4 text-base font-medium text-gray-700">{APP_NAME}</p>
          <p className="mb-10 text-lg leading-8 text-gray-500">
            {HERO_DESCRIPTION}
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <StartConversationModal />
            <Link
              href="/patient"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Patient Portal
            </Link>
            <Link
              href="/doctor"
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
            >
              Doctor Portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
