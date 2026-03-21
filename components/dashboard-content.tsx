"use client"

import type React from "react"
import StudioManager from "./studio-manager"
import { useVault } from "@/lib/vault-context"
import { useEffect, useState } from "react"
import {
  BrainCircuitIcon,
  TargetIcon,
  DollarSignIcon,
  ShirtIcon,
  BookOpenIcon,
  RepeatIcon,
  GitBranchIcon,
  SparklesIcon,
} from "./icons"
import GradientText from "./gradient-text"
import { useCustomization } from "@/lib/customization-context"
import ProactiveInsightsPanel from "./proactive-insights-panel"
import UserContextWidget from "./user-context-widget"
import ApexWidget from "./apex-widget"

interface Insight {
  type: "suggestion" | "warning" | "celebration" | "tip"
  title: string
  message: string
  priority: "high" | "medium" | "low"
}

interface ModuleCardProps {
  title: string
  icon: React.ReactNode
  description: string
  onClick: () => void
  angle: number
  color: string
}

function ModuleCard({ title, icon, description, onClick, angle, color }: ModuleCardProps) {
  const radius = 280
  const x = Math.cos((angle * Math.PI) / 180) * radius
  const y = Math.sin((angle * Math.PI) / 180) * radius

  return (
    <button
      onClick={onClick}
      className="absolute group cursor-pointer"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: "translate(-50%, -50%)",
        animation: `orbit-${angle} 20s linear infinite`,
      }}
    >
      <div className="relative">
        {/* Orbital trail */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
            width: "200px",
            height: "200px",
            left: "-75px",
            top: "-75px",
          }}
        />

        {/* Module card */}
        <div
          className="relative w-32 h-32 rounded-2xl backdrop-blur-md border transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)",
            borderColor: `${color}40`,
            boxShadow: `0 0 20px ${color}20, inset 0 0 20px ${color}10`,
          }}
        >
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(135deg, ${color}20 0%, transparent 100%)`,
            }}
          />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-2 transition-transform duration-500 group-hover:scale-125" style={{ color }}>
              {icon}
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
            <p className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {description}
            </p>
          </div>

          {/* Corner accents */}
          <div
            className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-lg"
            style={{ borderColor: color }}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-lg"
            style={{ borderColor: color }}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-lg"
            style={{ borderColor: color }}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-lg"
            style={{ borderColor: color }}
          />
        </div>
      </div>
    </button>
  )
}

export default function DashboardContent() {
  const { userProfile, strategicGoal, expenses, habits, habitLogs, knowledgeItems, aura } = useVault()
  const { settings } = useCustomization()
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [hoveredModule, setHoveredModule] = useState<string | null>(null)
  const [showStudioView, setShowStudioView] = useState(false)

  const safeExpenses = expenses || []
  const safeHabits = habits || []
  const safeHabitLogs = habitLogs || []
  const safeKnowledgeItems = knowledgeItems || []

  const totalExpenses = safeExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const todayStr = new Date().toISOString().split("T")[0]
  const completedToday = safeHabitLogs.filter((log) => log.date === todayStr && log.completed).length

  useEffect(() => {
    const fetchInsights = async () => {
      if (!userProfile) return

      setIsLoadingInsights(true)
      try {
        const response = await fetch("/api/ai/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userProfile,
            strategicGoal,
            expenses: safeExpenses,
            habits: safeHabits,
            habitLogs: safeHabitLogs,
            knowledgeItems: safeKnowledgeItems,
            aura,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setInsights(data.insights)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch insights:", error)
      } finally {
        setIsLoadingInsights(false)
      }
    }

    fetchInsights()
  }, [userProfile, strategicGoal, safeExpenses, safeHabits, safeHabitLogs, safeKnowledgeItems, aura])

  const modules = [
    {
      id: "strategy",
      title: "Strategy",
      icon: <TargetIcon size={32} />,
      description: "Set goals",
      angle: 0,
      color: "#3b82f6",
    },
    {
      id: "financial",
      title: "Financial",
      icon: <DollarSignIcon size={32} />,
      description: "Track expenses",
      angle: 51.4,
      color: "#10b981",
    },
    {
      id: "stylist",
      title: "Stylist",
      icon: <ShirtIcon size={32} />,
      description: "AI fashion",
      angle: 102.8,
      color: "#f59e0b",
    },
    {
      id: "knowledge",
      title: "Knowledge",
      icon: <BookOpenIcon size={32} />,
      description: "Learn & grow",
      angle: 154.2,
      color: "#8b5cf6",
    },
    {
      id: "routines",
      title: "Routines",
      icon: <RepeatIcon size={32} />,
      description: "Build habits",
      angle: 205.6,
      color: "#ec4899",
    },
    {
      id: "simulator",
      title: "Simulator",
      icon: <GitBranchIcon size={32} />,
      description: "Echo paths",
      angle: 257,
      color: "#06b6d4",
    },
    {
      id: "synapse",
      title: "Synapse",
      icon: <BrainCircuitIcon size={32} />,
      description: "AI insights",
      angle: 308.4,
      color: "#a855f7",
    },
  ]

  const hasHobbies = userProfile?.hobbies && userProfile.hobbies.length > 0

  const getLightingGradient = () => {
    switch (settings.globalLighting) {
      case "warm":
        return "from-orange-950 via-red-900 to-slate-950"
      case "cool":
        return "from-blue-950 via-cyan-900 to-slate-950"
      default:
        return "from-slate-950 via-slate-900 to-slate-950"
    }
  }

  const particleCount = settings.particleIntensity === "high" ? 150 : settings.particleIntensity === "low" ? 50 : 100

  return (
    <div className={`relative w-full h-full min-h-screen overflow-hidden bg-gradient-to-br ${getLightingGradient()}`}>
      {showStudioView && hasHobbies ? (
        <StudioManager />
      ) : (
        <>
          {/* Animated starfield background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(particleCount)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  opacity: Math.random() * 0.7 + 0.3,
                }}
              />
            ))}
          </div>

          {/* Orbital rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="absolute rounded-full border border-cyan-500/20 animate-spin-slow"
              style={{ width: "600px", height: "600px" }}
            />
            <div
              className="absolute rounded-full border border-purple-500/20 animate-spin-slower"
              style={{ width: "700px", height: "700px" }}
            />
          </div>

          {/* Central Nexus Core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Outer glow rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl animate-pulse-slow" />
                <div className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-2xl animate-pulse" />
              </div>

              {/* Energy rings */}
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ animation: `spin-reverse ${15 + i * 5}s linear infinite` }}
                >
                  <div
                    className="rounded-full border-2 border-cyan-400/30"
                    style={{
                      width: `${180 + i * 30}px`,
                      height: `${180 + i * 30}px`,
                      boxShadow: "0 0 20px rgba(34, 211, 238, 0.3)",
                    }}
                  />
                </div>
              ))}

              {/* Core orb */}
              <div className="relative w-40 h-40 rounded-full flex items-center justify-center">
                {/* Animated gradient background */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 animate-gradient-shift" />

                {/* Glass effect overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm" />

                {/* Inner glow */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-300/50 to-purple-500/50 blur-md animate-pulse" />

                {/* Content */}
                <div className="relative z-10 text-center">
                  <BrainCircuitIcon size={48} className="text-white mb-2 mx-auto animate-float" />
                  <h2 className="text-xl font-bold text-white">
                    <GradientText from="#22d3ee" to="#a855f7">
                      APEX
                    </GradientText>
                  </h2>
                  <p className="text-xs text-cyan-200 mt-1">Nexus Core</p>
                </div>

                {/* Particle burst effect */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                    style={{
                      animation: `particle-burst 3s ease-out infinite`,
                      animationDelay: `${i * 0.25}s`,
                      left: "50%",
                      top: "50%",
                      transform: `rotate(${i * 30}deg) translateY(-80px)`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Orbiting module cards */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  title={module.title}
                  icon={module.icon}
                  description={module.description}
                  onClick={() => {
                    console.log(`[v0] Navigate to ${module.id}`)
                    // Navigation will be handled by parent component
                  }}
                  angle={module.angle}
                  color={module.color}
                />
              ))}
            </div>
          </div>

          {/* Status panel */}
          <div className="absolute top-8 left-8 right-8 z-20">
            <div className="max-w-4xl mx-auto backdrop-blur-md bg-slate-900/40 rounded-2xl border border-cyan-500/30 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    Welcome back,{" "}
                    <GradientText from="#22d3ee" to="#a855f7">
                      {userProfile?.name}
                    </GradientText>
                  </h1>
                  <p className="text-sm text-gray-400">
                    Strategic Goal: <span className="text-cyan-400 font-semibold">{strategicGoal || "Not set"}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Habits Today</p>
                    <p className="text-xl font-bold text-green-400">
                      {completedToday}/{safeHabits.length}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total Expenses</p>
                    <p className="text-xl font-bold text-cyan-400">${totalExpenses.toFixed(0)}</p>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              {isLoadingInsights ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <SparklesIcon className="w-4 h-4 animate-pulse" />
                  <p className="text-sm">Generating insights...</p>
                </div>
              ) : insights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insights.slice(0, 2).map((insight, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-slate-800/50 border border-cyan-500/20 backdrop-blur-sm"
                    >
                      <h4 className="font-semibold text-cyan-400 text-sm mb-1">{insight.title}</h4>
                      <p className="text-xs text-gray-300">{insight.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Hover over modules to explore. Click to navigate.</p>
              )}
            </div>
          </div>

          {/* Apex Widget and other panels to bottom right */}
          <div className="absolute bottom-8 right-8 z-20 w-96 space-y-4">
            <ApexWidget widgetId="dashboard-quick-tasks" className="w-full" />
            <ProactiveInsightsPanel />
            <UserContextWidget />
          </div>

          {/* Instructions */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="backdrop-blur-md bg-slate-900/40 rounded-full border border-purple-500/30 px-6 py-3 shadow-xl">
              <p className="text-sm text-gray-300 text-center">
                <span className="text-cyan-400 font-semibold">Click</span> any module to begin your journey
              </p>
            </div>
          </div>
        </>
      )}

      {hasHobbies && (
        <button
          onClick={() => setShowStudioView(!showStudioView)}
          className="absolute top-8 right-8 z-30 px-4 py-2 bg-black/60 backdrop-blur-md border border-cyan-400/30 rounded-lg text-cyan-300 text-sm font-semibold hover:bg-cyan-400/10 transition-all"
        >
          {showStudioView ? "Show Nexus" : "Enter Studio"}
        </button>
      )}

      <style jsx>{`
        @keyframes orbit-0 { 0%, 100% { transform: translate(-50%, -50%) rotate(0deg) translateX(280px) rotate(0deg); } }
        @keyframes orbit-51.4 { 0%, 100% { transform: translate(-50%, -50%) rotate(51.4deg) translateX(280px) rotate(-51.4deg); } }
        @keyframes orbit-102.8 { 0%, 100% { transform: translate(-50%, -50%) rotate(102.8deg) translateX(280px) rotate(-102.8deg); } }
        @keyframes orbit-154.2 { 0%, 100% { transform: translate(-50%, -50%) rotate(154.2deg) translateX(280px) rotate(-154.2deg); } }
        @keyframes orbit-205.6 { 0%, 100% { transform: translate(-50%, -50%) rotate(205.6deg) translateX(280px) rotate(-205.6deg); } }
        @keyframes orbit-257 { 0%, 100% { transform: translate(-50%, -50%) rotate(257deg) translateX(280px) rotate(-257deg); } }
        @keyframes orbit-308.4 { 0%, 100% { transform: translate(-50%, -50%) rotate(308.4deg) translateX(280px) rotate(-308.4deg); } }
        
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-slower { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes particle-burst {
          0% { opacity: 1; transform: rotate(var(--rotation)) translateY(0); }
          100% { opacity: 0; transform: rotate(var(--rotation)) translateY(-120px); }
        }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        
        .animate-spin-slow { animation: spin-slow 30s linear infinite; }
        .animate-spin-slower { animation: spin-slower 40s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-gradient-shift { 
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
