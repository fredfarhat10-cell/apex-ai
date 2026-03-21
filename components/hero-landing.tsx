"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Play } from "lucide-react"
import { useState, useEffect } from "react"
import { EnhancedBrainWireframe } from "./enhanced-brain-wireframe"

interface HeroLandingProps {
  onGetStarted: () => void
  onWatchDemo: () => void
}

function InteractiveDemoShowcase() {
  const [currentDemo, setCurrentDemo] = useState(0)
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const demos = [
    // Demo 1: Multi-Constraint Trip Planning
    {
      title: "Complex Trip Planning",
      userQuery:
        "Plan a 3-day Tokyo trip. Budget: $2000. Vegetarian & gluten-free. Avoid my work meetings. Watch the weather.",
      steps: [
        {
          module: "Calendar",
          action: "Analyzing schedule...",
          result: "Found optimal window: March 15-17, no conflicts.",
          color: "text-blue-400",
        },
        {
          module: "Financial",
          action: "Optimizing budget...",
          result: "Allocated: $800 accommodation, $600 food, $400 activities.",
          color: "text-green-400",
        },
        {
          module: "Weather API",
          action: "Checking forecast...",
          result: "Rain expected March 16. Scheduled indoor activities.",
          color: "text-cyan-400",
        },
        {
          module: "Route Optimizer",
          action: "Minimizing travel time...",
          result: "Optimized route saves 4.5 hours.",
          color: "text-pink-400",
        },
        {
          module: "Final Plan",
          action: "Generating itinerary...",
          result: "Complete 3-day plan synced to your calendar.",
          color: "text-emerald-400",
        },
      ],
      wow: "ChatGPT gives suggestions. Apex orchestrates your life.",
    },
    // Demo 2: Financial Intelligence
    {
      title: "Financial & Behavioral Coaching",
      userQuery: "I want to save $10k in 6 months. Analyze my spending and create a plan.",
      steps: [
        {
          module: "Financial Analysis",
          action: "Analyzing transaction history...",
          result: "Identified: $380/mo on dining, $150/mo unused subscriptions.",
          color: "text-green-400",
        },
        {
          module: "Pattern Recognition",
          action: "Detecting behavioral patterns...",
          result: "You overspend on Fridays (post-work stress). Correlation: 87%.",
          color: "text-purple-400",
        },
        {
          module: "Strategy Builder",
          action: "Creating savings strategy...",
          result: "Recommended: Cancel 3 subscriptions, meal prep Sundays.",
          color: "text-blue-400",
        },
        {
          module: "Routine Automation",
          action: "Building accountability...",
          result: "Created daily check-ins and milestone celebrations.",
          color: "text-yellow-400",
        },
      ],
      wow: "Other AIs give generic tips. Apex analyzes YOUR patterns and coaches YOU.",
    },
    // Demo 3: Contextual Memory
    {
      title: "Contextual Memory Across Time",
      userQuery: "What was that book recommendation you gave me 3 weeks ago?",
      steps: [
        {
          module: "Memory Retrieval",
          action: "Searching encrypted local memory...",
          result: "Found conversation from Feb 22: Recommended 'Deep Work' by Cal Newport.",
          color: "text-purple-400",
        },
        {
          module: "Context Linking",
          action: "Connecting related memories...",
          result: "Also found: You started a 'focus routine' on Feb 25 and tracked 12 deep work sessions.",
          color: "text-blue-400",
        },
        {
          module: "Proactive Insight",
          action: "Analyzing implementation success...",
          result: "Your productivity is up 40%. Shall I suggest the next book?",
          color: "text-green-400",
        },
      ],
      wow: "Other AIs forget. Apex remembers everything, privately.",
    },
  ]

  useEffect(() => {
    if (!isPlaying) return
    const timer = setTimeout(
      () => {
        if (step < demos[currentDemo].steps.length) {
          setStep(step + 1)
        } else {
          // Pause at the end before looping
          setTimeout(() => {
            const nextDemo = (currentDemo + 1) % demos.length
            setCurrentDemo(nextDemo)
            setStep(0)
          }, 4000)
        }
      },
      step === 0 ? 1500 : 2000,
    )
    return () => clearTimeout(timer)
  }, [step, isPlaying, currentDemo, demos])

  const currentDemoData = demos[currentDemo]

  return (
    <div className="max-w-5xl mx-auto mt-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">
          See Apex in Action: AI That Orchestrates, Not Just Responds
        </h2>
        <p className="text-gray-400 text-lg">
          Watch how Apex connects context, memory, and goals to deliver unparalleled insights.
        </p>
      </div>
      <Card className="bg-[#001f3f]/80 backdrop-blur-lg border-cyan-500/30 p-8 glassmorphism neon-edge">
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          {demos.map((demo, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentDemo(idx)
                setStep(0)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentDemo === idx ? "bg-cyan-500 text-[#001f3f]" : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {demo.title}
            </button>
          ))}
        </div>
        <div className="bg-black/50 rounded-lg p-6 font-mono text-sm space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-gray-500 flex-shrink-0">[USER]:</span>
            <p className="text-white">{currentDemoData.userQuery}</p>
          </div>
          <div className="border-t border-gray-700 my-4"></div>
          {currentDemoData.steps.slice(0, step).map((stepData, idx) => (
            <div key={idx} className="flex items-start gap-3 animate-fadeIn">
              <span className={`${stepData.color} flex-shrink-0 font-semibold`}>[APEX::{stepData.module}]:</span>
              <div className="flex-1">
                <p className="text-gray-400">{stepData.action}</p>
                <p className="text-white font-semibold">{stepData.result}</p>
              </div>
            </div>
          ))}
          {step >= currentDemoData.steps.length && (
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-center animate-fadeIn mt-4">
              <p className="font-semibold text-cyan-400 text-base">{currentDemoData.wow}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default function HeroLanding({ onGetStarted, onWatchDemo }: HeroLandingProps) {
  const [ctaHovered, setCtaHovered] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mediaQuery.matches)

    const handleChange = () => setReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a] overflow-hidden">
      {/* Floating decorative dots */}
      <div className="absolute top-32 right-32 w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-pink-400 animate-pulse delay-300" />
      <div className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-700" />

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full mb-20">
          {/* Left content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm text-gray-300">Zero-Knowledge AI • 100% Private</span>
            </div>

            {/* Hero heading */}
            <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-white">Meet</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Apex AI
              </span>
            </h1>

            {/* Subtitle */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">The Symbiont</h2>
              <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
                An AI that learns your rhythm, remembers your progress, and adapts to your goals — all while keeping
                your data encrypted and local. No cloud. No tracking. Just pure intelligence.
              </p>
              <p className="text-base text-gray-500 leading-relaxed max-w-xl">
                Apex is your private assistant, strategic advisor, and creative partner. It never shares your data,
                never breaks your trust, and always evolves with you.{" "}
                <span className="text-cyan-400 font-semibold">Smarter. Safer. Limitless.</span>
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={onGetStarted}
                onMouseEnter={() => setCtaHovered(true)}
                onMouseLeave={() => setCtaHovered(false)}
                size="lg"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-600 hover:shadow-cyan-500/60 hover:shadow-2xl hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                onClick={onWatchDemo}
                size="lg"
                variant="outline"
                className="border-2 border-white/20 bg-transparent hover:bg-white/5 text-white px-8 py-6 text-lg rounded-xl backdrop-blur-sm transition-all duration-600 hover:border-white/40"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-8 pt-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>Learns & Adapts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>100% Private</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>Zero-Knowledge Encryption</span>
              </div>
            </div>
          </div>

          {/* Right content - Enhanced Brain Wireframe */}
          <div className="relative flex items-center justify-center">
            <EnhancedBrainWireframe ctaHovered={ctaHovered} reducedMotion={reducedMotion} />
          </div>
        </div>

        <InteractiveDemoShowcase />
      </div>
    </div>
  )
}
