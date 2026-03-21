/**
 * Enhanced AI Service with context-aware prompts and offline fallbacks
 */

import type { AppState, PrimePathStep } from "@/lib/types"
import { generateContextualPrompt } from "./ai-context-builder"

interface AIResponse<T> {
  data: T | null
  error?: string
  source: "gemini" | "fallback"
}

/**
 * Generates context-aware insights using full AppState
 */
export async function generateInsights(state: AppState): Promise<AIResponse<any[]>> {
  try {
    const response = await fetch("/api/ai/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userProfile: state.userProfile,
        strategicGoal: state.strategicGoal,
        expenses: state.expenses,
        habits: state.habits,
        habitLogs: state.habitLogs,
        knowledgeItems: state.knowledgeItems,
        aura: state.aura,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate insights")
    }

    const data = await response.json()
    return { data: data.insights, source: "gemini" }
  } catch (error) {
    console.error("[v0] AI insights error:", error)
    return {
      data: generateFallbackInsights(state),
      error: "Using offline insights",
      source: "fallback",
    }
  }
}

/**
 * Generates strategic Prime Path with full context
 */
export async function generatePrimePath(state: AppState): Promise<AIResponse<PrimePathStep[]>> {
  if (!state.userProfile || !state.strategicGoal) {
    return {
      data: null,
      error: "User profile and strategic goal required",
      source: "fallback",
    }
  }

  try {
    const response = await fetch("/api/ai/prime-path", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: state.userProfile,
        goal: state.strategicGoal,
        aura: state.aura,
        expenses: state.expenses.slice(-20),
        habits: state.habits,
        habitLogs: state.habitLogs.slice(-30),
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate Prime Path")
    }

    const data = await response.json()
    return { data: data.steps, source: "gemini" }
  } catch (error) {
    console.error("[v0] Prime Path error:", error)
    return {
      data: generateFallbackPrimePath(state),
      error: "Using offline strategy",
      source: "fallback",
    }
  }
}

/**
 * Generates financial analysis with spending context
 */
export async function generateFinancialAnalysis(state: AppState): Promise<AIResponse<string>> {
  try {
    const prompt = generateContextualPrompt(
      state,
      "financial",
      "Provide a comprehensive financial analysis with specific recommendations.",
    )

    const response = await fetch("/api/ai/generate-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate financial analysis")
    }

    const data = await response.json()
    return { data: data.text, source: "gemini" }
  } catch (error) {
    console.error("[v0] Financial analysis error:", error)
    return {
      data: generateFallbackFinancialAnalysis(state),
      error: "Using offline analysis",
      source: "fallback",
    }
  }
}

/**
 * Generates Symbiont event with context
 */
export async function generateSymbiontEvent(
  state: AppState,
  action: string,
  context: any,
): Promise<AIResponse<string>> {
  try {
    const response = await fetch("/api/ai/symbiont-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        context,
        userProfile: state.userProfile,
        aura: state.aura,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate symbiont event")
    }

    const data = await response.json()
    return { data: data.event, source: "gemini" }
  } catch (error) {
    console.error("[v0] Symbiont event error:", error)
    return {
      data: generateFallbackSymbiontEvent(action),
      error: "Using offline event",
      source: "fallback",
    }
  }
}

// === OFFLINE FALLBACKS ===

function generateFallbackInsights(state: AppState): any[] {
  const insights: any[] = []

  // Spending insight
  const totalSpending = state.expenses.reduce((sum, e) => sum + e.amount, 0)
  if (totalSpending > 1000) {
    insights.push({
      type: "warning",
      title: "High Spending Detected",
      message: `You've spent $${totalSpending.toFixed(2)} recently. Consider reviewing your budget.`,
      priority: "high",
    })
  }

  // Habit insight
  const todayStr = new Date().toISOString().split("T")[0]
  const completedToday = state.habitLogs.filter((log) => log.date === todayStr && log.completed).length
  if (completedToday > 0) {
    insights.push({
      type: "celebration",
      title: "Great Progress!",
      message: `You've completed ${completedToday} habit${completedToday > 1 ? "s" : ""} today. Keep it up!`,
      priority: "medium",
    })
  }

  // Knowledge insight
  if (state.knowledgeItems.length > 10) {
    insights.push({
      type: "tip",
      title: "Growing Knowledge Base",
      message: `You have ${state.knowledgeItems.length} items in your knowledge base. Consider organizing them by topic.`,
      priority: "low",
    })
  }

  return insights.length > 0
    ? insights
    : [
        {
          type: "suggestion",
          title: "Get Started",
          message: "Add expenses, track habits, or set your strategic goal to unlock personalized insights.",
          priority: "medium",
        },
      ]
}

function generateFallbackPrimePath(state: AppState): PrimePathStep[] {
  return [
    {
      title: "Define Your Foundation",
      description: `Start by clarifying your goal: "${state.strategicGoal}". Break it into measurable milestones.`,
    },
    {
      title: "Build Daily Systems",
      description: "Create habits and routines that support your goal. Track progress consistently.",
    },
    {
      title: "Optimize Resources",
      description: "Review your spending and time allocation. Eliminate waste and invest in high-impact activities.",
    },
    {
      title: "Iterate and Scale",
      description: "Measure results, learn from feedback, and double down on what works.",
    },
  ]
}

function generateFallbackFinancialAnalysis(state: AppState): string {
  const totalSpending = state.expenses.reduce((sum, e) => sum + e.amount, 0)
  const avgExpense = state.expenses.length > 0 ? totalSpending / state.expenses.length : 0

  return `
## Financial Analysis (Offline Mode)

**Total Spending:** $${totalSpending.toFixed(2)}
**Average Expense:** $${avgExpense.toFixed(2)}
**Transactions:** ${state.expenses.length}

### Recommendations:
1. Track all expenses for at least 30 days to identify patterns
2. Set a monthly budget based on your income and goals
3. Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings
4. Review subscriptions and recurring expenses monthly

*Note: Connect to the internet for AI-powered personalized analysis.*
  `.trim()
}

function generateFallbackSymbiontEvent(action: string): string {
  const templates: Record<string, string> = {
    expense: "Expense logged. Building financial awareness.",
    habit: "Habit tracked. Consistency compounds over time.",
    knowledge: "Knowledge captured. Your second brain grows.",
    reminder: "Reminder set. Staying organized.",
  }

  return templates[action] || "Action recorded. Keep building momentum."
}
