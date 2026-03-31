/**
 * AI Context Builder - Constructs rich context for AI prompts
 * Aggregates user data, patterns, and state for context-aware AI responses
 */

import type { AppState, AuraState } from "@/lib/types"

export interface AIContext {
  userSummary: string
  recentActivity: string
  patterns: string
  emotionalContext: string
  strategicAlignment: string
}

/**
 * Builds comprehensive context from AppState for AI prompts
 */
export function buildAIContext(state: AppState): AIContext {
  const profile = state.userProfile
  const safeExpenses = state.expenses || []
  const safeHabitLogs = state.habitLogs || []
  const safeKnowledgeItems = state.knowledgeItems || []
  const safeHabits = state.habits || []
  const safePrimePath = state.primePath || []

  const recentExpenses = safeExpenses.slice(-10)
  const recentHabits = safeHabitLogs.slice(-10)
  const recentKnowledge = safeKnowledgeItems.slice(-5)

  // User summary
  const userSummary = profile
    ? `User: ${profile.name}, ${profile.occupation}. Skills: ${profile.skills.join(", ")}. Interests: ${profile.interests.join(", ")}. Financial style: ${profile.financialRiskStyle}. AI Persona: ${profile.aiPersona}.`
    : "User profile not set."

  // Recent activity
  const expenseActivity =
    recentExpenses.length > 0
      ? `Recent expenses (${recentExpenses.length}): ${recentExpenses.map((e) => `$${e.amount} on ${e.description} (${e.category})`).join("; ")}.`
      : "No recent expenses."

  const habitActivity =
    recentHabits.length > 0
      ? `Recent habit logs: ${recentHabits
          .map((log) => {
            const habit = safeHabits.find((h) => h.id === log.habitId)
            return `${habit?.name || "Unknown"} - ${log.completed ? "✓" : "✗"} on ${log.date}`
          })
          .join("; ")}.`
      : "No habit tracking yet."

  const knowledgeActivity =
    recentKnowledge.length > 0
      ? `Recent knowledge items: ${recentKnowledge.map((k) => k.title).join(", ")}.`
      : "No knowledge items yet."

  const recentActivity = `${expenseActivity} ${habitActivity} ${knowledgeActivity}`

  // Pattern detection
  const totalSpending = safeExpenses.reduce((sum, e) => sum + e.amount, 0)
  const avgExpense = safeExpenses.length > 0 ? totalSpending / safeExpenses.length : 0
  const categoryBreakdown = safeExpenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    },
    {} as Record<string, number>,
  )
  const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]

  const habitCompletionRate =
    safeHabitLogs.length > 0
      ? Math.round((safeHabitLogs.filter((log) => log.completed).length / safeHabitLogs.length) * 100)
      : 0

  const patterns = `Total spending: $${totalSpending.toFixed(2)}. Average expense: $${avgExpense.toFixed(2)}. Top spending category: ${topCategory ? `${topCategory[0]} ($${topCategory[1].toFixed(2)})` : "N/A"}. Habit completion rate: ${habitCompletionRate}%. Knowledge base size: ${safeKnowledgeItems.length} items.`

  // Emotional context based on Aura
  const auraDescriptions: Record<AuraState, string> = {
    Neutral: "User is in a balanced, neutral state. Provide clear, objective guidance.",
    Focused:
      "User is highly focused and productive. Suggest ambitious actions and deep work strategies. Avoid distractions.",
    Creative:
      "User is in a creative, exploratory mindset. Encourage brainstorming, experimentation, and innovative thinking.",
    Stressed:
      "User is experiencing stress. Provide reassuring, calming advice. Focus on small wins and stress reduction.",
    Energized:
      "User is energized and motivated. Suggest bold actions and challenging goals. Capitalize on this momentum.",
    Tired: "User is tired or low-energy. Recommend rest, simple tasks, and self-care. Avoid overwhelming suggestions.",
  }

  const emotionalContext = `Current Aura: ${state.aura}. ${auraDescriptions[state.aura]}`

  // Strategic alignment
  const strategicAlignment = state.strategicGoal
    ? `User's strategic goal: "${state.strategicGoal}". All insights should align with this goal. Prime Path steps: ${safePrimePath.length > 0 ? safePrimePath.map((step) => step.title).join(" → ") : "Not generated yet"}.`
    : "No strategic goal set. Encourage user to define their primary objective."

  return {
    userSummary,
    recentActivity,
    patterns,
    emotionalContext,
    strategicAlignment,
  }
}

/**
 * Formats AI context into a prompt-ready string
 */
export function formatContextForPrompt(context: AIContext): string {
  return `
=== USER CONTEXT ===
${context.userSummary}

=== EMOTIONAL STATE ===
${context.emotionalContext}

=== STRATEGIC ALIGNMENT ===
${context.strategicAlignment}

=== RECENT ACTIVITY ===
${context.recentActivity}

=== DETECTED PATTERNS ===
${context.patterns}

=== INSTRUCTIONS ===
Use this context to provide personalized, actionable insights. Consider the user's aura, strategic goal, and recent patterns. Be specific and reference their actual data.
`.trim()
}

/**
 * Generates a context-aware prompt for specific AI tasks
 */
export function generateContextualPrompt(
  state: AppState,
  taskType: "insight" | "forecast" | "strategy" | "financial" | "general",
  additionalPrompt?: string,
): string {
  const context = buildAIContext(state)
  const baseContext = formatContextForPrompt(context)

  const taskPrompts = {
    insight: `${baseContext}

TASK: Generate 1-3 actionable insights based on the user's current state. Focus on non-obvious patterns and predictive recommendations.`,

    forecast: `${baseContext}

TASK: Analyze trends and forecast potential outcomes. Provide a central prediction and 2-3 alternative scenarios with probabilities.`,

    strategy: `${baseContext}

TASK: Generate a strategic action plan (4 steps) to help the user achieve their goal. Consider their current patterns and emotional state.`,

    financial: `${baseContext}

TASK: Analyze spending patterns and provide financial advice. Include budgeting recommendations and investment strategies aligned with their risk tolerance.`,

    general: baseContext,
  }

  const prompt = taskPrompts[taskType]
  return additionalPrompt ? `${prompt}\n\n${additionalPrompt}` : prompt
}
