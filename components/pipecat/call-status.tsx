"use client"

import { cn } from "@/lib/utils"

export type CallStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "speaking"
  | "ending"
  | "error"

const STATUS_CONFIG: Record<
  CallStatus,
  { label: string; dotClass: string; textClass: string; bgClass: string }
> = {
  idle: {
    label: "Ready",
    dotClass: "bg-gray-400",
    textClass: "text-gray-600",
    bgClass: "bg-gray-50 ring-gray-200",
  },
  connecting: {
    label: "Connecting",
    dotClass: "bg-yellow-400 animate-pulse",
    textClass: "text-yellow-700",
    bgClass: "bg-yellow-50 ring-yellow-200",
  },
  listening: {
    label: "Listening",
    dotClass: "bg-blue-500 animate-pulse",
    textClass: "text-blue-700",
    bgClass: "bg-blue-50 ring-blue-200",
  },
  speaking: {
    label: "Speaking",
    dotClass: "bg-green-500 animate-pulse",
    textClass: "text-green-700",
    bgClass: "bg-green-50 ring-green-200",
  },
  ending: {
    label: "Ending call",
    dotClass: "bg-orange-400 animate-pulse",
    textClass: "text-orange-700",
    bgClass: "bg-orange-50 ring-orange-200",
  },
  error: {
    label: "Error",
    dotClass: "bg-red-500",
    textClass: "text-red-700",
    bgClass: "bg-red-50 ring-red-200",
  },
}

interface CallStatusProps {
  status: CallStatus
  className?: string
}

export function CallStatusBadge({ status, className }: CallStatusProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        config.bgClass,
        config.textClass,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  )
}
