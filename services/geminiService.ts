"use client"

import type { AppState, Expense, PrimePathStep, UserProfile, FinancialSimulationResult, AuraState } from "../types"
import { userContextManager } from "@/lib/user-context-manager"
import { buildApexSystemPrompt } from "@/lib/apex-personality"

export const generateText = async (prompt: string, includeContext = true): Promise<string> => {
  try {
    const systemPrompt = includeContext ? buildApexSystemPrompt() : undefined
    const userContext = includeContext ? userContextManager.getRelevantContext(prompt) : undefined

    const response = await fetch("/api/ai/generate-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, systemPrompt, userContext }),
    })
    const data = await response.json()
    return data.text || "Error: Could not get a response from the AI."
  } catch (error) {
    console.error("Error generating text:", error)
    return "Error: Could not get a response from the AI."
  }
}

export const generateApexSynapse = async (state: AppState): Promise<string> => {
  const context = userContextManager.getUserContext()
  const recentFacts = context.learnedFacts
    .slice(0, 5)
    .map((f) => f.fact)
    .join("; ")

  const prompt = `
    Analyze the following user data to find a non-obvious, predictive, and actionable insight.
    Act as a cognitive co-pilot. Synthesize all data points.
    
    User Profile:
    - Name: ${state.userProfile?.name}
    - Occupation: ${state.userProfile?.occupation}
    - Interests: ${state.userProfile?.interests.join(", ")}
    
    Known Facts About User: ${recentFacts}
    
    Current User Aura: ${state.aura}. Tailor the insight to this emotional/mental context.
    For 'Stressed', provide a reassuring insight. For 'Creative', an inspiring one.
    
    Strategic Goal: ${state.strategicGoal}
    
    Recent Expenses (last 5): 
    ${state.expenses
      .slice(-5)
      .map((e) => `- ${e.description}: $${e.amount}`)
      .join("\n")}
    
    Active Reminders:
    ${state.reminders
      .filter((r) => !r.completed)
      .map((r) => `- ${r.text}`)
      .join("\n")}

    Based on this and what you know about the user's patterns, what is the single most critical insight for them right now? 
    Reference specific patterns you've observed. Be concise and direct.
    `
  return generateText(prompt)
}

export const generateChronosForecast = async (state: AppState): Promise<string> => {
  const context = userContextManager.getUserContext()
  const habits = context.profile.habits.map((h) => `${h.name} (${h.frequency})`).join(", ")

  const prompt = `
    Analyze the user's recent activity to forecast potential outcomes.
    Provide a "Central Prediction" and 2-3 "Alternative Outcomes" with assigned probabilities (e.g., 60%).
    The user's current Aura is ${state.aura}. This should influence your forecast's tone and focus.
    
    User Profile:
    - AI Persona: ${state.userProfile?.aiPersona}
    - Strategic Goal: ${state.strategicGoal}
    - Active Habits: ${habits}
    
    Recent Expenses (last 10): 
    ${state.expenses
      .slice(-10)
      .map((e) => `- ${e.description}: $${e.amount} on ${new Date(e.date).toLocaleDateString()}`)
      .join("\n")}
    
    Recent Habit Logs (last 10):
    ${state.habitLogs
      .slice(-10)
      .map((log) => {
        const habit = state.habits.find((h) => h.id === log.habitId)
        return `- ${habit?.name}: ${log.completed ? "Completed" : "Missed"} on ${log.date}`
      })
      .join("\n")}
    
    Your analysis should focus on trends related to their goal and reference patterns you've observed.
    `
  return generateText(prompt)
}

export const generateSymbiontEvent = async (state: AppState): Promise<string> => {
  const context = userContextManager.getUserContext()
  const recentActivity = context.recentActivities.slice(0, 3)

  const prompt = `
    Generate a single, short, ambient, third-person event based on the user's current state.
    This simulates a constant, low-level AI analysis stream. The event should be subtle and observational.
    Reference specific user patterns when possible.
    
    Examples:
    - "Biometrics indicate high stress. Pattern matches Tuesday afternoons."
    - "New expense correlated with upcoming calendar event."
    - "Weather patterns suggest a change in routine may be beneficial."
    - "Cross-referencing knowledge base with recent activity."
    
    Current User Data:
    - Goal: ${state.strategicGoal}
    - Aura: ${state.aura}
    - Recent expense category: ${state.expenses[state.expenses.length - 1]?.category}
    - Last knowledge item added: ${state.knowledgeItems[state.knowledgeItems.length - 1]?.title}
    - Recent activities: ${recentActivity.map((a) => a.description).join(", ")}
    
    Generate one new event that shows you're monitoring and learning.
    `
  return generateText(prompt)
}

