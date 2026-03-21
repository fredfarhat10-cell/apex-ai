"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  X,
  Brain,
  Calendar,
  DollarSign,
  MapPin,
  Utensils,
  Cloud,
  Shield,
  Zap,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react"

interface DemoShowcaseProps {
  onClose: () => void
}

export default function DemoShowcase({ onClose }: DemoShowcaseProps) {
  const [currentDemo, setCurrentDemo] = useState(0)
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const demos = [
    {
      title: "Multi-Constraint Trip Planning",
      subtitle: "Watch Apex orchestrate complex, real-world scenarios",
      userQuery:
        "Plan a 3-day Tokyo trip for 2 people. Budget: $2000. Dietary: vegetarian + gluten-free. Adapt to weather. Book around my work schedule.",
      steps: [
        {
          module: "Calendar",
          icon: Calendar,
          action: "Analyzing your schedule...",
          result: "Found optimal window: March 15-17 (no conflicts with your Q1 review meeting)",
          color: "text-blue-400",
        },
        {
          module: "Financial",
          icon: DollarSign,
          action: "Optimizing budget allocation...",
          result: "Allocated: $800 accommodation, $600 food, $400 activities, $200 buffer",
          color: "text-green-400",
        },
        {
          module: "Weather API",
          icon: Cloud,
          action: "Checking Tokyo forecast...",
          result: "Rain expected March 16 PM. Adjusted itinerary: indoor activities scheduled.",
          color: "text-cyan-400",
        },
        {
          module: "Dietary Filter",
          icon: Utensils,
          action: "Finding vegetarian + gluten-free restaurants...",
          result: "Curated 12 restaurants with verified dietary options. Reservations suggested.",
          color: "text-purple-400",
        },
        {
          module: "Route Optimizer",
          icon: MapPin,
          action: "Minimizing travel time between locations...",
          result: "Optimized route saves 4.5 hours. Grouped by district for efficiency.",
          color: "text-pink-400",
        },
        {
          module: "Final Plan",
          icon: CheckCircle2,
          action: "Generating comprehensive itinerary...",
          result:
            "Complete 3-day plan with 18 activities, 9 restaurant bookings, weather contingencies, and real-time transit directions. All synced to your calendar.",
          color: "text-emerald-400",
        },
      ],
      wow: "ChatGPT would give you generic suggestions. Google Assistant would search restaurants. Apex orchestrates everything.",
    },
    {
      title: "Financial Intelligence + Behavioral Coaching",
      subtitle: "Cross-module analysis that learns your patterns",
      userQuery:
        "I want to save $10k in 6 months for a new studio setup. Analyze my spending and create an actionable plan.",
      steps: [
        {
          module: "Financial Analysis",
          icon: TrendingUp,
          action: "Analyzing 6 months of transaction history...",
          result: "Identified: $380/mo on dining out, $150/mo unused subscriptions, $200/mo impulse purchases",
          color: "text-green-400",
        },
        {
          module: "Pattern Recognition",
          icon: Brain,
          action: "Detecting behavioral patterns...",
          result: "You overspend on Fridays (post-work stress) and during project deadlines. Correlation: 87%",
          color: "text-purple-400",
        },
        {
          module: "Strategy Builder",
          icon: Target,
          action: "Creating personalized savings strategy...",
          result:
            "Recommended: Cancel 3 subscriptions ($150), meal prep Sundays ($200), freeze card on Fridays ($180). Total: $530/mo saved.",
          color: "text-blue-400",
        },
        {
          module: "Calendar Integration",
          icon: Calendar,
          action: "Scheduling habit reminders...",
          result: "Added: Sunday meal prep reminders, Friday evening 'pause' notifications, monthly progress reviews",
          color: "text-cyan-400",
        },
        {
          module: "Routine Automation",
          icon: Zap,
          action: "Building accountability system...",
          result:
            "Created daily check-ins, weekly progress tracking, and milestone celebrations. Gamified your savings journey.",
          color: "text-yellow-400",
        },
        {
          module: "Adaptive Coaching",
          icon: Sparkles,
          action: "Personalizing motivation style...",
          result:
            "Based on your profile (Coach persona), I'll send encouraging nudges and celebrate small wins. Goal achievable in 5.2 months at current trajectory.",
          color: "text-pink-400",
        },
      ],
      wow: "Other AIs give generic budgeting tips. Apex analyzes YOUR patterns, builds YOUR plan, and coaches YOU through it.",
    },
    {
      title: "Contextual Memory Across Time",
      subtitle: "Apex remembers everything, privately",
      userQuery: "What was that book recommendation you gave me 3 weeks ago about productivity?",
      steps: [
        {
          module: "Memory Retrieval",
          icon: Brain,
          action: "Searching encrypted local memory...",
          result:
            "Found conversation from Feb 22: Recommended 'Deep Work' by Cal Newport after you mentioned struggling with focus during coding sessions.",
          color: "text-purple-400",
        },
        {
          module: "Context Linking",
          icon: Sparkles,
          action: "Connecting related memories...",
          result:
            "Also found: You started a 'focus routine' on Feb 25, tracked 12 deep work sessions, average 2.3 hours each. Progress: +40% productivity.",
          color: "text-blue-400",
        },
        {
          module: "Proactive Insight",
          icon: TrendingUp,
          action: "Analyzing implementation success...",
          result:
            "You've completed 85% of your coding tasks on time since starting the routine. Want me to suggest the next book in the series?",
          color: "text-green-400",
        },
        {
          module: "Privacy Check",
          icon: Shield,
          action: "Verifying data security...",
          result:
            "All memories stored locally with AES-256 encryption. Zero cloud sync. Your data never left your device.",
          color: "text-cyan-400",
        },
      ],
      wow: "ChatGPT forgets after each session. Google Assistant has no long-term memory. Apex remembers everything, forever, privately.",
    },
  ]

  useEffect(() => {
    if (!isPlaying) return

    const timer = setTimeout(
      () => {
        if (step < demos[currentDemo].steps.length) {
          setStep(step + 1)
        } else {
          // Demo complete, pause
          setIsPlaying(false)
        }
      },
      step === 0 ? 1500 : 2000,
    )

    return () => clearTimeout(timer)
  }, [step, isPlaying, currentDemo])

  const handleNextDemo = () => {
    if (currentDemo < demos.length - 1) {
      setCurrentDemo(currentDemo + 1)
      setStep(0)
      setIsPlaying(true)
    }
  }

  const handlePrevDemo = () => {
    if (currentDemo > 0) {
      setCurrentDemo(currentDemo - 1)
      setStep(0)
      setIsPlaying(true)
    }
  }

  const handleReplay = () => {
    setStep(0)
    setIsPlaying(true)
  }

  const currentDemoData = demos[currentDemo]

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto">
      <div className="min-h-screen relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
        >
          <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>

        <div className="relative z-10 container mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Capability Showcase</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
              This Is What{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Apex Can Do
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Watch Apex handle complex, real-world scenarios that would take hours of manual coordination
            </p>
          </div>

          {/* Demo selector */}
          <div className="flex justify-center gap-4 mb-12">
            {demos.map((demo, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentDemo(idx)
                  setStep(0)
                  setIsPlaying(true)
                }}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  currentDemo === idx
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                }`}
              >
                <span className="text-sm font-medium">Demo {idx + 1}</span>
              </button>
            ))}
          </div>

          {/* Main demo area */}
          <div className="max-w-5xl mx-auto">
            {/* Demo title */}
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-white mb-2">{currentDemoData.title}</h2>
              <p className="text-gray-400">{currentDemoData.subtitle}</p>
            </div>

            {/* User query */}
            <div className="mb-8 animate-fade-in">
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                    <span className="text-white font-bold">You</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg leading-relaxed">{currentDemoData.userQuery}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing steps */}
            <div className="space-y-4 mb-8">
              {currentDemoData.steps.map((stepData, idx) => (
                <div
                  key={idx}
                  className={`transition-all duration-500 ${
                    step > idx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  {step > idx && (
                    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/50`}
                        >
                          <stepData.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`font-semibold ${stepData.color}`}>{stepData.module}</span>
                            {step === idx + 1 && (
                              <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce delay-100" />
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce delay-200" />
                              </div>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{stepData.action}</p>
                          {step > idx + 1 && (
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10 animate-fade-in">
                              <p className="text-white text-sm leading-relaxed">{stepData.result}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Wow factor message */}
            {step >= currentDemoData.steps.length && (
              <div className="animate-fade-in">
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8 text-center">
                  <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">The Apex Difference</h3>
                  <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">{currentDemoData.wow}</p>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4 mt-12">
              <Button
                onClick={handlePrevDemo}
                disabled={currentDemo === 0}
                variant="outline"
                size="lg"
                className="border-white/20 bg-transparent hover:bg-white/5 text-white disabled:opacity-30"
              >
                ← Previous Demo
              </Button>
              <Button
                onClick={handleReplay}
                variant="outline"
                size="lg"
                className="border-white/20 bg-transparent hover:bg-white/5 text-white"
              >
                <Clock className="w-5 h-5 mr-2" />
                Replay
              </Button>
              {currentDemo < demos.length - 1 ? (
                <Button
                  onClick={handleNextDemo}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25"
                >
                  Next Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button
                  onClick={onClose}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16 pt-8 border-t border-white/10">
              <p className="text-gray-400 mb-4">
                All of this happens <span className="text-purple-400 font-semibold">locally on your device</span>.
                <br />
                No cloud processing. No data sharing. Just pure, private intelligence.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>100% Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Lightning Fast</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>Truly Intelligent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
