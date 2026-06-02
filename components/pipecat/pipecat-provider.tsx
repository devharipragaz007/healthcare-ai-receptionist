"use client"

import { createContext, useContext, type ReactNode } from "react"
import { pipecatServerUrl } from "@/lib/env.public"

type PipecatContextValue = {
  serverUrl: string
  configured: boolean
}

const PipecatContext = createContext<PipecatContextValue>({
  serverUrl: "",
  configured: false,
})

export function PipecatProvider({ children }: { children: ReactNode }) {
  const serverUrl = pipecatServerUrl
  const configured = Boolean(serverUrl)

  return (
    <PipecatContext.Provider value={{ serverUrl, configured }}>
      {children}
    </PipecatContext.Provider>
  )
}

export function usePipecat() {
  return useContext(PipecatContext)
}
