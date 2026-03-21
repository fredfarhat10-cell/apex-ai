"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getApexStats, getStreakDays } from "@/lib/apex-stats"
import { TrendingUp, Calendar } from "lucide-react"

export function StatsPanel() {
  const [stats, setStats] = useState({
    conversationsCompleted: 0,
    daysActive: 0,
    favoriteMode: null as string | null,
    streak: 0,
  })

  useEffect(() => {
    const apexStats = getApexStats()
    const streak = getStreakDays()

    setStats({
      conversationsCompleted: apexStats.conversationsCompleted,
      daysActive: apexStats.daysActive.length,
      favoriteMode: apexStats.favoriteMode,
      streak,
    })
  }, [])

  const getModeLabel = (mode: string | null) => {
    if (!mode) return "Not set yet"
    return mode.charAt(0).toUpperCase() + mode.slice(1)
  }

  const getRewardMessage = () => {
    if (stats.streak >= 4) {
      return `You've used Apex ${stats.streak} days in a row — we're learning faster together.`
    }
    if (stats.conversationsCompleted >= 10) {
      return "You're building great habits with Apex!"
    }
    if (stats.daysActive >= 3) {
      return "Welcome back! Your consistency is impressive."
    }
    return "Keep exploring — every interaction makes Apex smarter."
  }

  return (
    <Card className="bg-apex-dark/40 backdrop-blur-xl border-apex-primary/30 p-6 glassmorphism">
      <h3 className="text-apex-primary font-bold text-lg mb-4 flex items-center gap-2">
        <TrendingUp size={20} />
        Your Progress
      </h3>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-apex-primary">{stats.conversationsCompleted}</div>
          <div className="text-xs text-apex-gray">Conversations</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-apex-primary">{stats.daysActive}</div>
          <div className="text-xs text-apex-gray">Days Active</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-apex-primary truncate">{getModeLabel(stats.favoriteMode)}</div>
          <div className="text-xs text-apex-gray">Favorite Mode</div>
        </div>
      </div>

      {stats.streak >= 2 && (
        <div className="flex items-center gap-2 p-3 bg-apex-primary/10 rounded-lg border border-apex-primary/20">
          <Calendar className="text-apex-primary flex-shrink-0" size={16} />
          <p className="text-xs text-apex-gray leading-relaxed">{getRewardMessage()}</p>
        </div>
      )}
    </Card>
  )
}
