"use client"

import { useState, useEffect } from "react"
import { useVault } from "@/lib/vault-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DollarSign,
  TrendingUp,
  RefreshCw,
  Zap,
  PieChart,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Building2,
} from "lucide-react"
import ApexSpinner from "@/components/apex-spinner"

interface Account {
  account_id: string
  name: string
  official_name: string
  type: string
  subtype: string
  mask: string
  balances: {
    available: number | null
    current: number
    limit: number | null
    iso_currency_code: string
    unofficial_currency_code: string | null
  }
}

interface BudgetCategory {
  categoryId: string
  categoryName: string
  allocated: number
  spent: number
  remaining: number
  percentUsed: number
  status: "healthy" | "warning" | "overspent"
}

interface CashFlowInsight {
  id: string
  type: "alert" | "warning" | "suggestion"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  actionable: boolean
  action?: string
  createdAt: string
  isRead: boolean
}

export default function FinancialCommandCenter() {
  const { userProfile } = useVault()
  const userId = userProfile?.email || "demo-user"

  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
  const [financialVelocity, setFinancialVelocity] = useState<number>(0)

  const [budgetSummary, setBudgetSummary] = useState<BudgetCategory[]>([])
  const [isLoadingBudget, setIsLoadingBudget] = useState(true)

  const [cashFlowInsights, setCashFlowInsights] = useState<CashFlowInsight[]>([])
  const [isLoadingInsights, setIsLoadingInsights] = useState(true)

  useEffect(() => {
    loadAllData()
  }, [userId])

  const loadAllData = async () => {
    await Promise.all([loadAccounts(), loadBudgetData(), loadInsights()])
  }

  const loadAccounts = async () => {
    setIsLoadingAccounts(true)
    try {
      const response = await fetch("/api/plaid/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: "demo-token" }),
      })

      const data = await response.json()
      setAccounts(data.accounts || [])

      const totalBalance = data.accounts.reduce((sum: number, acc: Account) => sum + acc.balances.current, 0)
      const velocity = ((totalBalance - 100000) / 100000) * 100 // Mock calculation
      setFinancialVelocity(velocity)
    } catch (error) {
      console.error("[v0] Error loading accounts:", error)
    } finally {
      setIsLoadingAccounts(false)
    }
  }

  const loadBudgetData = async () => {
    setIsLoadingBudget(true)
    try {
      const response = await fetch(`/api/budget/summary?userId=${userId}`)
      const data = await response.json()
      setBudgetSummary(data.summary || [])
    } catch (error) {
      console.error("[v0] Error loading budget data:", error)
    } finally {
      setIsLoadingBudget(false)
    }
  }

  const loadInsights = async () => {
    setIsLoadingInsights(true)
    try {
      const response = await fetch(`/api/insights/cash-flow?userId=${userId}`)
      const data = await response.json()
      setCashFlowInsights((data.insights || []).filter((i: CashFlowInsight) => !i.isRead))
    } catch (error) {
      console.error("[v0] Error loading insights:", error)
    } finally {
      setIsLoadingInsights(false)
    }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balances.current, 0)
  const totalAvailable = accounts.reduce((sum, acc) => sum + (acc.balances.available || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001F3F] via-[#002B4F] to-[#001F3F] p-6 space-y-6">
      {/* Header */}
      <div className="animate-fadeIn">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
          <Zap className="w-10 h-10 text-cyan-400" />
          Financial Command Center
        </h1>
        <p className="text-cyan-300/60 mt-2">Real-time financial intelligence powered by AI</p>
      </div>

      {/* Financial Velocity Dashboard */}
      <Card className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-6 hover:border-cyan-500/50 transition-all animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            Financial Velocity
          </h2>
          <Button
            onClick={loadAllData}
            disabled={isLoadingAccounts}
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
          >
            {isLoadingAccounts ? <ApexSpinner size={16} /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>

        {isLoadingAccounts ? (
          <div className="flex items-center justify-center py-12">
            <ApexSpinner size={32} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-4">
                <p className="text-cyan-300/60 text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Balance
                </p>
                <p className="text-3xl font-bold text-white mt-2">${totalBalance.toLocaleString()}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-300/60 text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Available Funds
                </p>
                <p className="text-3xl font-bold text-white mt-2">${totalAvailable.toLocaleString()}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
                <p className="text-purple-300/60 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Accounts
                </p>
                <p className="text-3xl font-bold text-white mt-2">{accounts.length}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-4">
                <p className="text-orange-300/60 text-sm flex items-center gap-2">
                  {financialVelocity >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  Financial Velocity
                </p>
                <p className={`text-3xl font-bold mt-2 ${financialVelocity >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {financialVelocity >= 0 ? "+" : ""}
                  {financialVelocity.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Accounts List */}
            {accounts.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-semibold text-cyan-300/80 mb-3">Connected Accounts</h3>
                {accounts.map((account) => (
                  <div
                    key={account.account_id}
                    className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-white">{account.name}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {account.type} • {account.subtype}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">${account.balances.current.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">****{account.mask}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      {/* AI Cash Flow Insights */}
      {isLoadingInsights ? (
        <Card className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-6">
          <div className="flex items-center justify-center py-8">
            <ApexSpinner size={32} />
          </div>
        </Card>
      ) : cashFlowInsights.length > 0 ? (
        <Card className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-6 animate-fadeIn">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            AI Cash Flow Insights
          </h2>
          <div className="space-y-3">
            {cashFlowInsights.slice(0, 5).map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border ${
                  insight.type === "alert"
                    ? "bg-red-500/10 border-red-500/30"
                    : insight.type === "warning"
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-blue-500/10 border-blue-500/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {insight.type === "alert" && <AlertCircle className="w-4 h-4 text-red-400" />}
                      {insight.type === "warning" && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                      {insight.type === "suggestion" && <CheckCircle className="w-4 h-4 text-blue-400" />}
                      <h3 className="font-semibold text-white">{insight.title}</h3>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{insight.description}</p>
                    {insight.actionable && insight.action && (
                      <p className="text-xs text-cyan-400 mt-2 flex items-center gap-1">
                        <span>→</span> {insight.action}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={insight.priority === "high" ? "destructive" : "secondary"}
                    className={`ml-4 ${
                      insight.priority === "high"
                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                        : insight.priority === "medium"
                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                    }`}
                  >
                    {insight.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Budget Overview */}
      <Card className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-6 animate-fadeIn">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
          <PieChart className="w-6 h-6 text-cyan-400" />
          Budget Overview
        </h2>

        {isLoadingBudget ? (
          <div className="flex items-center justify-center py-8">
            <ApexSpinner size={32} />
          </div>
        ) : budgetSummary.length > 0 ? (
          <div className="space-y-4">
            {budgetSummary.map((category) => (
              <div key={category.categoryId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{category.categoryName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                      ${category.spent.toFixed(0)} / ${category.allocated.toFixed(0)}
                    </span>
                    {category.status === "healthy" && <CheckCircle className="w-4 h-4 text-green-400" />}
                    {category.status === "warning" && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                    {category.status === "overspent" && <AlertCircle className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
                <Progress
                  value={Math.min(category.percentUsed, 100)}
                  className={`h-2 ${
                    category.status === "healthy"
                      ? "[&>div]:bg-green-500"
                      : category.status === "warning"
                        ? "[&>div]:bg-yellow-500"
                        : "[&>div]:bg-red-500"
                  }`}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{category.percentUsed.toFixed(1)}% used</span>
                  <span>${category.remaining.toFixed(0)} remaining</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-cyan-300/40 mb-4">
              No budget data available. Start tracking your spending to see insights.
            </p>
            <Button className="bg-cyan-500 hover:bg-cyan-600">Set Up Budget</Button>
          </div>
        )}
      </Card>
    </div>
  )
}
