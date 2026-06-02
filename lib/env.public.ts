// Client-safe env vars — only NEXT_PUBLIC_* are inlined at build time
export const pipecatServerUrl =
  process.env.NEXT_PUBLIC_PIPECAT_SERVER_URL ?? "ws://localhost:8765"
export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
