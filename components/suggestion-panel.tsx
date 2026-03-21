"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, TrendingUp, CheckCircle, XCircle, BarChart3, RefreshCw } from "lucide-react"
import {
  generateSuggestions,
  getActiveSuggestions,
  recordFeedback,
  getSuggestionStats,
  clearOldSuggestions,
} from "@/lib/suggestion-engine"
import type { Suggestion, SuggestionStats } from "@/lib/types/suggestion"

export function SuggestionPanel() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [stats, setStats] = useState<SuggestionStats | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSuggestions()
    loadStats()
  }, [])

  const loadSuggestions = async () => {
    setIsLoading(true)
    try {
      const active = await getActiveSuggestions()
      setSuggestions(active)
    } catch (error) {
      console.error("[v0] Failed to load suggestions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const suggestionStats = await getSuggestionStats()
      setStats(suggestionStats)
    } catch (error) {
      console.error("[v0] Failed to load stats:", error)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const newSuggestions = await generateSuggestions()
      setSuggestions(newSuggestions)
      await loadStats()
    } catch (error) {
      console.error("[v0] Failed to generate suggestions:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAccept = async (suggestionId: string) => {
    await recordFeedback(suggestionId, true)
    await loadSuggestions()
    await loadStats()
  }

  const handleReject = async (suggestionId: string) => {
    await recordFeedback(suggestionId, false)
    await loadSuggestions()
    await loadStats()
  }

  const handleClearOld = async () => {
    const deleted = await clearOldSuggestions(30)
    alert(`Cleared ${deleted} old suggestions`)
    await loadStats()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/50"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "action":
        return "⚡"
      case "reminder":
        return "🔔"
      case "insight":
        return "💡"
      case "recommendation":
        return "⭐"
      case "question":
        return "❓"
      default:
        return "📌"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Proactive Suggestion Engine
          </CardTitle>
          <CardDescription>AI-powered contextual suggestions that learn from your feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1">
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Generating..." : "Generate Suggestions"}
            </Button>
            <Button variant="outline" onClick={handleClearOld}>
              Clear Old
            </Button>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Suggestions</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-3">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading suggestions...</p>
              ) : suggestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active suggestions. Click "Generate Suggestions" to get started.
                </p>
              ) : (
                suggestions.map((suggestion) => (
                  <Card key={suggestion.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2 items-center">
                          <span className="text-2xl">{getTypeIcon(suggestion.type)}</span>
                          <div>
                            <h3 className="font-semibold">{suggestion.title}</h3>
                            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getPriorityColor(suggestion.priority)}>{suggestion.priority}</Badge>
                        <Badge variant="secondary">{suggestion.category}</Badge>
                        <Badge variant="outline">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {(suggestion.metadata.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAccept(suggestion.id)} className="flex-1">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(suggestion.id)}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Dismiss
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              {stats && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Generated</p>
                      <p className="text-2xl font-bold">{stats.totalGenerated}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Accepted</p>
                      <p className="text-2xl font-bold text-green-400">{stats.totalAccepted}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold text-red-400">{stats.totalRejected}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                      <p className="text-2xl font-bold">{(stats.acceptanceRate * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  {stats.topCategories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Top Categories
                      </h3>
                      <div className="space-y-2">
                        {stats.topCategories.map((cat) => (
                          <div key={cat.category} className="flex justify-between items-center">
                            <span className="text-sm">{cat.category}</span>
                            <div className="flex gap-2 items-center">
                              <Badge variant="secondary">{cat.count} suggestions</Badge>
                              <Badge variant="outline">{(cat.acceptanceRate * 100).toFixed(0)}% accepted</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
