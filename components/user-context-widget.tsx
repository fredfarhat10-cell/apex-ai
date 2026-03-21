"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { userContextManager } from "@/lib/user-context-manager"
import type { UserProfile, LearnedFact } from "@/lib/types/user-context"
import { UserIcon, BrainIcon, TargetIcon, TrendingUpIcon } from "@/components/icons"

export default function UserContextWidget() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [facts, setFacts] = useState<LearnedFact[]>([])
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadContext()
  }, [])

  const loadContext = () => {
    const userProfile = userContextManager.getUserProfile()
    const learnedFacts = userContextManager.getLearnedFacts()

    if (!userProfile) {
      // Initialize default profile
      const defaultProfile = userContextManager.getUserContext().profile
      userContextManager.saveUserProfile(defaultProfile)
      setProfile(defaultProfile)
    } else {
      setProfile(userProfile)
    }

    setFacts(learnedFacts.slice(0, 5))
  }

  if (!profile) return null

  const highPriorityGoals = profile.goals.filter((g) => g.priority === "high").length
  const activeHabits = profile.habits.length
  const focusAreas = profile.preferences.focusAreas

  return (
    <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
            <UserIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Your Context</h3>
            <p className="text-sm text-slate-400">What Apex knows about you</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="text-cyan-400 hover:text-cyan-300"
        >
          {showDetails ? "Hide" : "Show"} Details
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
          <TargetIcon className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{highPriorityGoals}</div>
          <div className="text-xs text-slate-400">Active Goals</div>
        </div>

        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
          <TrendingUpIcon className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{activeHabits}</div>
          <div className="text-xs text-slate-400">Habits</div>
        </div>

        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
          <BrainIcon className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{facts.length}</div>
          <div className="text-xs text-slate-400">Learned Facts</div>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-4 pt-4 border-t border-slate-700/50">
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Focus Areas</h4>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((area) => (
                <Badge key={area} variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Communication Style</h4>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 capitalize">
              {profile.preferences.communicationStyle}
            </Badge>
          </div>

          {facts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Recent Learnings</h4>
              <ul className="space-y-1">
                {facts.slice(0, 3).map((fact) => (
                  <li key={fact.id} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span>{fact.fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
