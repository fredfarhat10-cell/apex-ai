"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Activity, Brain, Zap } from "lucide-react"

interface CausalRelationship {
  id: string
  cause: string
  effect: string
  correlation: number
  impact: "high" | "medium" | "low"
  trend: "positive" | "negative" | "neutral"
  insight: string
  actionable: string
}

export function CauseEffectPanel() {
  const [relationships, setRelationships] = useState<CausalRelationship[]>([])
  const [selectedRelationship, setSelectedRelationship] = useState<CausalRelationship | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadCausalRelationships()
  }, [])

  const loadCausalRelationships = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/weekly-sync/causal-analysis")

      if (response.ok) {
        const data = await response.json()
        if (data.relationships && data.relationships.length > 0) {
          setRelationships(data.relationships)
          return
        }
      }

      // Fallback to mock data if no weekly sync data available
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
          actionable:
            "Set a bedtime reminder for 10:30 PM to ensure 7+ hours of sleep. Your most productive days follow 7-8 hour sleep nights.",
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
          actionable:
            "Schedule workouts for 7 AM on weekdays. This timing maximizes your focus during peak work hours (9 AM - 2 PM).",
        },
        {
          id: "3",
          cause: "Caffeine after 2 PM",
          effect: "Sleep quality -30%",
          correlation: 0.78,
          impact: "medium",
          trend: "negative",
          insight:
            "Consuming caffeine after 2 PM reduces your sleep quality by 30% on average. This creates a negative cycle affecting next-day performance.",
          actionable:
            "Switch to decaf or herbal tea after 2 PM. Consider a 15-minute walk instead for afternoon energy boosts.",
        },
        {
          id: "4",
          cause: "Deep work blocks > 90 min",
          effect: "Creative output +45%",
          correlation: 0.85,
          impact: "high",
          trend: "positive",
          insight:
            "Extended deep work sessions (90+ minutes) significantly boost your creative output. Your best work happens in these uninterrupted blocks.",
          actionable:
            "Block 2-hour deep work sessions on your calendar. Use 'Do Not Disturb' mode and work on your most important creative tasks during these windows.",
        },
        {
          id: "5",
          cause: "Social interaction < 2 hours/week",
          effect: "Mood score -20%",
          correlation: 0.73,
          impact: "medium",
          trend: "negative",
          insight:
            "Weeks with less than 2 hours of social interaction show a 20% decrease in your mood score. Social connection is a key wellness factor for you.",
          actionable:
            "Schedule at least one social activity per week. Coffee with friends, team lunches, or hobby groups all contribute to better mood stability.",
        },
      ]

      setRelationships(mockRelationships)
    } catch (error) {
      console.error("[v0] Failed to load causal relationships:", error)
    } finally {
      setIsLoading(false)
    }
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
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Cause & Effect Engine</h2>
            <p className="text-xs text-gray-400">Hidden patterns in your 90-day data</p>
          </div>
        </div>
        <Button
          onClick={loadCausalRelationships}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="border-purple-500/20 hover:border-purple-500/40 bg-transparent"
        >
          {isLoading ? "Analyzing..." : "Refresh"}
        </Button>
      </div>

      {/* Relationships List */}
      <div className="space-y-3">
        {relationships.map((rel) => (
          <Card
            key={rel.id}
            onClick={() => setSelectedRelationship(rel)}
            className={`p-4 cursor-pointer transition-all hover:border-purple-500/40 ${
              selectedRelationship?.id === rel.id ? "border-purple-500/60 bg-purple-500/5" : "border-white/10"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTrendIcon(rel.trend)}
                <span className={`text-xs px-2 py-0.5 rounded border ${getImpactColor(rel.impact)}`}>
                  {rel.impact.toUpperCase()} IMPACT
                </span>
              </div>
              <span className="text-xs text-gray-500">{(rel.correlation * 100).toFixed(0)}% correlation</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-gray-300">{rel.cause}</span>
              </div>
              <div className="flex items-center gap-2 text-sm ml-5">
                <span className="text-gray-500">→</span>
                <span className="text-white font-medium">{rel.effect}</span>
              </div>
            </div>

            {selectedRelationship?.id === rel.id && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-fadeIn">
                <div>
                  <p className="text-xs uppercase tracking-widest text-purple-400 mb-1">Insight</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{rel.insight}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-green-400 mb-1">Actionable Step</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{rel.actionable}</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {relationships.length === 0 && !isLoading && (
        <Card className="p-8 text-center border-white/10">
          <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No causal relationships detected yet.</p>
          <p className="text-gray-500 text-xs mt-1">Keep logging data for 90 days to unlock insights.</p>
        </Card>
      )}
    </div>
  )
}
