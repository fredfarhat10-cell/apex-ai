"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, Check, Dumbbell, Music, TrendingUp, Users, Palette, Brain } from "lucide-react"
import {
  getOnboardingState,
  saveOnboardingState,
  clearOnboardingState,
  initOnboardingState,
  type OnboardingState,
} from "@/lib/onboarding-state"
import { userContextManager } from "@/lib/user-context-manager"

interface InteractiveOnboardingProps {
  onComplete: (state: OnboardingState) => void
}

const toneOptions = [
  { id: "motivational", label: "Motivational", icon: "💪", color: "from-blue-500 to-cyan-500" },
  { id: "supportive", label: "Supportive", icon: "🤗", color: "from-purple-500 to-pink-500" },
  { id: "chill", label: "Chill", icon: "😎", color: "from-teal-500 to-green-500" },
  { id: "professional", label: "Professional", icon: "🎓", color: "from-gray-500 to-slate-500" },
]

const lifeFocusOptions = [
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "music", label: "Music Production", icon: Music },
  { id: "growth", label: "Personal Growth", icon: TrendingUp },
  { id: "productivity", label: "Focus & Productivity", icon: Brain },
  { id: "relationships", label: "Relationships", icon: Users },
  { id: "creative", label: "Fashion & Style", icon: Palette },
]

