// AI-Powered Cash Flow Manager

import { openDB, type IDBPDatabase } from "idb"
import type { BudgetCategory, BudgetAllocation, SpendingEntry, BudgetSummary, CashFlowInsight } from "./types/budget"
import { DEFAULT_BUDGET_CATEGORIES } from "./budget-categories"
import type { PlaidTransaction } from "./types/plaid"

const DB_NAME = "apex-cash-flow"
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("categories")) {
        const catStore = db.createObjectStore("categories", { keyPath: "id" })
        catStore.createIndex("type", "type")
      }

      if (!db.objectStoreNames.contains("allocations")) {
        const allocStore = db.createObjectStore("allocations", { keyPath: "id" })
        allocStore.createIndex("userId", "userId")
        allocStore.createIndex("categoryId", "categoryId")
      }

      if (!db.objectStoreNames.contains("spending")) {
        const spendStore = db.createObjectStore("spending", { keyPath: "id" })
        spendStore.createIndex("userId", "userId")
        spendStore.createIndex("categoryId", "categoryId")
        spendStore.createIndex("date", "date")
      }

      if (!db.objectStoreNames.contains("insights")) {
        const insightStore = db.createObjectStore("insights", { keyPath: "id" })
        insightStore.createIndex("userId", "userId")
        insightStore.createIndex("type", "type")
      }
    },
  })

  return dbInstance
}

/**
 * Initialize default budget categories for a user
 */
export async function initializeDefaultCategories(): Promise<BudgetCategory[]> {
  const db = await getDB()

  for (const category of DEFAULT_BUDGET_CATEGORIES) {
    await db.put("categories", category)
  }

  return DEFAULT_BUDGET_CATEGORIES
}

/**
 * AI-powered transaction categorization
 */
export async function categorizeTransaction(transaction: PlaidTransaction): Promise<string> {
  // Use AI to categorize based on merchant name, category, and description
  const prompt = `Categorize this transaction into one of our budget categories:
Transaction: ${transaction.name}
Merchant: ${transaction.merchant_name || "Unknown"}
Plaid Category: ${transaction.category?.join(" > ") || "Unknown"}
Amount: $${Math.abs(transaction.amount)}

Available categories: Housing, Transportation, Food, Healthcare, Entertainment, Shopping, Savings, Debt

Return only the category ID (e.g., "cat_groceries", "cat_gas", "cat_dining_out")`

  try {
    const response = await fetch("/api/ai/categorize-transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, transaction }),
    })

    const data = await response.json()
    return data.categoryId || "cat_shopping" // Default fallback
  } catch (error) {
    console.error("[v0] Error categorizing transaction:", error)
    // Fallback to rule-based categorization
    return ruleBasedCategorization(transaction)
  }
}

/**
 * Rule-based categorization fallback
 */
function ruleBasedCategorization(transaction: PlaidTransaction): string {
  const name = transaction.name.toLowerCase()
  const merchant = transaction.merchant_name?.toLowerCase() || ""
  const category = transaction.category?.[0]?.toLowerCase() || ""

  // Food & Dining
  if (
    merchant.includes("starbucks") ||
    merchant.includes("restaurant") ||
    name.includes("food") ||
    category.includes("food")
  ) {
    if (merchant.includes("grocery") || name.includes("grocery") || name.includes("supermarket")) {
      return "cat_groceries"
    }
    return "cat_dining_out"
  }

  // Transportation
  if (
    merchant.includes("gas") ||
    merchant.includes("fuel") ||
    merchant.includes("uber") ||
    merchant.includes("lyft") ||
    category.includes("transportation")
  ) {
    return "cat_gas"
  }

  // Shopping
  if (
    merchant.includes("amazon") ||
    merchant.includes("target") ||
    merchant.includes("walmart") ||
    category.includes("shops")
  ) {
    return "cat_shopping"
  }

  // Entertainment
  if (
    merchant.includes("netflix") ||
    merchant.includes("spotify") ||
    merchant.includes("hulu") ||
    category.includes("entertainment")
  ) {
    return "cat_streaming"
  }

  // Healthcare
  if (merchant.includes("pharmacy") || merchant.includes("medical") || category.includes("healthcare")) {
    return "cat_medical"
  }

  // Utilities
  if (merchant.includes("electric") || merchant.includes("water") || merchant.includes("internet")) {
    return "cat_utilities"
  }

  // Default
  return "cat_shopping"
}

/**
 * Create or update budget allocation
 */
