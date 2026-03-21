/**
 * Offline ML fallback using simple heuristics
 * In production, this would use Transformers.js for local inference
 */

import type { AppState, LifeSimulation, PrimePathStep } from "./types"

/**
 * Generate insights using local heuristics (offline mode)
 */
export function generateOfflineInsights(state: AppState): any[] {
  const insights: any[] = []
  const todayStr = new Date().toISOString().split("T")[0]

  // Spending analysis
  const recentExpenses = state.expenses.slice(-30)
  const totalSpending = recentExpenses.reduce((sum, e) => sum + e.amount, 0)
  const avgDailySpending = totalSpending / 30

  if (avgDailySpending > 100) {
    insights.push({
      type: "warning",
      title: "High Daily Spending Detected",
      message: `Your average daily spending is $${avgDailySpending.toFixed(2)}. Consider setting a daily budget to track expenses better.`,
      priority: "high",
    })
  }

  // Habit streak analysis
  const habitStreaks = state.habits.map((habit) => {
    const logs = state.habitLogs.filter((log) => log.habitId === habit.id && log.completed)
    return { habit: habit.name, streak: logs.length }
  })

  const longestStreak = habitStreaks.reduce((max, h) => (h.streak > max.streak ? h : max), {
    habit: "",
    streak: 0,
  })

  if (longestStreak.streak > 7) {
    insights.push({
      type: "celebration",
      title: "Impressive Habit Streak!",
      message: `You've maintained "${longestStreak.habit}" for ${longestStreak.streak} days. Consistency is key to lasting change!`,
      priority: "medium",
    })
  }

  // Aura-based suggestions
  if (state.aura === "Stressed") {
    insights.push({
      type: "suggestion",
      title: "Stress Management Tip",
      message: "Your aura indicates stress. Try a 5-minute breathing exercise or a short walk to reset your energy.",
      priority: "high",
    })
  } else if (state.aura === "Energized") {
    insights.push({
      type: "tip",
      title: "Harness Your Energy",
      message: "You're energized! This is the perfect time to tackle your most challenging tasks or start a new habit.",
      priority: "medium",
    })
  }

  // Knowledge base analysis
  if (state.knowledgeItems.length > 20) {
    insights.push({
      type: "tip",
      title: "Knowledge Organization",
      message: `You have ${state.knowledgeItems.length} knowledge items. Consider creating categories or tags to make retrieval easier.`,
      priority: "low",
    })
  }

  // Strategic goal alignment
  if (state.strategicGoal && state.habits.length < 3) {
    insights.push({
      type: "suggestion",
      title: "Build Supporting Habits",
      message: `Your goal is "${state.strategicGoal}". Create 3-5 daily habits that directly support this goal.`,
      priority: "high",
    })
  }

  return insights.length > 0
    ? insights
    : [
        {
          type: "suggestion",
          title: "Start Your Journey",
          message:
            "Begin by setting a strategic goal, tracking expenses, or creating your first habit to unlock personalized insights.",
          priority: "medium",
        },
      ]
}

/**
 * Generate life simulation using heuristics (offline mode)
 */
export function generateOfflineSimulation(decision: string, aura: number, userContext: any): LifeSimulation {
  const baseProbability = aura / 100

  const paths = [
    {
      title: "Optimistic Path",
      probability: Math.round(baseProbability * 60 + 20),
      description: `If you commit fully to "${decision}", you'll likely see positive momentum building over time. Small wins compound into significant progress.`,
      impacts: [
        { dimension: "Wellness", direction: "positive" as const, change: "+20% energy" },
        { dimension: "Productivity", direction: "positive" as const, change: "+15% focus" },
        { dimension: "Habits", direction: "positive" as const, change: "+25% consistency" },
      ],
    },
    {
      title: "Realistic Path",
      probability: Math.round(baseProbability * 50 + 30),
      description: `With moderate effort on "${decision}", you'll experience gradual improvement with some setbacks. Progress isn't linear, but the trend is upward.`,
      impacts: [
        { dimension: "Wellness", direction: "positive" as const, change: "+10% energy" },
        { dimension: "Productivity", direction: "neutral" as const, change: "Stable" },
        { dimension: "Finances", direction: "positive" as const, change: "+5% savings" },
      ],
    },
    {
      title: "Challenging Path",
      probability: Math.round((1 - baseProbability) * 40 + 10),
      description: `If obstacles arise with "${decision}", you may face initial resistance. However, overcoming these challenges builds resilience and character.`,
      impacts: [
        { dimension: "Wellness", direction: "negative" as const, change: "-10% energy initially" },
        { dimension: "Productivity", direction: "negative" as const, change: "-15% focus short-term" },
        { dimension: "Habits", direction: "positive" as const, change: "+30% resilience long-term" },
      ],
    },
  ]

  return {
    decision,
    paths,
  }
}

/**
 * Generate Prime Path using heuristics (offline mode)
 */
export function generateOfflinePrimePath(state: AppState): PrimePathStep[] {
  const goal = state.strategicGoal || "Achieve your goals"

  return [
    {
      title: "Foundation: Clarity & Systems",
      description: `Define "${goal}" with specific, measurable outcomes. Build daily systems (habits, routines) that support this goal. Track progress consistently.`,
    },
    {
      title: "Momentum: Quick Wins",
      description:
        "Focus on high-impact, low-effort actions first. Build confidence through small victories. Celebrate progress to maintain motivation.",
    },
    {
      title: "Optimization: Eliminate Waste",
      description:
        "Audit your time and resources. Cut activities that don't serve your goal. Invest saved resources into high-leverage activities.",
    },
    {
      title: "Scale: Compound Growth",
      description:
        "Double down on what works. Automate or delegate low-value tasks. Focus on activities with exponential returns.",
    },
    {
      title: "Mastery: Continuous Improvement",
      description:
        "Measure results weekly. Learn from feedback. Iterate rapidly. Share knowledge to deepen understanding.",
    },
  ]
}

/**
 * Note: In production, integrate Transformers.js for actual local ML inference
 * Example: Use @xenova/transformers for text generation, sentiment analysis, etc.
 *
 * import { pipeline } from '@xenova/transformers'
 * const generator = await pipeline('text-generation', 'Xenova/gpt2')
 * const output = await generator(prompt, { max_length: 100 })
 */
