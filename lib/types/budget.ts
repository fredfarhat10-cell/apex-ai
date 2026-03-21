// Budget and Cash Flow Management Types

export interface BudgetCategory {
  id: string
  name: string
  type: "essential" | "discretionary" | "savings" | "debt"
  icon?: string
  color?: string
  parentId?: string
  isDefault: boolean
}

export interface BudgetAllocation {
  id: string
  userId: string
  categoryId: string
  amount: number
  period: "monthly" | "weekly" | "yearly"
  startDate: string
  endDate?: string
  rollover: boolean
  createdAt: string
  updatedAt: string
}

export interface SpendingEntry {
  id: string
  userId: string
  categoryId: string
  amount: number
  date: string
  description: string
  transactionId?: string
  isRecurring: boolean
  createdAt: string
}

export interface BudgetSummary {
  categoryId: string
  categoryName: string
  allocated: number
  spent: number
  remaining: number
  percentUsed: number
  status: "healthy" | "warning" | "overspent"
}

export interface CashFlowInsight {
  id: string
  type: "alert" | "suggestion" | "achievement" | "warning"
  title: string
  description: string
  categoryId?: string
  amount?: number
  priority: "low" | "medium" | "high"
  actionable: boolean
  action?: string
  createdAt: string
  isRead: boolean
}
