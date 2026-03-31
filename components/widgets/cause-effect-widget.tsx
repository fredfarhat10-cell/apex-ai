"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp, TrendingDown, Zap, ArrowRight } from "lucide-react"

interface CausalRelationship {
  id: string
  cause: string
  effect: string
  correlation: number
  impact: "high" | "medium" | "low"
  trend: "positive" | "negative" | "neutral"
  insight: string
}

export function CauseEffectWidget() {
  const [topRelationship, setTopRelationship] = useState<CausalRelationship | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Load the top causal relationship
    const mockRelationships: CausalRelationship[] = [
      {
        id: "1",
        cause: "Sleep < 6 hours",
        effect: "Productivity drops 40%",
        correlation: 0.87,
        impact: "high",
        trend: "negative",
        insight:
          "When you sleep less than 6 hours, your productivity consistently drops by 40% the next day. This pattern has been observed 12 times in the last 90 days.",
      },
      {
        id: "2",
        cause: "Morning workout completed",
        effect: "Focus score +25%",
        correlation: 0.92,
        impact: "high",
        trend: "positive",
        insight:
          "Morning workouts are strongly correlated with improved focus throughout the day. Your focus score increases by an average of 25% on workout days.",
      },
    ]

    // Get the highest correlation relationship
    const top = mockRelationships.sort((a, b) => b.correlation - a.correlation)[0]
    setTopRelationship(top)
  }, [])

  if (!topRelationship) {
    return (
      <Card className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No patterns detected yet</p>
            <p className="text-gray-500 text-xs mt-1">Keep logging data for insights</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/20"
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
      case "low":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20"
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-400" />
      default:
        return null
    }
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Top Correlation</h3>
          </div>
          <Badge variant="outline" className={`text-xs ${getImpactColor(topRelationship.impact)}`}>
            {topRelationship.impact.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTrendIcon(topRelationship.trend)}
              <span className="text-xs text-gray-500">
                {(topRelationship.correlation * 100).toFixed(0)}% correlation
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-3 h-3 text-yellow-400 flex-shrink-0" />
              <span className="text-gray-300">{topRelationship.cause}</span>
            </div>
            <div className="flex items-center gap-2 text-sm ml-5">
              <span className="text-gray-500">→</span>
              <span className="text-white font-medium">{topRelationship.effect}</span>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-white/10 animate-fadeIn">
              <p className="text-xs uppercase tracking-widest text-purple-400 mb-2">AI Insight</p>
              <p className="text-sm text-gray-300 leading-relaxed">{topRelationship.insight}</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          >
            {isExpanded ? "Show Less" : "Show Insight"}
          </Button>
          <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
