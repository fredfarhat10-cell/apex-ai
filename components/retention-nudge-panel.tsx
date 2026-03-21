"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Sparkles, Target, Trophy, Lightbulb } from "lucide-react"
import { checkForNudges, dismissNudge, type RetentionNudge, updateLastActivity } from "@/lib/retention-hooks"
import { useVault } from "@/lib/vault-context"
import { useRouter } from "next/navigation"

export function RetentionNudgePanel() {
  const [nudge, setNudge] = useState<RetentionNudge | null>(null)
  const { habits, habitLogs } = useVault()
  const router = useRouter()

  useEffect(() => {
    updateLastActivity()

    const checkNudges = () => {
      const newNudge = checkForNudges(habits || [], habitLogs || [])
      if (newNudge) {
        setNudge(newNudge)
      }
    }

    checkNudges()
    const interval = setInterval(checkNudges, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [habits, habitLogs])

  if (!nudge) return null

  const getIcon = () => {
    switch (nudge.type) {
      case "habit-reminder":
        return <Target className="w-5 h-5 text-purple-400" />
      case "practice-prompt":
        return <Sparkles className="w-5 h-5 text-cyan-400" />
      case "milestone-celebration":
        return <Trophy className="w-5 h-5 text-yellow-400" />
      case "tip":
        return <Lightbulb className="w-5 h-5 text-blue-400" />
      default:
        return <Sparkles className="w-5 h-5 text-purple-400" />
    }
  }

  const handleDismiss = () => {
    if (nudge.id) dismissNudge(nudge.id)
    setNudge(null)
  }

  const handleAction = () => {
    if (nudge.actionUrl) {
      router.push(nudge.actionUrl)
    }
    handleDismiss()
  }

  return (
    <Card className="fixed bottom-8 right-8 z-50 w-96 bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-xl border-purple-500/30 shadow-2xl animate-fade-in">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h3 className="font-bold text-white text-lg">{nudge.title}</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-200 text-sm mb-4 leading-relaxed">{nudge.message}</p>

        {nudge.actionLabel && (
          <Button
            onClick={handleAction}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-300"
          >
            {nudge.actionLabel}
          </Button>
        )}
      </div>
    </Card>
  )
}
