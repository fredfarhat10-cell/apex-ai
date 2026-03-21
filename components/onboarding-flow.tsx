"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles, Zap, Brain, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVault } from "@/lib/vault-context"

interface OnboardingFlowProps {
  onComplete: () => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [useCase, setUseCase] = useState("")
  const [demoRunning, setDemoRunning] = useState(false)
  const [demoText, setDemoText] = useState("")
  const [demoComplete, setDemoComplete] = useState(false)
  const { createVault } = useVault()

  const fullDemoText =
    "ApexAI is your cognitive symbiont - a second brain that handles logic, data analysis, and execution while you focus on vision and creativity. Together, we achieve what was previously impossible."

  // Typewriter effect for demo
  useEffect(() => {
    if (demoRunning && demoText.length < fullDemoText.length) {
      const timeout = setTimeout(() => {
        setDemoText(fullDemoText.slice(0, demoText.length + 1))
      }, 30)
      return () => clearTimeout(timeout)
    } else if (demoRunning && demoText.length === fullDemoText.length) {
      setDemoComplete(true)
    }
  }, [demoRunning, demoText])

  const handleStartDemo = () => {
    setDemoRunning(true)
    setDemoText("")
    setDemoComplete(false)
  }

  const handleComplete = async () => {
    // Create a basic vault with onboarding data
    const profile = {
      name: "New User",
      occupation: useCase || "Professional",
      skills: [],
      interests: [useCase],
      hobbies: [],
      financialRiskStyle: "Moderate" as const,
      aiPersona: "Collaborator" as const,
      aiModel: "GPT-4",
    }

    const password = prompt("Create your master password (min 8 characters):")
    if (password && password.length >= 8) {
      await createVault(profile, password, true)
      onComplete()
    } else {
      alert("Password must be at least 8 characters")
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0A0A0F] z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#FF6B00] rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0.3,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 text-center max-w-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8533] mx-auto mb-8 flex items-center justify-center apex-glow-strong"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">Welcome to ApexAI</h1>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Your AI co-pilot is ready to transform how you work, think, and achieve your goals.
            </p>

            <Button
              onClick={() => setStep(2)}
              size="lg"
              className="bg-[#FF6B00] hover:bg-[#FF8533] text-white px-10 py-7 text-lg font-bold rounded-xl apex-glow transition-all"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 w-full max-w-2xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 gradient-text">What brings you here?</h2>
              <p className="text-gray-400 text-lg">Choose your primary use case to personalize your experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                {
                  value: "Creative Work",
                  icon: Sparkles,
                  description: "Writing, design, content creation",
                },
                {
                  value: "Business Operations",
                  icon: Zap,
                  description: "Project management, analytics, automation",
                },
                {
                  value: "Personal Productivity",
                  icon: Brain,
                  description: "Task management, learning, self-improvement",
                },
                {
                  value: "Research & Analysis",
                  icon: Check,
                  description: "Data analysis, research, insights",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setUseCase(option.value)}
                  className={`p-6 rounded-xl text-left transition-all ${
                    useCase === option.value
                      ? "bg-[#FF6B00]/20 border-2 border-[#FF6B00] apex-glow-subtle"
                      : "bg-white/5 border-2 border-gray-700 hover:border-[#FF6B00]/50"
                  }`}
                >
                  <option.icon
                    className={`w-8 h-8 mb-3 ${useCase === option.value ? "text-[#FF6B00]" : "text-gray-400"}`}
                  />
                  <h3 className="text-lg font-semibold text-white mb-2">{option.value}</h3>
                  <p className="text-sm text-gray-400">{option.description}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                size="lg"
                className="flex-1 border-gray-700 hover:bg-white/10 text-white"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!useCase}
                size="lg"
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF8533] text-white font-bold disabled:opacity-50"
              >
                Continue
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Live Demo */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 w-full max-w-3xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 gradient-text">See ApexAI in Action</h2>
              <p className="text-gray-400 text-lg">Watch how your AI co-pilot responds to commands</p>
            </div>

            {/* Demo Command Bar */}
            <div className="glass-effect p-6 rounded-2xl border border-gray-700 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8533] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 bg-white/5 border border-gray-700 rounded-lg px-4 py-3">
                  <p className="text-gray-300">Summarize the benefits of ApexAI</p>
                </div>
                {!demoRunning && (
                  <Button onClick={handleStartDemo} className="bg-[#FF6B00] hover:bg-[#FF8533] text-white font-bold">
                    Run Demo
                  </Button>
                )}
              </div>

              {/* Demo Response */}
              <AnimatePresence>
                {demoRunning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 rounded-lg bg-[#FF6B00]/10 border border-[#FF6B00]/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8533] flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-300 leading-relaxed">
                          {demoText}
                          {!demoComplete && <span className="animate-pulse">|</span>}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Features Highlight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Zap, label: "Instant Responses" },
                { icon: Brain, label: "Context Aware" },
                { icon: Sparkles, label: "Always Learning" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-lg bg-white/5 border border-gray-700 text-center"
                >
                  <feature.icon className="w-6 h-6 text-[#FF6B00] mx-auto mb-2" />
                  <p className="text-sm text-gray-300">{feature.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                size="lg"
                className="flex-1 border-gray-700 hover:bg-white/10 text-white"
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                size="lg"
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF8533] text-white font-bold"
              >
                Complete Setup
                <Check className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
