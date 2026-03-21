"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Activity, TrendingUp, Zap, PieChart, FileText, MessageSquare } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import ChatPanel from "./chat-panel"

export default function HomeDashboard() {
  const [userName, setUserName] = useState("User")
  const [energyLevel, setEnergyLevel] = useState(88)
  const [sportGoal, setSportGoal] = useState("Marathon Training")
  const [financialGoal, setFinancialGoal] = useState("Growth")
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    const storedSportGoal = localStorage.getItem("apex_sport_goal")
    const storedFinancialGoal = localStorage.getItem("apex_financial_goal")

    if (storedSportGoal) setSportGoal(storedSportGoal)
    if (storedFinancialGoal) setFinancialGoal(storedFinancialGoal)
  }, [])

  const weeklyTrainingData = [
    { value: 65 },
    { value: 72 },
    { value: 68 },
    { value: 75 },
    { value: 82 },
    { value: 78 },
    { value: 85 },
  ]

  const portfolioData = [
    { value: 100 },
    { value: 102 },
    { value: 98 },
    { value: 105 },
    { value: 108 },
    { value: 106 },
    { value: 112 },
  ]

  const quickActions = [
    { icon: Activity, label: "Plan Next Session", color: "#FF6B00", isPrimary: true },
    { icon: PieChart, label: "Review Investments", color: "#888888" },
    { icon: FileText, label: "Initiate Weekly Review", color: "#888888" },
    { icon: MessageSquare, label: "Ask Apex AI", color: "#888888", onClick: () => setIsChatOpen(true) },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1
          className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight"
          style={{ fontFamily: "var(--font-geist-sans), Inter, sans-serif" }}
        >
          Good morning, {userName}.
        </h1>
        <p className="text-[#E5E7EB] text-lg leading-relaxed">
          Your current energy level is <span className="text-[#FF6B00] font-semibold">{energyLevel}%</span>. Last week
          you trained for 42km, let's focus on recovery today.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111111] border border-[#222222] rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div>
                  <div className="text-[#888888] text-sm uppercase tracking-wider">Energy / Focus Score</div>
                  <div className="text-3xl font-bold">{energyLevel}%</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={50}>
                <LineChart data={weeklyTrainingData}>
                  <Line type="monotone" dataKey="value" stroke="#FF6B00" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-[#111111] border border-[#222222] rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div>
                  <div className="text-[#888888] text-sm uppercase tracking-wider">Weekly Training Load</div>
                  <div className="text-3xl font-bold">85</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={50}>
                <LineChart data={weeklyTrainingData}>
                  <Line type="monotone" dataKey="value" stroke="#FF6B00" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-[#111111] border border-[#222222] rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div>
                  <div className="text-[#888888] text-sm uppercase tracking-wider">Portfolio Health</div>
                  <div className="text-3xl font-bold">+12%</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={50}>
                <LineChart data={portfolioData}>
                  <Line type="monotone" dataKey="value" stroke="#FF6B00" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#111111] border border-[#222222] rounded-2xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  className={`w-full justify-start gap-4 h-16 text-base font-medium transition-all ${
                    action.isPrimary
                      ? "bg-[#FF6B00] hover:bg-[#FF8533] text-white border-0 shadow-lg shadow-[#FF6B00]/20"
                      : "bg-[#0A0A0A] hover:bg-[#1A1A1A] border border-[#222222] text-white"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      action.isPrimary ? "bg-white/20" : "bg-[#FF6B00]/20"
                    }`}
                  >
                    <action.icon className={`w-6 h-6 ${action.isPrimary ? "text-white" : "text-[#FF6B00]"}`} />
                  </div>
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#111111] border border-[#222222] rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold mb-6">Today's Focus</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-[#FF6B00]" />
                </div>
                <div>
                  <div className="font-medium">Morning Run</div>
                  <div className="text-sm text-[#888888]">8:00 AM - 45 minutes</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center flex-shrink-0">
                  <PieChart className="w-5 h-5 text-[#FF6B00]" />
                </div>
                <div>
                  <div className="font-medium">Portfolio Review</div>
                  <div className="text-sm text-[#888888]">2:00 PM - 30 minutes</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8533]/20 border border-[#FF6B00]/30 rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold mb-3">AI Insight</h3>
            <p className="text-[#E5E7EB] leading-relaxed">
              Your sleep recovery is at 91%. Marathon prep looks solid. Consider adjusting your portfolio risk for Q4.
            </p>
          </motion.div>
        </div>
      </div>

      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}
