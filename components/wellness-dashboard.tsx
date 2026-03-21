"use client"

import { useState, useEffect } from "react"
import type { MorningBriefing } from "@/lib/types/wellness"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Heart, Moon, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react"

interface WellnessDashboardProps {
  userId: string
}

export function WellnessDashboard({ userId }: WellnessDashboardProps) {
  const [briefing, setBriefing] = useState<MorningBriefing | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadMorningBriefing()
  }, [userId])

  const loadMorningBriefing = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/wellness/morning-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setBriefing(data.briefing)
      }
    } catch (error) {
      console.error("Failed to load briefing:", error)
    } finally {
      setLoading(false)
    }
  }

  const syncWearable = async (deviceType: "whoop" | "garmin") => {
    setSyncing(true)
    try {
      // In a real app, you'd get the access token from secure storage
      const accessToken = localStorage.getItem(`${deviceType}_token`)

      const response = await fetch("/api/wellness/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, deviceType, accessToken }),
      })

      if (response.ok) {
        await loadMorningBriefing()
      }
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      setSyncing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 67) return "text-green-500"
    if (score >= 34) return "text-yellow-500"
    return "text-red-500"
  }

  const getActivityLevelBadge = (level: MorningBriefing["activityLevel"]) => {
    const variants = {
      rest: "destructive",
      light: "secondary",
      moderate: "default",
      intense: "default",
    }
    return variants[level] as any
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (!briefing) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground mb-4">
            No wellness data available. Connect your wearable to get started.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => syncWearable("whoop")} disabled={syncing}>
              Connect Whoop
            </Button>
            <Button onClick={() => syncWearable("garmin")} disabled={syncing}>
              Connect Garmin
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Morning Briefing Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Morning Briefing
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={loadMorningBriefing} disabled={syncing}>
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Score */}
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(briefing.primaryScore)}`}>{briefing.primaryScore}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              {briefing.scoreType === "recovery" ? "Recovery Score" : "Body Battery"}
            </p>
            <Badge className="mt-2" variant={getActivityLevelBadge(briefing.activityLevel)}>
              {briefing.activityLevel.toUpperCase()} Activity Recommended
            </Badge>
          </div>

          {/* Recommendation */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm">{briefing.recommendation}</p>
          </div>

          {/* Warnings */}
          {briefing.warnings.length > 0 && (
            <div className="space-y-2">
              {briefing.warnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-2 bg-destructive/10 rounded-lg p-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{warning}</p>
                </div>
              ))}
            </div>
          )}

          {/* Insights */}
          {briefing.insights.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Today's Insights</h4>
              {briefing.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 bg-primary/5 rounded-lg p-3">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">--</p>
              <p className="text-xs text-muted-foreground">Resting HR</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Moon className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">--</p>
              <p className="text-xs text-muted-foreground">Sleep Hours</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
