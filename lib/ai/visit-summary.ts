import { getOpenAIClient } from "./openai"
import { VISIT_SUMMARY_SYSTEM_PROMPT } from "./prompts"

export async function generateVisitSummary(
  notes: string,
): Promise<{ summary: string }> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    max_tokens: 600,
    messages: [
      { role: "system", content: VISIT_SUMMARY_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Clinical notes:\n\n${notes}`,
      },
    ],
  })

  const content = response.choices[0]?.message?.content?.trim()
  if (!content) {
    throw new Error("OpenAI returned an empty response")
  }

  return { summary: content }
}
