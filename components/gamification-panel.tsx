"use client"

import { useState, useEffect } from "react"
import { Trophy, Star, Zap, Target, TrendingUp, Award, Lock } from "lucide-react"
import { Analytics } from "@/lib/analytics"

interface Badge {
  id: string
  name: string
  description: string
  icon: any
  unlocked: boolean
  progress?: number
  maxProgress?: number
  rarity: "common" | "rare" | "epic" | "legendary"
}

export default function GamificationPanel() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [stats, setStats] = useState({
    totalTasks: 0,
    timeSaved: 0,
    insights: 0,
  })

  useEffect(() => {
    loadBadges()
    loadStats()
  }, [])

  const loadStats = () => {
    const summary = Analytics.getSummary()
    const featureUsage = Analytics.getFeatureUsage()

    setStats({
      totalTasks: featureUsage.reduce((sum, f) => sum + f.count, 0),
      timeSaved: Math.floor(summary.totalTimeSpent / 1000 / 60 / 60), // Convert to hours
      insights: featureUsage.filter((f) => f.feature.includes("insight") || f.feature.includes("analysis")).length,
    })
  }

  const loadBadges = () => {
    const summary = Analytics.getSummary()
    const featureUsage = Analytics.getFeatureUsage()
    const totalEvents = featureUsage.reduce((sum, f) => sum + f.count, 0)

    const allBadges: Badge[] = [
      {
        id: "first-steps",
        name: "First Steps",
        description: "Complete your first task",
        icon: Star,
        unlocked: totalEvents >= 1,
        progress: Math.min(totalEvents, 1),
        maxProgress: 1,
        rarity: "common",
      },
      {
        id: "automator",
        name: "Automator",
        description: "Automate 100 tasks",
        icon: Zap,
        unlocked: totalEvents >= 100,
        progress: Math.min(totalEvents, 100),
        maxProgress: 100,
        rarity: "rare",
      },
      {
        id: "efficiency-expert",
        name: "Efficiency Expert",
        description: "Save 10 hours with AI assistance",
        icon: TrendingUp,
        unlocked: summary.totalTimeSpent >= 10 * 60 * 60 * 1000,
        progress: Math.min(Math.floor(summary.totalTimeSpent / 1000 / 60 / 60), 10),
        maxProgress: 10,
        rarity: "epic",
      },
      {
        id: "synergist",
        name: "Synergist",
        description: "Unlock your first cross-domain insight",
        icon: Target,
        unlocked: featureUsage.some((f) => f.feature.includes("insight")),
        progress: featureUsage.filter((f) => f.feature.includes("insight")).length,
        maxProgress: 1,
        rarity: "rare",
      },
      {
        id: "power-user",
        name: "Power User",
        description: "Use Apex for 30 consecutive days",
        icon: Trophy,
        unlocked: summary.sessionCount >= 30,
        progress: Math.min(summary.sessionCount, 30),
        maxProgress: 30,
        rarity: "epic",
      },
      {
        id: "master",
        name: "Apex Master",
        description: "Complete 1000 tasks and save 100 hours",
        icon: Award,
        unlocked: totalEvents >= 1000 && summary.totalTimeSpent >= 100 * 60 * 60 * 1000,
        progress: Math.min(totalEvents, 1000),
        maxProgress: 1000,
        rarity: "legendary",
      },
    ]

    setBadges(allBadges)
  }

  const getRarityColor = (rarity: Badge["rarity"]) => {
    switch (rarity) {
      case "common":
        return "border-gray-500 bg-gray-500/10"
      case "rare":
        return "border-blue-400 bg-blue-400/10"
      case "epic":
        return "border-purple-400 bg-purple-400/10"
      case "legendary":
        return "border-[#FF6B00] bg-[#FF6B00]/10"
    }
  }

  const getRarityGlow = (rarity: Badge["rarity"]) => {
    switch (rarity) {
      case "legendary":
        return "apex-glow"
      case "epic":
        return "shadow-lg shadow-purple-500/20"
      default:
        return ""
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#0A0A0F] text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-6 h-6 text-[#FF6B00]" />
          <h2 className="text-2xl font-bold gradient-text">Achievements</h2>
        </div>
        <p className="text-gray-400 text-sm">Track your progress and unlock badges</p>
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-effect p-4 rounded-xl border border-gray-700 text-center">
            <div className="text-2xl font-bold text-[#FF6B00] mb-1">{stats.totalTasks}</div>
            <div className="text-xs text-gray-400">Tasks Completed</div>
          </div>
          <div className="glass-effect p-4 rounded-xl border border-gray-700 text-center">
            <div className="text-2xl font-bold text-[#FF6B00] mb-1">{stats.timeSaved}h</div>
            <div className="text-xs text-gray-400">Time Saved</div>
          </div>
          <div className="glass-effect p-4 rounded-xl border border-gray-700 text-center">
            <div className="text-2xl font-bold text-[#FF6B00] mb-1">{stats.insights}</div>
            <div className="text-xs text-gray-400">Insights</div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon
            return (
              <div
                key={badge.id}
                className={`glass-effect p-6 rounded-2xl border transition-all ${getRarityColor(badge.rarity)} ${
                  badge.unlocked ? getRarityGlow(badge.rarity) : "opacity-50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      badge.unlocked ? "bg-[#FF6B00]" : "bg-gray-700"
                    }`}
                  >
                    {badge.unlocked ? (
                      <Icon className="w-7 h-7 text-white" />
                    ) : (
                      <Lock className="w-7 h-7 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{badge.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{badge.description}</p>

                    {/* Progress bar */}
                    {badge.maxProgress && badge.maxProgress > 1 && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Progress</span>
                          <span className="text-xs text-gray-400">
                            {badge.progress}/{badge.maxProgress}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8533] transition-all duration-500"
                            style={{
                              width: `${((badge.progress || 0) / badge.maxProgress) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Rarity badge */}
                    <div className="mt-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(badge.rarity)} capitalize`}
                      >
                        {badge.rarity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
