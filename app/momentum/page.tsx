"use client"

import { useState, useEffect } from "react"
import { useMomentumStore } from "@/lib/momentum-store"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Trophy, Users, BarChart3, MessageCircle } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamic imports to prevent SSR issues
const MomentumOnboarding = dynamic(() => import("@/components/momentum/onboarding"), { ssr: false })
const MomentumHomeDashboard = dynamic(() => import("@/components/momentum/home-dashboard"), { ssr: false })
const HabitVerification = dynamic(() => import("@/components/momentum/habit-verification"), { ssr: false })
const ChallengeDetail = dynamic(() => import("@/components/momentum/challenge-detail"), { ssr: false })
const ComebackEngine = dynamic(() => import("@/components/momentum/comeback-engine"), { ssr: false })
const PodScreen = dynamic(() => import("@/components/momentum/pod-screen"), { ssr: false })
const StatsScreen = dynamic(() => import("@/components/momentum/stats-screen"), { ssr: false })
const CoachChat = dynamic(() => import("@/components/momentum/coach-chat"), { ssr: false })

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "challenges", label: "Challenges", icon: Trophy },
  { id: "pod", label: "Pod", icon: Users },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "coach", label: "Coach", icon: MessageCircle },
]

export default function MomentumPage() {
  const { user, activeTab, setActiveTab, verifyingHabitId, comebackActive } = useMomentumStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
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
