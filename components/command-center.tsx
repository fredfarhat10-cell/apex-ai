"use client"

import React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Zap, Dumbbell, TrendingUp, Mic, Activity, Brain } from "lucide-react"
import { BarChart, Bar, RadialBarChart, RadialBar, LineChart, Line, ResponsiveContainer, XAxis } from "recharts"
import { useVault } from "@/lib/vault-context"
import ActionCard from "./action-card"

export default function CommandCenter() {
  const [command, setCommand] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [showActionCard, setShowActionCard] = useState(false)
  const [stepData, setStepData] = useState([
    { name: "Mon", value: 8000 },
    { name: "Tue", value: 10000 },
    { name: "Wed", value: 12000 },
    { name: "Thu", value: 11000 },
    { name: "Fri", value: 9000 },
    { name: "Sat", value: 13000 },
    { name: "Sun", value: 15000 },
  ])

  const { userProfile, habits, habitLogs, aura } = useVault()

  const userState = {
    energyLevel: aura?.energy || 82,
    trainingFocus: userProfile?.fitnessGoal || "Endurance",
    mindsetCue: userProfile?.mindsetCue || "Discipline creates freedom",
  }

  const proactiveInsight = {
    greeting: `Welcome back, ${userProfile?.name || "there"}.`,
    insight: generateProactiveInsight(),
  }

  function generateProactiveInsight() {
    const recovery = aura?.recovery || 91
    const fitnessGoal = userProfile?.fitnessGoal || "marathon prep"

    return `Sleep recovery: ${recovery}%. ${fitnessGoal} looks solid – would you like me to adjust your portfolio risk for Q4?`
  }

  const suggestedActions = [
    { icon: Dumbbell, label: "Plan my next run" },
    { icon: TrendingUp, label: "Adjust portfolio risk" },
    { icon: Activity, label: "Review last week's habits" },
  ]

  const weeklyFocusData = calculateWeeklyFocus()

  function calculateWeeklyFocus() {
    const days = ["M", "T", "W", "T", "F", "S", "S"]
    const today = new Date()

    return days.map((day, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (6 - index))
      const dateStr = date.toISOString().split("T")[0]

      const dayLogs = habitLogs?.filter((log) => log.date === dateStr) || []
      const totalHabits = habits?.length || 1
      const completedHabits = dayLogs.filter((log) => log.completed).length
      const score = Math.round((completedHabits / totalHabits) * 100)

      return { day, score: score || Math.floor(Math.random() * 30) + 60 }
    })
  }

  const portfolioData = [{ name: "Risk Score", value: 78, fill: "url(#gradient)" }]

  const handleVoiceInput = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setCommand(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)

      setIsListening(true)
      recognition.start()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return

    console.log("[v0] Processing command:", command)

    setAiResponse(`I've analyzed your request: "${command}". Here's what I can do for you...`)
    setShowActionCard(true)

    setCommand("")
  }

  const handleActionCardClose = () => {
    setShowActionCard(false)
    setAiResponse(null)
  }

  const memoryContext = generateMemoryContext()

  function generateMemoryContext() {
    const contexts = []

    if (userProfile?.fitnessGoal) {
      contexts.push(`${userProfile.fitnessGoal} training`)
    }

    if (userProfile?.financialGoal) {
      contexts.push(`${userProfile.financialGoal} goals`)
    }

    const recentHabits = habitLogs?.slice(-3).map((log) => log.habitId) || []
    if (recentHabits.length > 0) {
      contexts.push("recent activity patterns")
    }

    if (aura?.energy && aura.energy < 70) {
      contexts.push("low energy state")
    }

    return contexts.length > 0 ? contexts.join(", ") : "building your profile"
  }

  return (
    <div className="h-screen flex bg-[#0A0A0F] text-[#E5E7EB] overflow-hidden">
      {/* Column 1: User State Panel (Left) */}
      <aside className="w-80 border-r border-gray-800/50 flex flex-col p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00FFFF] to-[#3B82F6] rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#E5E7EB]">APEX AI</h1>
            <p className="text-xs text-[#888888]">Personalized Performance System</p>
          </div>
        </div>

        {/* You Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[#E5E7EB] uppercase tracking-wider">You</h2>

          {/* Energy Level Card */}
          <Card className="bg-[#111116] border-gray-800/50 p-4 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00FFFF] to-[#3B82F6] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-[#888888]">Energy level</div>
                <div className="text-2xl font-bold text-[#E5E7EB]">{userState.energyLevel}%</div>
              </div>
            </div>
          </Card>

          {/* Training Focus Card */}
          <Card className="bg-[#111116] border-gray-800/50 p-4 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00FFFF] to-[#3B82F6] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-[#888888]">Training focus</div>
                <div className="text-base font-semibold text-[#E5E7EB]">{userState.trainingFocus}</div>
              </div>
            </div>
          </Card>

          {/* Mindset Cue Card */}
          <Card className="bg-[#111116] border-gray-800/50 p-4 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00FFFF] to-[#3B82F6] flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-[#888888]">Mindset cue</div>
                <div className="text-sm font-semibold text-[#E5E7EB] leading-tight">{userState.mindsetCue}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[#E5E7EB] uppercase tracking-wider">Quick actions</h2>

          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-[#E5E7EB] hover:bg-[#111116] hover:text-cyan-400 transition-colors"
              onClick={() => setCommand("Plan my next run")}
            >
              <Dumbbell className="w-4 h-4 text-cyan-400" />
              <span className="text-sm">Plan my next run</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-[#E5E7EB] hover:bg-[#111116] hover:text-cyan-400 transition-colors"
              onClick={() => setCommand("Optimize my investment allocation")}
            >
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-sm">Optimize my investment allocation</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-[#E5E7EB] hover:bg-[#111116] hover:text-cyan-400 transition-colors"
              onClick={() => setCommand("Review yesterday's habits")}
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-sm">Review yesterday's habits</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Column 2: Symbiont Panel (Center) */}
      <main className="flex-1 flex flex-col">
        <div className="border-b border-gray-800/50 px-12 py-3 bg-[#0A0A0F]">
          <div className="flex items-center gap-2 text-xs text-[#888888]">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase tracking-wider font-medium">Context:</span>
            <span className="text-[#E5E7EB]">{memoryContext}</span>
          </div>
        </div>

        {/* Greeting & Proactive Insight */}
        <div className="flex-1 flex flex-col justify-center items-center p-12 space-y-8">
          <div className="max-w-2xl w-full space-y-6">
            <h1 className="text-3xl font-bold text-[#E5E7EB]">{proactiveInsight.greeting}</h1>
            <p className="text-lg text-[#E5E7EB] leading-relaxed">{proactiveInsight.insight}</p>

            {/* Command Bar */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Type your message..."
                className="min-h-[120px] bg-[#111116] border-gray-800/50 focus:border-cyan-500/50 text-[#E5E7EB] placeholder:text-[#888888] resize-none"
              />

              {/* Suggested Actions */}
              <div className="flex flex-wrap gap-3">
                {suggestedActions.map((action, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    className="gap-2 bg-[#111116] border-gray-800/50 hover:border-cyan-500/50 hover:bg-[#111116] text-[#E5E7EB]"
                    onClick={() => setCommand(action.label)}
                  >
                    {React.createElement(action.icon, { className: "w-4 h-4 text-cyan-400" })}
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </form>

            {showActionCard && aiResponse && <ActionCard response={aiResponse} onClose={handleActionCardClose} />}
          </div>
        </div>

        {/* Multimodal Input Bar */}
        <div className="border-t border-gray-800/50 p-6 bg-[#0A0A0F]">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleVoiceInput}
              className={`flex-shrink-0 ${isListening ? "text-cyan-400 animate-pulse" : "text-[#888888]"} hover:text-cyan-400`}
            >
              <Mic className="w-5 h-5" />
            </Button>

            <Textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e as any)
                }
              }}
              placeholder="Type or speak your command..."
              className="flex-1 min-h-[48px] max-h-[48px] bg-[#111116] border-gray-800/50 focus:border-cyan-500/50 text-[#E5E7EB] placeholder:text-[#888888] resize-none py-3"
            />

            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-shrink-0 bg-gradient-to-r from-[#00FFFF] to-[#3B82F6] hover:opacity-90 text-white font-semibold px-6"
            >
              SEND
            </Button>
          </div>
        </div>
      </main>

      {/* Column 3: Data Panel (Right) */}
      <aside className="w-96 border-l border-gray-800/50 flex flex-col p-6 space-y-6 overflow-y-auto">
        {/* Weekly Focus Score Widget */}
        <Card className="bg-[#111116] border-gray-800/50 p-6">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Weekly Focus Score</h3>

            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={weeklyFocusData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FFFF" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#888888", fontSize: 12 }} />
                <Bar dataKey="score" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <Button variant="link" className="text-cyan-400 hover:text-cyan-300 p-0 h-auto text-sm">
              VIEW TRENDS
            </Button>
          </div>
        </Card>

        {/* Current Portfolio Widget */}
        <Card className="bg-[#111116] border-gray-800/50 p-6">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Current Portfolio</h3>

            <div className="flex items-center justify-center">
              <ResponsiveContainer width={180} height={180}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  data={portfolioData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#00FFFF" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                  <RadialBar dataKey="value" cornerRadius={10} fill="url(#gradient)" background={{ fill: "#1a1a1f" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <div className="text-4xl font-bold text-[#E5E7EB]">78</div>
              </div>
            </div>

            <Button variant="link" className="text-cyan-400 hover:text-cyan-300 p-0 h-auto text-sm w-full">
              VIEW DETAILS
            </Button>
          </div>
        </Card>

        {/* Daily Step Count Widget */}
        <Card className="bg-[#111116] border-gray-800/50 p-6">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Daily Step Count</h3>

            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={stepData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00FFFF" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                <Line type="monotone" dataKey="value" stroke="url(#lineGradient)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>

            <div className="text-center">
              <div className="text-3xl font-bold text-[#E5E7EB]">10,421</div>
            </div>
          </div>
        </Card>
      </aside>
    </div>
  )
}
