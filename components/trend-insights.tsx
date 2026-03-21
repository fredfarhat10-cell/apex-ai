"use client"

import { useEffect } from "react"
import { useVault } from "@/lib/vault-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendAnalyzer } from "@/lib/trend-analyzer"
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react"

export default function TrendInsights() {
  const { trendAnalysis, updateState, ...state } = useVault()

  const refreshAnalysis = () => {
    const analysis = TrendAnalyzer.analyze(state as any)
    updateState("trendAnalysis", analysis)
  }

  useEffect(() => {
    // Auto-refresh analysis if it's stale (older than 1 hour)
    if (!trendAnalysis || new Date().getTime() - new Date(trendAnalysis.lastUpdated).getTime() > 3600000) {
      refreshAnalysis()
    }
  }, [])

  if (!trendAnalysis) {
    return (
      <Card className="bg-apex-dark border-gray-800 p-6">
        <Button onClick={refreshAnalysis} className="w-full bg-apex-primary hover:bg-apex-primary/80">
          <RefreshCw size={16} className="mr-2" />
          Generate Trend Analysis
        </Button>
      </Card>
    )
  }

  const getTrendIcon = (trend: string) => {
    if (trend === "increasing" || trend === "improving") return <TrendingUp className="text-green-400" size={20} />
    if (trend === "decreasing" || trend === "declining") return <TrendingDown className="text-red-400" size={20} />
    return <Minus className="text-gray-400" size={20} />
  }

  return (
    <Card className="bg-apex-dark border-gray-800 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Trend Insights</h3>
        <Button variant="ghost" size="sm" onClick={refreshAnalysis}>
          <RefreshCw size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-apex-darker rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {getTrendIcon(trendAnalysis.spendingPattern)}
            <p className="text-sm text-apex-gray">Spending</p>
          </div>
          <p className="text-lg font-semibold text-white capitalize">{trendAnalysis.spendingPattern}</p>
        </div>

        <div className="p-4 bg-apex-darker rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {getTrendIcon(trendAnalysis.productivityTrend)}
            <p className="text-sm text-apex-gray">Productivity</p>
          </div>
          <p className="text-lg font-semibold text-white capitalize">{trendAnalysis.productivityTrend}</p>
        </div>

        <div className="p-4 bg-apex-darker rounded-lg">
          <p className="text-sm text-apex-gray mb-2">Habit Rate</p>
          <p className="text-lg font-semibold text-white">{trendAnalysis.habitCompletionRate}%</p>
        </div>

        <div className="p-4 bg-apex-darker rounded-lg">
          <p className="text-sm text-apex-gray mb-2">Stress Level</p>
          <p className="text-lg font-semibold text-white capitalize">{trendAnalysis.stressPattern}</p>
        </div>
      </div>

      {trendAnalysis.recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-apex-accent">Recommendations</h4>
          <ul className="space-y-2">
            {trendAnalysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-apex-gray">
                <span className="text-apex-accent mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-apex-gray text-center">
        Last updated: {new Date(trendAnalysis.lastUpdated).toLocaleString()}
      </p>
    </Card>
  )
}
