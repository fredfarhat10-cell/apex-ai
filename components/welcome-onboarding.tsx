"use client"

import { useState } from "react"
import { Target } from "lucide-react"
import { motion } from "framer-motion"

interface WelcomeOnboardingProps {
  onComplete: (profile: { sportGoal: string; financialGoal: string }) => void
}

export default function WelcomeOnboarding({ onComplete }: WelcomeOnboardingProps) {
  const [step, setStep] = useState(0)
  const [sportGoal, setSportGoal] = useState("")
  const [financialGoal, setFinancialGoal] = useState("")

  const handleComplete = () => {
    if (sportGoal && financialGoal) {
      localStorage.setItem("apex_onboarding_complete", "true")
      localStorage.setItem("apex_sport_goal", sportGoal)
      localStorage.setItem("apex_financial_goal", financialGoal)
      onComplete({ sportGoal, financialGoal })
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8533] mb-8"
            >
              <Target className="w-10 h-10 text-white" />
            </motion.div>
            <h1
              className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "var(--font-geist-sans), Inter, sans-serif" }}
            >
              Built by high-performers
              <br />
              for high-performers
            </h1>
            <p className="text-[#888888] text-xl max-w-lg mx-auto leading-relaxed">
              Your personal AI assistant for sports performance and financial growth
            </p>
            <motion.button
              onClick={() => setStep(1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-12 px-8 py-4 bg-[#FF6B00] hover:bg-[#FF8533] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#FF6B00]/20"
            >
              Get Started
            </motion.button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-2">What is your primary sport goal?</h2>
              <p className="text-[#888888] text-sm mb-8">Choose the goal that matters most to you right now</p>

              <div className="space-y-3">
                {[
                  { value: "marathon", label: "Marathon Training", desc: "Build endurance for long-distance running" },
                  { value: "strength", label: "Strength Training", desc: "Increase muscle mass and power" },
                  { value: "weight-loss", label: "Weight Loss", desc: "Achieve and maintain healthy weight" },
                  { value: "general-fitness", label: "General Fitness", desc: "Stay active and healthy" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSportGoal(option.value)
                      setTimeout(() => setStep(2), 300)
                    }}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                      sportGoal === option.value
                        ? "border-[#FF6B00] bg-[#FF6B00]/10"
                        : "border-[#222222] hover:border-[#333333] bg-[#0A0A0A]"
                    }`}
                  >
                    <div className="font-semibold text-white mb-1">{option.label}</div>
                    <div className="text-sm text-[#888888]">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-2">What is your primary financial goal?</h2>
              <p className="text-[#888888] text-sm mb-8">Select your main financial objective</p>

              <div className="space-y-3">
                {[
                  { value: "growth", label: "Growth", desc: "Maximize returns through aggressive investing" },
                  {
                    value: "preservation",
                    label: "Preservation",
                    desc: "Protect capital with conservative strategies",
                  },
                  { value: "business-scale", label: "Business Scale", desc: "Grow and expand your business" },
                  { value: "passive-income", label: "Passive Income", desc: "Build sustainable income streams" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFinancialGoal(option.value)
                      setTimeout(handleComplete, 300)
                    }}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                      financialGoal === option.value
                        ? "border-[#FF6B00] bg-[#FF6B00]/10"
                        : "border-[#222222] hover:border-[#333333] bg-[#0A0A0A]"
                    }`}
                  >
                    <div className="font-semibold text-white mb-1">{option.label}</div>
                    <div className="text-sm text-[#888888]">{option.desc}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="mt-8 text-[#888888] hover:text-white transition-colors text-sm"
              >
                ← Back
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
