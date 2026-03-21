"use client"

import { useState, useEffect } from "react"
import { useVault } from "@/lib/vault-context"
import { Gift, Lock, Unlock, Sparkles, TrendingUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Confetti from "react-confetti"
import type { JSX } from "react/jsx-runtime" // Declaring JSX variable

interface UnlockableFeature {
  id: string
  name: string
  description: string
  requiredShares: number
  icon: JSX.Element
  unlocked: boolean
}

export default function SharingRewards() {
  const { userProfile, updateState } = useVault()
  const [showConfetti, setShowConfetti] = useState(false)
  const [recentUnlock, setRecentUnlock] = useState<string | null>(null)
  const [personalizedInsight, setPersonalizedInsight] = useState<any>(null)

  const sharingLevel =
    (userProfile?.hobbies?.length || 0) + (userProfile?.interests?.length || 0) + (userProfile?.skills?.length || 0)

  const features: UnlockableFeature[] = [
    {
      id: "basic-tips",
      name: "Basic Tips",
      description: "Get general advice for your hobbies",
      requiredShares: 1,
      icon: <Sparkles className="w-5 h-5" />,
      unlocked: sharingLevel >= 1,
    },
    {
      id: "studio-preview",
      name: "Studio Preview",
      description: "See your personalized studio spaces",
      requiredShares: 2,
      icon: <TrendingUp className="w-5 h-5" />,
      unlocked: sharingLevel >= 2,
    },
    {
      id: "custom-plans",
      name: "Custom Plans",
      description: "AI-generated practice schedules",
      requiredShares: 3,
      icon: <Gift className="w-5 h-5" />,
      unlocked: sharingLevel >= 3,
    },
    {
      id: "advanced-insights",
      name: "Advanced Insights",
      description: "Deep personalization and predictions",
      requiredShares: 5,
      icon: <Unlock className="w-5 h-5" />,
      unlocked: sharingLevel >= 5,
    },
  ]

  useEffect(() => {
    const fetchInsights = async () => {
      if (sharingLevel > 0) {
        try {
          const response = await fetch("/api/ai/personalized-insights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userProfile,
              hobbies: userProfile?.hobbies,
              aura: "Neutral", // Will be replaced with actual aura from context
              sharingLevel,
            }),
          })
          const data = await response.json()
          setPersonalizedInsight(data)
        } catch (error) {
          console.error("Failed to fetch insights:", error)
        }
      }
    }

    fetchInsights()
  }, [sharingLevel, userProfile])

  useEffect(() => {
    const justUnlocked = features.find((f) => f.unlocked && f.requiredShares === sharingLevel)
    if (justUnlocked) {
      setRecentUnlock(justUnlocked.name)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [sharingLevel])

  return (
    <div className="space-y-6">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

      {/* Sharing Progress */}
      <div className="bg-gradient-to-r from-apex-primary/20 to-purple-500/20 border border-apex-primary/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Your Sharing Progress</h3>
          <div className="text-2xl font-bold text-apex-accent">{sharingLevel}/5</div>
        </div>
        <div className="w-full bg-apex-darker rounded-full h-3 mb-2">
          <motion.div
            className="bg-gradient-to-r from-apex-primary to-purple-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(sharingLevel / 5) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-sm text-apex-gray">Share more about yourself to unlock personalized features!</p>
      </div>

      {/* Recent Unlock Notification */}
      <AnimatePresence>
        {recentUnlock && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-500/20 border border-green-500/50 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <Unlock className="w-6 h-6 text-green-400" />
              <div>
                <p className="font-semibold text-white">Feature Unlocked!</p>
                <p className="text-sm text-apex-gray">{recentUnlock}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personalized Insight */}
      {personalizedInsight && (
        <div className="bg-apex-dark border border-apex-primary/30 rounded-lg p-6 space-y-4">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-apex-accent" />
            Personalized for You
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-apex-accent">Your Tip:</p>
              <p className="text-sm text-apex-gray">{personalizedInsight.tip}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-apex-accent">Next Unlock:</p>
              <p className="text-sm text-apex-gray">{personalizedInsight.nextUnlock}</p>
            </div>
            <div className="bg-apex-primary/10 border border-apex-primary/30 rounded p-3">
              <p className="text-sm text-white">{personalizedInsight.encouragement}</p>
            </div>
          </div>
        </div>
      )}

      {/* Unlockable Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`border rounded-lg p-4 transition-all ${
              feature.unlocked ? "bg-apex-primary/10 border-apex-primary/50" : "bg-apex-darker border-gray-700"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    feature.unlocked ? "bg-apex-primary/20 text-apex-accent" : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {feature.unlocked ? feature.icon : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className={`font-semibold ${feature.unlocked ? "text-white" : "text-gray-500"}`}>
                    {feature.name}
                  </h4>
                  <p className="text-xs text-apex-gray">{feature.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-apex-gray">
                {feature.unlocked ? "Unlocked!" : `${feature.requiredShares} shares needed`}
              </span>
              {!feature.unlocked && (
                <span className="text-apex-accent">{feature.requiredShares - sharingLevel} more to go</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
