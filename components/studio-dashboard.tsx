"use client"

import { useState, useEffect, useRef } from "react"
import { useVault } from "@/lib/vault-context"
import Sidebar from "@/components/sidebar"
import HelpCenter from "@/components/help-center"
import FinancialStudio from "@/components/studios/financial-studio"
import CareerGuild from "@/components/career-guild"
import GoalAccelerator from "@/components/goal-accelerator" // Import GoalAccelerator component
import AlphaBrief from "@/components/alpha-brief" // Import AlphaBrief component
import CalendarStudio from "@/components/calendar-studio" // Import Calendar Studio
import IntegrationHub from "@/components/integration-hub" // Import IntegrationHub component
import UnifiedDashboard from "@/components/unified-dashboard" // Import UnifiedDashboard
import ApexNexus from "@/components/apex-nexus" // Import Apex Nexus 3D component
import { getScheduler } from "@/lib/apex-scheduler"
import { TrendAnalyzer } from "@/lib/trend-analyzer"
import { VoiceEngine } from "@/lib/voice-engine"
import { VoiceGenerator, type EmotionalState } from "@/lib/voice-generator"
import { playSound, isSoundEnabled, setSoundEnabled } from "@/lib/sound-manager"
import DailySynapse from "@/components/daily-synapse"

interface Notification {
  id: number
  level: "POS" | "NEU" | "ALR"
  title: string
  body: string
  detail: string
  module: "performance" | "portfolio" | "wellness"
  date: string
}

type Mood = "calm" | "alert" | "happy"