export const generatePrimePath = async (
  profile: UserProfile,
  goal: string,
  aura: AuraState,
): Promise<PrimePathStep[]> => {
  try {
    const userContext = userContextManager.getRelevantContext(goal)

    const response = await fetch("/api/ai/prime-path", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, goal, aura, userContext }),
    })
    const data = await response.json()
    return data.steps || [{ title: "Error", description: "Could not generate a strategic path. Please try again." }]
  } catch (error) {
    console.error("Error generating Prime Path:", error)
    return [{ title: "Error", description: "Could not generate a strategic path. Please try again." }]
  }
}

export const generateFinancialAnalysis = async (
  expenses: Expense[],
  profile: UserProfile,
  aura: AuraState,
): Promise<string> => {
  const context = userContextManager.getUserContext()
  const financialFacts = context.learnedFacts.filter((f) => f.category === "financial" || f.source === "financial")

  const prompt = `
    Act as an AI Financial Analyst. Analyze the user's spending habits and provide a holistic analysis,
    budgeting advice, and a suggested investment strategy tailored to their risk tolerance.
    The user's current Aura is ${aura}. Frame your advice with this in mind (e.g., for 'Stressed', focus on security and simple wins).
    
    User Profile:
    - Financial Risk Style: ${profile.financialRiskStyle}
    - Occupation: ${profile.occupation}
    
    Known Financial Patterns: ${financialFacts.map((f) => f.fact).join("; ")}
    
    Expenses:
    ${JSON.stringify(expenses, null, 2)}
    
    Provide a detailed, well-structured analysis. Use markdown for formatting.
    Reference specific patterns you've observed in their spending behavior.
    `
  return generateText(prompt)
}

export const generateFinancialSimulation = async (
  expenses: Expense[],
  profile: UserProfile,
): Promise<FinancialSimulationResult[]> => {
  try {
    const userContext = userContextManager.getRelevantContext("financial simulation")

    const response = await fetch("/api/ai/financial-simulation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expenses, profile, userContext }),
    })
    const data = await response.json()
    return (
      data.strategies || [
        { strategy: "Error", outcome: "Could not simulate financial strategies. Please try again.", probability: 0 },
      ]
    )
  } catch (error) {
    console.error("Error simulating financial strategies:", error)
    return [
      { strategy: "Error", outcome: "Could not simulate financial strategies. Please try again.", probability: 0 },
    ]
  }
}

// --- Command Bar Chat ---

export const createCommandBarChat = (
  addExpense: (description: string, amount: number, category: string) => void,
  addReminder: (text: string, dueDate: string) => void,
) => {
  return async (input: string): Promise<string> => {
    try {
      const userContext = userContextManager.getRelevantContext(input)

      const response = await fetch("/api/ai/command-bar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, userContext }),
      })
      const data = await response.json()

      // Parse the AI response and execute the appropriate action
      try {
        const result = JSON.parse(data.result)

        if (result.type === "expense" && result.data) {
          addExpense(result.data.description, result.data.amount, result.data.category || "Other")

          userContextManager.logActivity({
            id: `activity_${Date.now()}`,
            type: "financial",
            description: `Added expense: ${result.data.description} ($${result.data.amount})`,
            timestamp: new Date(),
            metadata: { category: result.data.category, amount: result.data.amount },
          })

          return result.message || "Expense logged successfully!"
        } else if (result.type === "reminder" && result.data) {
          addReminder(result.data.text, result.data.dueDate)

          userContextManager.logActivity({
            id: `activity_${Date.now()}`,
            type: "task",
            description: `Added reminder: ${result.data.text}`,
            timestamp: new Date(),
            metadata: { dueDate: result.data.dueDate },
          })

          return result.message || "Reminder added successfully!"
        } else {
          return result.message || "Command processed."
        }
      } catch {
        return data.result || "Command processed."
      }
    } catch (error) {
      console.error("Error processing command:", error)
      return "Error: Could not process command."
    }
  }
}
