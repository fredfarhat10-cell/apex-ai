"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, ArrowRight, Play, Check, Zap, Shield, Brain } from "lucide-react"

interface FirstRunDemoProps {
  onComplete: (choice: "personalize" | "explore" | "skip") => void
}

const demoSteps = [
  {
    id: 1,
    title: "Meet Your AI Companion",
    description: "Apex learns your rhythm and adapts to your lifestyle",
    icon: Brain,
    hotspot: "Watch Apex understand context",
    demo: {
      user: "Plan my week, but keep Friday free for guitar practice.",
      apex: "I've mapped out your week with focused work blocks Monday-Thursday. Friday is reserved for your guitar session—I noticed you practice best in the afternoon, so I've blocked 2-4pm. Want me to add warm-up exercises before your session?",
    },
  },
  {
    id: 2,
    title: "Private by Design",
    description: "Your data never leaves your device—ever",
    icon: Shield,
    hotspot: "See how encryption works",
    demo: {
      user: "How secure is my data?",
      apex: "Everything is encrypted with AES-256-GCM before storage. Your master password never leaves your device, and I can't access your data without it. Even if someone got your device, they'd only see encrypted gibberish.",
    },
  },
  {
    id: 3,
    title: "Infinite Possibilities",
    description: "From fitness coaching to creative writing—Apex adapts",
    icon: Zap,
    hotspot: "Explore studio system",
    demo: {
      user: "Help me write a short story about a time traveler.",
      apex: "Let's craft something compelling! I'll guide you through character development, plot structure, and pacing. Based on your reading history, I think you'd enjoy a noir-style narrative. Shall we start with your protagonist's defining moment?",
    },
  },
]

export default function FirstRunDemo({ onComplete }: FirstRunDemoProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [showApexResponse, setShowApexResponse] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Auto-advance demo
    const timer = setTimeout(() => {
      if (currentStep < demoSteps.length - 1) {
        setCurrentStep(currentStep + 1)
        setShowApexResponse(false)
        setProgress(((currentStep + 1) / demoSteps.length) * 100)
      }
    }, 8000)

    // Show Apex response after user message
    const responseTimer = setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setShowApexResponse(true)
      }, 1500)
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearTimeout(responseTimer)
    }
  }, [currentStep])

  const step = demoSteps[currentStep]
  const Icon = step.icon

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-apex-darker via-black to-apex-darker opacity-50" />
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-apex-primary rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-apex-primary" size={32} />
            <h1 className="text-4xl font-bold gradient-text">Experience Apex AI</h1>
          </div>
          <p className="text-apex-gray text-lg">A 30-second interactive demo—no signup required</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1 bg-apex-darker rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-apex-primary to-apex-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-apex-gray">
            {demoSteps.map((s, i) => (
              <span key={s.id} className={i <= currentStep ? "text-apex-primary" : ""}>
                {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Demo content */}
        <div className="animate-in fade-in slide-in-from-right-4">
          <Card className="bg-apex-dark/80 backdrop-blur-lg border-apex-primary/30 p-8">
            {/* Step header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-apex-primary to-apex-accent flex items-center justify-center flex-shrink-0">
                <Icon className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
                <p className="text-apex-gray">{step.description}</p>
              </div>
            </div>

            {/* Chat demo */}
            <div className="space-y-4 mb-6">
              {/* User message */}
              <div className="flex justify-end animate-in fade-in slide-in-from-right-2">
                <div className="bg-apex-primary/20 border border-apex-primary/30 rounded-lg px-4 py-3 max-w-md">
                  <p className="text-white text-sm">{step.demo.user}</p>
                </div>
              </div>

              {/* Apex response */}
              {isTyping && (
                <div className="flex items-center gap-2 animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-apex-primary to-apex-accent flex items-center justify-center">
                    <Sparkles className="text-white" size={16} />
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-apex-primary rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-apex-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-2 h-2 bg-apex-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              )}

              {showApexResponse && (
                <div className="flex items-start gap-2 animate-in fade-in slide-in-from-left-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-apex-primary to-apex-accent flex items-center justify-center flex-shrink-0">
                    <Sparkles className="text-white" size={16} />
                  </div>
                  <div className="bg-apex-darker border border-apex-primary/20 rounded-lg px-4 py-3 max-w-lg">
                    <p className="text-apex-light text-sm leading-relaxed">{step.demo.apex}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hotspot button */}
            <button
              className="w-full py-3 bg-apex-primary/10 hover:bg-apex-primary/20 border border-apex-primary/30 rounded-lg text-apex-primary text-sm font-medium transition-all flex items-center justify-center gap-2"
              onClick={() => {
                if (currentStep < demoSteps.length - 1) {
                  setCurrentStep(currentStep + 1)
                  setShowApexResponse(false)
                  setProgress(((currentStep + 1) / demoSteps.length) * 100)
                }
              }}
            >
              <Play size={16} />
              {step.hotspot}
            </button>
          </Card>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 delay-500">
          <Button
            size="lg"
            className="bg-gradient-to-r from-apex-primary to-apex-accent text-white font-semibold hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all"
            onClick={() => onComplete("personalize")}
          >
            <Check size={20} />
            Personalize Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-apex-primary/30 text-apex-primary hover:bg-apex-primary/10 bg-transparent"
            onClick={() => onComplete("explore")}
          >
            <ArrowRight size={20} />
            Explore Features
          </Button>
        </div>

        {/* Skip option */}
        <div className="text-center mt-6">
          <button
            onClick={() => onComplete("skip")}
            className="text-sm text-apex-gray hover:text-apex-primary transition-colors"
          >
            Skip demo
          </button>
        </div>
      </div>
    </div>
  )
}