export default function InteractiveOnboarding({ onComplete }: InteractiveOnboardingProps) {
  const [state, setState] = useState<OnboardingState>(() => getOnboardingState() || initOnboardingState())
  const [currentMessage, setCurrentMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [nameInput, setNameInput] = useState("")

  useEffect(() => {
    saveOnboardingState(state)
  }, [state])

  useEffect(() => {
    // Simulate typing effect
    const messages = getStepMessage(state.step, state)
    if (messages.apex) {
      setIsTyping(true)
      setShowOptions(false)

      let index = 0
      const text = messages.apex
      const interval = setInterval(() => {
        if (index < text.length) {
          setCurrentMessage(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
          setIsTyping(false)
          setShowOptions(true)
        }
      }, 30)

      return () => clearInterval(interval)
    }
  }, [state])

  const getStepMessage = (step: number, currentState: OnboardingState) => {
    switch (step) {
      case 0:
        return {
          apex: "Hey there! 👋 I'm Apex — your personal AI companion. I'm here to help you build better habits, stay organized, and reach your goals. Want to personalize your experience?",
        }
      case 1:
        return {
          apex: "First — what should I call you?",
        }
      case 2:
        return {
          apex: `Got it, ${currentState.userName}. And how would you like me to speak to you?`,
        }
      case 3:
        return {
          apex: `Noted. I'll keep it ${currentState.tone} from now on. What areas of your life do you want help with right now?`,
        }
      case 4:
        return {
          apex: `Great. I'll prioritize ${currentState.lifeFocus.join(", ")} when building your Apex dashboard. Do you want me to fit into your daily routine — or show up when you need help?`,
        }
      case 5:
        return {
          apex: `Thanks, ${currentState.userName}. I'm building your Apex experience now — based on what you've told me...`,
        }
      default:
        return { apex: "" }
    }
  }

  const getToneColor = () => {
    const tone = state.tone || "professional"
    const colors = {
      motivational: "from-blue-500 to-cyan-500",
      supportive: "from-purple-500 to-pink-500",
      chill: "from-teal-500 to-green-500",
      professional: "from-gray-400 to-slate-400",
    }
    return colors[tone]
  }

  const handleInitialChoice = (choice: "yes" | "questions") => {
    if (choice === "yes") {
      setState({ ...state, step: 1 })
    } else {
      setCurrentMessage("Just enough to help me guide you better.")
      setTimeout(() => setState({ ...state, step: 1 }), 2000)
    }
  }

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      setState({ ...state, userName: nameInput.trim(), step: 2 })
      setNameInput("")
    }
  }

  const handleToneSelect = (tone: "motivational" | "supportive" | "chill" | "professional") => {
    setState({ ...state, tone, step: 3 })
  }

  const handleLifeFocusToggle = (focus: string) => {
    const current = state.lifeFocus
    const updated = current.includes(focus) ? current.filter((f) => f !== focus) : [...current, focus]
    setState({ ...state, lifeFocus: updated })
  }

  const handleLifeFocusContinue = () => {
    if (state.lifeFocus.length > 0) {
      setState({ ...state, step: 4 })
    }
  }

  const handleScheduleSelect = (pref: "daily-checkins" | "on-demand" | "not-sure") => {
    setState({ ...state, schedulePreference: pref, step: 5 })

    // Start building animation
    setTimeout(() => {
      // Save to user context
      const profile = userContextManager.getUserProfile() || userContextManager["getDefaultProfile"]()
      profile.name = state.userName || "User"
      profile.preferences.tone = state.tone
      profile.preferences.focusAreas = state.lifeFocus
      profile.preferences.schedulePreference = pref
      userContextManager.saveUserProfile(profile)

      // Complete onboarding
      const finalState = { ...state, completed: true, completedAt: new Date().toISOString() }
      setState(finalState)

      setTimeout(() => {
        clearOnboardingState()
        onComplete(finalState)
      }, 3000)
    }, 2000)
  }

  const renderStep = () => {
    switch (state.step) {
      case 0:
        return (
          showOptions && (
            <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-2">
              <Button
                size="lg"
                className={`bg-gradient-to-r ${getToneColor()} text-white font-semibold hover:shadow-lg transition-all`}
                onClick={() => handleInitialChoice("yes")}
              >
                Yes, let's do it
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-apex-primary/30 text-apex-primary hover:bg-apex-primary/10 bg-transparent"
                onClick={() => handleInitialChoice("questions")}
              >
                What kind of questions?
              </Button>
            </div>
          )
        )

      case 1:
        return (
          showOptions && (
            <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                placeholder="Enter your name..."
                className="bg-apex-dark border-apex-primary/30 text-white"
                autoFocus
              />
              <Button onClick={handleNameSubmit} disabled={!nameInput.trim()}>
                <Check size={20} />
              </Button>
            </div>
          )
        )

      case 2:
        return (
          showOptions && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2">
              {toneOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleToneSelect(option.id as any)}
                  className={`p-4 rounded-lg border-2 border-apex-primary/30 hover:border-apex-primary bg-apex-dark/50 hover:bg-apex-dark transition-all text-left`}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <div className="text-white font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          )
        )

      case 3:
        return (
          showOptions && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {lifeFocusOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = state.lifeFocus.includes(option.id)
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleLifeFocusToggle(option.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-apex-primary bg-apex-primary/20"
                          : "border-apex-primary/30 bg-apex-dark/50 hover:border-apex-primary/50"
                      }`}
                    >
                      <Icon className={`mb-2 ${isSelected ? "text-apex-primary" : "text-apex-gray"}`} size={24} />
                      <div className={`text-sm font-medium ${isSelected ? "text-white" : "text-apex-gray"}`}>
                        {option.label}
                      </div>
                    </button>
                  )
                })}
              </div>
              <Button
                onClick={handleLifeFocusContinue}
                disabled={state.lifeFocus.length === 0}
                className="w-full bg-gradient-to-r from-apex-primary to-apex-accent text-white"
              >
                Continue
              </Button>
            </div>
          )
        )

      case 4:
        return (
          showOptions && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
              <Button
                size="lg"
                variant="outline"
                className="border-apex-primary/30 text-white hover:bg-apex-primary/10 justify-start bg-transparent"
                onClick={() => handleScheduleSelect("daily-checkins")}
              >
                <span className="mr-2">⏰</span> Daily check-ins
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-apex-primary/30 text-white hover:bg-apex-primary/10 justify-start bg-transparent"
                onClick={() => handleScheduleSelect("on-demand")}
              >
                <span className="mr-2">🧠</span> Just help me when I ask
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-apex-primary/30 text-white hover:bg-apex-primary/10 justify-start bg-transparent"
                onClick={() => handleScheduleSelect("not-sure")}
              >
                <span className="mr-2">🤔</span> Not sure yet
              </Button>
            </div>
          )
        )

      case 5:
        return (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-apex-primary rounded-full animate-pulse" />
              <span className="text-apex-gray">Setting tone...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-apex-primary rounded-full animate-pulse delay-200" />
              <span className="text-apex-gray">Selecting modules...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-apex-primary rounded-full animate-pulse delay-500" />
              <span className="text-apex-gray">Preparing your dashboard...</span>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <Check className="text-apex-primary" size={20} />
              <span className="text-white font-medium">Done ✅</span>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-apex-darker via-black to-apex-darker opacity-50" />
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-apex-primary rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.15}s`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <Card className="bg-apex-dark/80 backdrop-blur-lg border-apex-primary/30 p-8">
          {/* Apex Orb */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${getToneColor()} flex items-center justify-center flex-shrink-0 ${
                isTyping ? "animate-pulse" : ""
              }`}
            >
              <Sparkles className="text-white" size={28} />
            </div>
            <div className="flex-1 min-h-[100px]">
              <div className="text-apex-light text-lg leading-relaxed">
                {currentMessage}
                {isTyping && <span className="inline-block w-1 h-5 bg-apex-primary ml-1 animate-pulse" />}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="mt-6">{renderStep()}</div>

          {/* Privacy note */}
          {state.step === 5 && (
            <div className="mt-6 p-4 bg-apex-darker/50 border border-apex-primary/20 rounded-lg animate-in fade-in delay-1000">
              <p className="text-sm text-apex-gray text-center">
                🔒 Everything we discussed is stored only on your device. You control what I remember — and what I
                forget.
              </p>
            </div>
          )}
        </Card>

        {/* Memory indicator */}
        <div className="mt-4 text-center">
          <span className="text-sm text-apex-gray">Memory: ON ✅</span>
        </div>
      </div>
    </div>
  )
}
