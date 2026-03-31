"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Zap, Sun, Cloud, Moon, AlertTriangle, Lightbulb, Volume2, VolumeX } from "lucide-react"
import { WellnessOracle } from "@/lib/wellness-oracle"
import { getUserAccounts, getUserTransactions, calculateFinancialVelocity } from "@/lib/account-aggregation"

interface GuildStatus {
  status: string
  metric: string
}

interface DailySynapseData {
  date: string
  stateOfUnion: string
  guildStatus: {
    financial: GuildStatus
    career: GuildStatus
    wellness: GuildStatus
    social: GuildStatus
    time: GuildStatus
    goals: GuildStatus
  }
  crossGuildInsight: string
  priorities: {
    topPriority: string
    opportunities: string[]
    risks: string[]
  }
  energyStrategy: {
    morning: string
    afternoon: string
    evening: string
  }
  closingMotivation: string
}

interface DailySynapseProps {
  onClose: () => void
}

const guildIcons = {
  financial: "💰",
  career: "💼",
  wellness: "🏃",
  social: "👥",
  time: "⏰",
  goals: "🎯",
}

const guildColors = {
  financial: "text-green-500",
  career: "text-blue-500",
  wellness: "text-purple-500",
  social: "text-pink-500",
  time: "text-orange-500",
  goals: "text-yellow-500",
}

