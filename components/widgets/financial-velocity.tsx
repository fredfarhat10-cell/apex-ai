"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import type { PlaidAccount, PlaidTransaction } from "@/lib/types/plaid"

export function FinancialVelocity() {
  const [accounts, setAccounts] = useState<PlaidAccount[]>([])
  const [transactions, setTransactions] = useState<PlaidTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [provider, setProvider] = useState<string | null>(null)

  useEffect(() => {
    loadFinancialData()
  }, [])

  const loadFinancialData = () => {
    // Check which financial provider is connected
    const integrations = localStorage.getItem("apex_integrations")
    if (!integrations) {
      setIsLoading(false)
      return
    }

    const parsed = JSON.parse(integrations)
    const financialIntegration = parsed.find((int: any) => int.type === "financial" && int.status === "connected")

    if (!financialIntegration) {
      setIsLoading(false)
      return
    }

    setProvider(financialIntegration.provider)

    // Load synced data
    const syncedData = localStorage.getItem(`apex_${financialIntegration.provider}_data`)
    if (syncedData) {
      const parsed = JSON.parse(syncedData)
      if (parsed.accounts) setAccounts(parsed.accounts)
      if (parsed.transactions) setTransactions(parsed.transactions)
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <Card className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10">
        <CardContent className="pt-6">
          <p className="text-gray-400 text-center">Loading financial data...</p>
        </CardContent>
      </Card>
    )
  }

  if (accounts.length === 0 || !provider) {
    return (
      <Card className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10">
        <CardContent className="pt-6">
          <div className="text-center">
            <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No financial data available</p>
            <p className="text-sm text-gray-500">Connect a bank account in the Integration Hub</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate total net worth
  const totalNetWorth = accounts.reduce((sum, acc) => {
    const current = acc.balances.current || 0
    return sum + current
  }, 0)

  // Calculate 30-day change from transactions
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentTransactions = transactions.filter((txn) => new Date(txn.date) >= thirtyDaysAgo)
  const netChange = recentTransactions.reduce((sum, txn) => sum - txn.amount, 0) // Negative because Plaid uses positive for debits
  const changePercent = totalNetWorth > 0 ? (netChange / totalNetWorth) * 100 : 0

  const isPositive = changePercent >= 0
  const currency = accounts[0]?.balances.iso_currency_code || "USD"

  return (
    <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Financial Velocity</h3>
          <Badge variant="outline" className="text-xs capitalize">
            {provider === "plaid" ? "Plaid" : "TrueLayer"}
          </Badge>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Total Net Worth</p>
          <p className="text-4xl font-bold text-white mb-2">
            {currency === "GBP" ? "£" : "$"}
            {Math.abs(totalNetWorth).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <span className={`text-sm font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
              {isPositive ? "+" : ""}
              {changePercent.toFixed(2)}%
            </span>
            <span className="text-xs text-gray-500">30-day change</span>
          </div>
        </div>

        <div className="space-y-2">
          {accounts.slice(0, 3).map((account) => (
            <div key={account.account_id} className="bg-black/20 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-white">{account.name}</p>
                  <p className="text-xs text-gray-500">••••{account.mask}</p>
                </div>
                <p className="text-sm font-semibold text-white">
                  {currency === "GBP" ? "£" : "$"}
                  {Math.abs(account.balances.current || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-400">
            {isPositive
              ? `Your net worth increased by ${currency === "GBP" ? "£" : "$"}${Math.abs(netChange).toFixed(2)} over the last 30 days. Strong financial momentum.`
              : `Your net worth decreased by ${currency === "GBP" ? "£" : "$"}${Math.abs(netChange).toFixed(2)} over the last 30 days. Review spending patterns.`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
