import { APP_NAME } from "@/lib/constants"

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-between">
          <p className="text-sm font-medium text-gray-900">{APP_NAME}</p>
          <p className="text-sm text-gray-500">Built for Healthcare AI Demonstration</p>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  )
}
