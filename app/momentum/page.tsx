"use client"

import { useState, useEffect } from "react"
import { useMomentumStore } from "@/lib/momentum-store"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Trophy, Users, BarChart3, MessageCircle } from "lucide-react"
import MomentumOnboarding from "@/components/momentum/onboarding"
import MomentumHomeDashboard from "@/components/momentum/home-dashboard"
import HabitVerification from "@/components/momentum/habit-verification"
import ChallengeDetail from "@/components/momentum/challenge-detail"
import ComebackEngine from "@/components/momentum/comeback-engine"
import PodScreen from "@/components/momentum/pod-screen"
import StatsScreen from "@/components/momentum/stats-screen"
import CoachChat from "@/components/momentum/coach-chat"

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "challenges", label: "Challenges", icon: Trophy },
  { id: "pod", label: "Pod", icon: Users },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "coach", label: "Coach", icon: MessageCircle },
]

export default function MomentumPage() {
  const { user, activeTab, setActiveTab, verifyingHabitId, comebackActive } = useMomentumStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Wait for Zustand persist hydration
    const unsub = useMomentumStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    // If already hydrated (e.g. no persisted data)
    if (useMomentumStore.persist.hasHydrated()) {
      setHydrated(true)
    }
    return () => { unsub() }
  }, [])

  if (!hydrated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0B1120]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Show onboarding if no user profile
  if (!user?.onboardingComplete) {
    return <MomentumOnboarding />
  }

  // Show comeback engine if triggered
  if (comebackActive) {
    return <ComebackEngine />
  }

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return <MomentumHomeDashboard />
      case "challenges":
        return <ChallengeDetail />
      case "pod":
        return <PodScreen />
      case "stats":
        return <StatsScreen />
      case "coach":
        return <CoachChat />
      default:
        return <MomentumHomeDashboard />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#0B1120] max-w-md mx-auto relative">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Habit Verification Overlay */}
      {verifyingHabitId && <HabitVerification />}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0D1525]/95 backdrop-blur-xl border-t border-white/5 px-2 pt-2 pb-6 z-40">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1 py-1 px-3 relative"
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Center add button special style */}
                {tab.id === "pod" ? (
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center -mt-4 ${
                      isActive
                        ? "bg-blue-500 shadow-lg shadow-blue-500/30"
                        : "bg-[#1A2332] border border-white/10"
                    }`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-blue-500" : "text-[#64748B]"
                    }`}
                  />
                )}

                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-blue-500" : "text-[#64748B]"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