export default function DailySynapse({ onClose }: DailySynapseProps) {
  const [synapse, setSynapse] = useState<DailySynapseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)

  useEffect(() => {
    fetchDailySynapse()
  }, [])

  const gatherFullUserContext = async () => {
    const userId = "user-123"

    console.log("[v0] Gathering full user context...")

    try {
      const wellnessOracle = new WellnessOracle()
      await wellnessOracle.init()

      const today = new Date().toISOString().split("T")[0]
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

      const [todayBiometrics, recentBiometrics, morningBriefing] = await Promise.all([
        wellnessOracle["getBiometricData"](userId, today).catch(() => null),
        wellnessOracle["getRecentBiometricData"](userId, 7).catch(() => []),
        wellnessOracle.generateMorningBriefing(userId).catch(() => null),
      ])

      const [accounts, recentTransactions, financialVelocity] = await Promise.all([
        getUserAccounts(userId).catch(() => []),
        getUserTransactions(userId, sevenDaysAgo, today).catch(() => []),
        calculateFinancialVelocity(userId, 30).catch(() => null),
      ])

      const wellnessData = {
        today: todayBiometrics,
        recent: recentBiometrics,
        briefing: morningBriefing,
        summary: {
          recovery: todayBiometrics?.recovery || todayBiometrics?.bodyBattery || null,
          hrv: todayBiometrics?.hrv || null,
          rhr: todayBiometrics?.rhr || null,
          sleepDuration: todayBiometrics?.sleepDuration || null,
          sleepEfficiency: todayBiometrics?.sleepEfficiency || null,
          strain: todayBiometrics?.strain || null,
        },
      }

      const financialData = financialVelocity
        ? {
            accounts: accounts.map((acc) => ({
              name: acc.name,
              type: acc.type,
              subtype: acc.subtype,
              balance: acc.balances.current,
              currency: acc.balances.iso_currency_code,
            })),
            transactions: recentTransactions.map((txn) => ({
              date: txn.date,
              amount: txn.amount,
              name: txn.name,
              category: txn.category,
            })),
            velocity: financialVelocity,
            summary: {
              totalNetWorth: financialVelocity.currentNetWorth,
              monthlyChange: financialVelocity.velocity * 30,
              monthlyChangePercent: financialVelocity.velocityPercent * 30,
            },
          }
        : undefined

      console.log("[v0] Context gathered - Wellness:", wellnessData.summary)
      console.log("[v0] Context gathered - Financial:", financialData?.summary)

      return { wellnessData, financialData }
    } catch (error) {
      console.error("[v0] Error gathering user context:", error)
      return {}
    }
  }

  const fetchDailySynapse = async () => {
    try {
      const userContext = await gatherFullUserContext()

      const response = await fetch("/api/daily-synapse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-123",
          ...userContext,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSynapse(data.synapse)

        if (speechEnabled && "speechSynthesis" in window) {
          speakSynapse(data.synapse)
        }
      }
    } catch (error) {
      console.error("[v0] Failed to fetch daily synapse:", error)
    } finally {
      setLoading(false)
    }
  }

  const speakSynapse = (data: DailySynapseData) => {
    if (!("speechSynthesis" in window)) return

    const text = `
      Daily Synapse for ${new Date(data.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.
      
      ${data.stateOfUnion}
      
      Cross-guild insight: ${data.crossGuildInsight}
      
      Your top priority today: ${data.priorities.topPriority}
      
      ${data.closingMotivation}
    `

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.85
    utterance.pitch = 1.0
    utterance.volume = 0.9

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const toggleSpeech = () => {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    } else if (synapse) {
      speakSynapse(synapse)
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      >
        <Card className="w-full max-w-2xl p-8 bg-[#0A0A0A] border-[#D4AF37]/30">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Zap className="w-12 h-12 text-[#D4AF37]" />
            </motion.div>
            <p className="text-lg text-[#D4AF37]">Synthesizing cross-domain intelligence...</p>
            <p className="text-sm text-gray-500">Analyzing patterns across all life guilds</p>
          </div>
        </Card>
      </motion.div>
    )
  }

  if (!synapse) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-6xl my-8"
      >
        <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 shadow-2xl rounded-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#D4AF37]/60" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#D4AF37]/60" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#D4AF37]/60" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#D4AF37]/60" />

          <div className="absolute top-4 right-16 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSpeech}
              className="text-[#D4AF37] hover:text-[#D4AF37]/80 hover:bg-[#D4AF37]/10"
            >
              {speaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>

          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[#D4AF37] hover:text-[#D4AF37]/80 hover:bg-[#D4AF37]/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-12 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-6"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="inline-block"
              >
                <Zap className="w-16 h-16 text-[#D4AF37] mx-auto" strokeWidth={1.5} />
              </motion.div>

              <h2 className="text-3xl font-bold text-[#D4AF37] tracking-[0.2em] uppercase">Synapse Detected</h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-lg p-6 max-w-4xl mx-auto"
              >
                <div className="flex items-center gap-2 mb-3 justify-center">
                  <Zap className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs text-[#D4AF37] uppercase tracking-wider font-semibold">
                    Cross-Domain Intelligence
                  </span>
                </div>
                <p className="text-lg text-gray-200 leading-relaxed">{synapse.crossGuildInsight}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-4 flex-wrap"
              >
                {Object.entries(synapse.guildStatus).map(([guild, status], index) => (
                  <motion.div
                    key={guild}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full"
                  >
                    <span className="text-sm text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#D4AF37] rounded-full" />
                      {guild}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full border-2 border-[#D4AF37] flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-[0.15em]">Priorities</h3>
                </div>

                <div className="bg-[#141414] border border-[#D4AF37]/20 rounded-lg p-5">
                  <div className="text-xs text-[#D4AF37] uppercase tracking-wider mb-2">Priority Alpha</div>
                  <p className="text-white text-base">{synapse.priorities.topPriority}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-gray-400" />
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider">Opportunities</h4>
                  </div>
                  <div className="space-y-2">
                    {synapse.priorities.opportunities.map((opp, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-start gap-3 text-sm text-gray-400"
                      >
                        <span className="text-gray-600 mt-1">›</span>
                        <span>{opp}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <h4 className="text-xs text-red-500 uppercase tracking-wider">Risk Vectors</h4>
                  </div>
                  <div className="space-y-2">
                    {synapse.priorities.risks.map((risk, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="flex items-start gap-3 text-sm text-gray-400"
                      >
                        <span className="text-red-500/50 mt-1">›</span>
                        <span>{risk}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6">
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#D4AF37]">
                      <path
                        d="M3 13h8V3L13 21h8v-8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-[0.15em]">Energy</h3>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-[#141414] border border-[#D4AF37]/20 rounded-lg p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                        <Sun className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <h4 className="text-sm font-semibold text-white uppercase">Morning</h4>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">06:00-12:00</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{synapse.energyStrategy.morning}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-[#141414] border border-[#D4AF37]/20 rounded-lg p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <Cloud className="w-5 h-5 text-orange-500" />
                      </div>
                      <h4 className="text-sm font-semibold text-white uppercase">Afternoon</h4>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">12:00-18:00</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{synapse.energyStrategy.afternoon}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="bg-[#141414] border border-[#D4AF37]/20 rounded-lg p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Moon className="w-5 h-5 text-blue-400" />
                      </div>
                      <h4 className="text-sm font-semibold text-white uppercase">Evening</h4>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">18:00-00:00</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{synapse.energyStrategy.evening}</p>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-center pt-8 border-t border-[#D4AF37]/10"
            >
              <p className="text-base text-gray-300 leading-relaxed max-w-4xl mx-auto">{synapse.closingMotivation}</p>

              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-600 font-mono">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                  APEX AI
                </span>
                <span>•</span>
                <span>SYNAPSE V3.0.0</span>
                <span>•</span>
                <span>CROSS-DOMAIN INTELLIGENCE</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
