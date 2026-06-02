import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  // Required for AI visit summary generation (Phase 6). If absent, summaries
  // fall back to "Summary unavailable." and visit completion still succeeds.
  OPENAI_API_KEY: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
})

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
})

// NEXT_PUBLIC_* vars — use lib/env.public.ts for client components
export { pipecatServerUrl, appUrl } from "./env.public"