export default function StudioDashboard() {
  const { userProfile, strategicGoal, expenses, habits, habitLogs, moodHistory, trendAnalysis, updateState, aura } =
    useVault()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selected, setSelected] = useState<Notification | null>(null)
  const [time, setTime] = useState(new Date())
  const [weather] = useState("18°C")
  const [mood, setMood] = useState<Mood>("calm")
  const [speaking, setSpeaking] = useState(false)
  const [soundEnabled, setSoundEnabledState] = useState(isSoundEnabled())
  const voiceEngine = useRef(new VoiceEngine())

  const [crewIsRunning, setCrewIsRunning] = useState(false)
  const [crewResult, setCrewResult] = useState("")

  const [showDailySynapse, setShowDailySynapse] = useState(false)
  const [synapseShownToday, setSynapseShownToday] = useState(false)

  const handleJobRun = async (action: string) => {
    console.log(`[v0] Scheduler is running action: ${action}`)
    speak(`Autonomous check: Running ${action.replace(/_/g, " ")}...`, "analytical")
    setMood("alert")

    try {
      const response = await fetch("/api/proactive-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          userId: userProfile?.name || "current-user",
        }),
      })

      const data = await response.json()

      if (data.success && data.notification) {
        speak("Autonomous check complete. New insight available.", "celebratory")
        setMood("happy")
        window.dispatchEvent(new CustomEvent("new-proactive-notification", { detail: data.notification }))
      } else {
        speak("Autonomous check complete.", "neutral")
        setMood("calm")
      }
    } catch (error) {
      console.error("[v0] Proactive check failed:", error)
      speak("Autonomous check encountered an issue.", "warning")
      setMood("calm")
    }
  }

  useEffect(() => {
    const scheduler = getScheduler(handleJobRun)
    scheduler.start()
    return () => scheduler.stop()
  }, [])

  useEffect(() => {
    const checkAndShowSynapse = () => {
      const today = new Date().toDateString()
      const lastShown = localStorage.getItem("lastSynapseShown")

      if (lastShown !== today && !synapseShownToday) {
        setTimeout(() => {
          setShowDailySynapse(true)
          setSynapseShownToday(true)
          localStorage.setItem("lastSynapseShown", today)
        }, 2000)
      }
    }

    checkAndShowSynapse()
  }, [synapseShownToday])

  const handleComplexRequest = async (requestText: string) => {
    setCrewIsRunning(true)
    speak("Initiating deep analysis. My specialized agents are on it...", "analytical")
    setMood("alert")

    try {
      const user_context = {
        user_name: userProfile?.name || "User",
        fitness_goals: strategicGoal || "General wellness",
        user_location: userProfile?.country || "Unknown",
        occupation: userProfile?.occupation || "Not specified",
        interests: userProfile?.interests || [],
        skills: userProfile?.skills || [],
        financial_risk_style: userProfile?.financialRiskStyle || "Moderate",
        total_expenses: expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0,
        active_habits: habits?.length || 0,
        current_aura: moodHistory?.[0]?.aura || "Neutral",
      }

      const response = await fetch("/api/crewai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_request: requestText,
          user_context: user_context,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCrewResult(result.result)
        speak("Analysis complete. Here is the synthesized intelligence from my team.", "celebratory")
        setMood("happy")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      speak("There was an issue coordinating with my specialist team. Please try again.", "warning")
      setMood("alert")
      console.error("[v0] CrewAI mission failed:", error)
    } finally {
      setCrewIsRunning(false)
    }
  }

  useEffect(() => {
    const runAnalysis = () => {
      const fullState = {
        expenses: expenses || [],
        habits: habits || [],
        habitLogs: habitLogs || [],
        moodHistory: moodHistory || [],
        aura: "Neutral" as const,
      }
      const analysis = TrendAnalyzer.analyze(fullState as any)
      updateState("trendAnalysis", analysis)
    }

    runAnalysis()
    const interval = setInterval(runAnalysis, 60000)
    return () => clearInterval(interval)
  }, [expenses, habits, habitLogs, moodHistory, updateState])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const safeHabits = habits || []
    const safeHabitLogs = habitLogs || []
    const safeExpenses = expenses || []

    const todayStr = new Date().toISOString().split("T")[0]
    const completedToday = safeHabitLogs.filter((log) => log.date === todayStr && log.completed).length
    const totalExpenses = safeExpenses.reduce((sum, exp) => sum + exp.amount, 0)

    const base: Notification[] = [
      {
        id: 1,
        level: "POS",
        title: "Focus Trending ↑",
        body: `You completed ${completedToday} of ${safeHabits.length} habits today. Keep up the momentum!`,
        detail: `Apex analysis shows your habit completion rate is strong. You've maintained consistent productivity this week. Momentum looks sustainable and aligns with your goal.`,
        module: "performance",
        date: "Today",
      },
      {
        id: 2,
        level: "NEU",
        title: "Market Calm",
        body: "Volatility index remains stable. Suitable for long-term planning.",
        detail:
          "No major macro shifts detected. Today is ideal for reflection and planning future allocations based on your risk profile.",
        module: "portfolio",
        date: "Today",
      },
    ]

    if (totalExpenses > 1000) {
      base.push({
        id: 3,
        level: "ALR",
        title: "Sleep Debt Detected",
        body: `Sleep quality dipped 8% below your baseline.`,
        detail: `Reduced recovery detected. Apex suggests a mindfulness block or an earlier shutdown tonight to maintain peak cognitive function.`,
        module: "wellness",
        date: "Today",
      })
    }

    setNotifications(base)
  }, [habits, habitLogs, expenses])

  function speak(text: string, emotionalState: EmotionalState = "neutral") {
    VoiceGenerator.speak(
      text,
      aura || "Neutral",
      emotionalState,
      () => setSpeaking(true),
      () => setSpeaking(false),
    )
  }

  const handleExplain = (topic: string, data: string) => {
    playSound("click")
    let explanation = ""
    let emotionalState: EmotionalState = "analytical"

    switch (topic) {
      case "portfolio":
        explanation = `Your portfolio's current value is based on the real-time simulated market data. The daily change reflects its performance against yesterday's close. Your risk level is currently assessed as ${data}.`
        emotionalState = "analytical"
        break
      case "goals":
        explanation = `This shows your progress towards your financial goal. You are currently ${data} percent of the way there. I am continuously forecasting your trajectory to see if you are on track.`
        emotionalState = "motivational"
        break
      case "insights":
        explanation = `These are proactive insights I generate by analyzing your data patterns. The priority level indicates how important I believe this information is for your current strategy.`
        emotionalState = "analytical"
        break
      case "habits":
        explanation = `You completed ${data} habits today. Maintaining consistency is key to long-term success. I'm tracking your patterns to help optimize your routine.`
        emotionalState = "motivational"
        break
    }
    speak(explanation, emotionalState)
  }

  const toggleSound = () => {
    const newState = !soundEnabled
    setSoundEnabledState(newState)
    setSoundEnabled(newState)
    playSound(newState ? "success" : "click")
  }

  const hour = time.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  const location = userProfile?.country || "London, UK"
  const greetWord = location.toLowerCase().includes("italy")
    ? "Ciao"
    : location.toLowerCase().includes("india")
      ? "Namaste"
      : greeting

  const partOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"

  const orbColor =
    mood === "calm"
      ? "from-blue-500 via-purple-600 to-blue-700"
      : mood === "alert"
        ? "from-red-500 via-orange-500 to-yellow-500"
        : "from-green-400 via-teal-500 to-blue-400"

  const interest = strategicGoal || "your focus area"

  const getMoodLine = () => {
    if (trendAnalysis?.recommendations && trendAnalysis.recommendations.length > 0) {
      return trendAnalysis.recommendations[0]
    }

    switch (mood) {
      case "alert":
        return `Stay sharp. I'm monitoring for changes around ${interest}.`
      case "calm":
        return `Systems are steady. A good moment to think ahead on ${interest}.`
      case "happy":
        return `Positive momentum detected. Let's keep the progress on ${interest} flowing.`
      default:
        return `Ready when you are.`
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "help":
        return <HelpCenter />
      case "financial":
        return <FinancialStudio />
      case "career":
        return <CareerGuild />
      case "goals":
        return <GoalAccelerator />
      case "alpha-briefs":
        return <AlphaBrief />
      case "calendar":
        return <CalendarStudio />
      case "integrations":
        return <IntegrationHub />
      case "nexus":
        return <ApexNexus />
      case "settings":
        return <PlaceholderPage title="Settings" />
      case "dashboard":
      default:
        return <UnifiedDashboard />
    }
  }

  return (
    <div className="flex h-screen bg-apex-darker">
      <Sidebar currentPage={activeTab} setCurrentPage={setActiveTab} />
      <main className="flex-1 overflow-y-auto">{renderContent()}</main>

      {showDailySynapse && <DailySynapse onClose={() => setShowDailySynapse(false)} />}
    </div>
  )
}

function getPageTitle(page: string): string {
  const titles: Record<string, string> = {
    strategy: "Strategy",
    activities: "Activities",
    calendar: "Calendar",
    stylist: "Stylist",
    knowledge: "Knowledge",
    routines: "Routines",
    simulator: "Simulator",
    privacy: "Privacy Center",
    security: "Security Center",
    vault: "Vault",
    automations: "Automations",
    career: "Career Guild",
    goals: "Goals",
    alphaBriefs: "Alpha Briefs",
    settings: "Settings",
    integrations: "Integrations",
    nexus: "Apex Nexus 3D",
  }
  return titles[page] || "Module"
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="h-screen w-full bg-[#0a0a0f] text-white overflow-y-auto font-mono flex flex-col items-center justify-center p-8 animate-fadeIn">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-gray-400 text-lg">
          This module is under construction. Its intelligent features will be integrated in a future phase.
        </p>
        <div className="mt-8 text-6xl opacity-50">🚀</div>
      </div>
    </div>
  )
}
