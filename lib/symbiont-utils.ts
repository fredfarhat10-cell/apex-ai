import type { SymbiontEvent, UserProfile } from "./types"

export async function generateSymbiontEvent(
  action: string,
  context: Record<string, any>,
  userProfile: UserProfile | null,
): Promise<SymbiontEvent> {
  try {
    const response = await fetch("/api/ai/symbiont-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, context, userProfile }),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        id: Date.now().toString(),
        text: data.event,
        timestamp: new Date().toISOString(),
      }
    }
  } catch (error) {
    console.error("[v0] Failed to generate symbiont event:", error)
  }

  // Fallback to simple event if AI generation fails
  return {
    id: Date.now().toString(),
    text: action,
    timestamp: new Date().toISOString(),
  }
}