export async function setBudgetAllocation(
  userId: string,
  categoryId: string,
  amount: number,
  period: "monthly" | "weekly" | "yearly" = "monthly",
): Promise<BudgetAllocation> {
  const db = await getDB()

  const allocation: BudgetAllocation = {
    id: `alloc_${userId}_${categoryId}`,
    userId,
    categoryId,
    amount,
    period,
    startDate: new Date().toISOString(),
    rollover: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.put("allocations", allocation)
  return allocation
}

/**
 * Record spending entry
 */
export async function recordSpending(
  userId: string,
  categoryId: string,
  amount: number,
  description: string,
  transactionId?: string,
): Promise<SpendingEntry> {
  const db = await getDB()

  const entry: SpendingEntry = {
    id: `spend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    categoryId,
    amount,
    date: new Date().toISOString(),
    description,
    transactionId,
    isRecurring: false,
    createdAt: new Date().toISOString(),
  }

  await db.put("spending", entry)

  // Generate insights based on spending
  await generateSpendingInsights(userId, categoryId, amount)

  return entry
}

/**
 * Get budget summary for a user
 */
export async function getBudgetSummary(userId: string, month?: string): Promise<BudgetSummary[]> {
  const db = await getDB()

  // Get all allocations
  const allocIndex = db.transaction("allocations").store.index("userId")
  const allocations = await allocIndex.getAll(userId)

  // Get spending for the period
  const spendIndex = db.transaction("spending").store.index("userId")
  const allSpending = await spendIndex.getAll(userId)

  // Filter spending by month if provided
  const spending = month
    ? allSpending.filter((s) => s.date.startsWith(month))
    : allSpending.filter((s) => s.date.startsWith(new Date().toISOString().slice(0, 7)))

  // Calculate summary for each category
  const summaries: BudgetSummary[] = []

  for (const allocation of allocations) {
    const categorySpending = spending.filter((s) => s.categoryId === allocation.categoryId)
    const spent = categorySpending.reduce((sum, s) => sum + s.amount, 0)
    const remaining = allocation.amount - spent
    const percentUsed = allocation.amount > 0 ? (spent / allocation.amount) * 100 : 0

    let status: "healthy" | "warning" | "overspent" = "healthy"
    if (percentUsed >= 100) status = "overspent"
    else if (percentUsed >= 80) status = "warning"

    const category = await db.get("categories", allocation.categoryId)

    summaries.push({
      categoryId: allocation.categoryId,
      categoryName: category?.name || "Unknown",
      allocated: allocation.amount,
      spent,
      remaining,
      percentUsed,
      status,
    })
  }

  return summaries
}

/**
 * Generate spending insights using AI
 */
async function generateSpendingInsights(userId: string, categoryId: string, amount: number): Promise<void> {
  const db = await getDB()

  // Get budget summary to check for overspending
  const summary = await getBudgetSummary(userId)
  const categorySummary = summary.find((s) => s.categoryId === categoryId)

  if (!categorySummary) return

  // Generate alert if overspending
  if (categorySummary.status === "overspent") {
    const insight: CashFlowInsight = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "alert",
      title: `Overspending in ${categorySummary.categoryName}`,
      description: `You've spent $${categorySummary.spent.toFixed(2)} of your $${categorySummary.allocated.toFixed(2)} budget (${categorySummary.percentUsed.toFixed(0)}%)`,
      categoryId,
      amount: categorySummary.spent - categorySummary.allocated,
      priority: "high",
      actionable: true,
      action: "Review your spending and adjust your budget",
      createdAt: new Date().toISOString(),
      isRead: false,
    }

    await db.put("insights", insight)
  } else if (categorySummary.status === "warning") {
    const insight: CashFlowInsight = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "warning",
      title: `Approaching budget limit in ${categorySummary.categoryName}`,
      description: `You've used ${categorySummary.percentUsed.toFixed(0)}% of your budget with $${categorySummary.remaining.toFixed(2)} remaining`,
      categoryId,
      priority: "medium",
      actionable: true,
      action: "Consider reducing spending in this category",
      createdAt: new Date().toISOString(),
      isRead: false,
    }

    await db.put("insights", insight)
  }
}

/**
 * Get cash flow insights for a user
 */
export async function getCashFlowInsights(userId: string): Promise<CashFlowInsight[]> {
  const db = await getDB()
  const index = db.transaction("insights").store.index("userId")
  return index.getAll(userId)
}

/**
 * Conversational budget adjustment
 */
export async function adjustBudgetConversationally(userId: string, message: string): Promise<string> {
  const prompt = `User wants to adjust their budget. Parse this request and suggest changes:
"${message}"

Current budget summary: ${JSON.stringify(await getBudgetSummary(userId))}

Provide a natural language response with specific budget adjustments.`

  try {
    const response = await fetch("/api/ai/budget-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, userId }),
    })

    const data = await response.json()
    return data.response
  } catch (error) {
    console.error("[v0] Error in conversational budget adjustment:", error)
    return "I'm having trouble processing that request. Please try again."
  }
}
