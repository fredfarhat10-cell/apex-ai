"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ApexOrb } from "./apex-orb"
import { VoiceEngine } from "./voice-engine"
import { userContextManager } from "@/lib/user-context-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, MicOff, Keyboard } from "lucide-react"

interface OnboardingStep {
  step: number
  message: string
  saveAs?: "userName" | "tone" | "goal"
  action?: "navigate"
  target?: string
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    step: 1,
    message: "Hello. I'm Apex — your AI companion. May I ask a few things to get started?",
  },
  {
    step: 2,
    message: "What should I call you?",
    saveAs: "userName",
  },
  {
    step: 3,
    message: "And how should I speak to you? Motivational, supportive, chill, or professional?",
    saveAs: "tone",
  },
  {
    step: 4,
    message: "What should we focus on first — fitness, creativity, focus, or something else?",
    saveAs: "goal",
  },
]

export function VoiceOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [orbState, setOrbState] = useState<"idle" | "speaking" | "listening" | "thinking">("idle")
  const [displayText, setDisplayText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [useTextInput, setUseTextInput] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [userData, setUserData] = useState({
    userName: "",
    tone: "",
    goal: "",
  })

  const voiceEngineRef = useRef<VoiceEngine | null>(null)
  const typewriterTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    voiceEngineRef.current = new VoiceEngine()

    // Start onboarding after a brief delay
    setTimeout(() => {
      speakCurrentStep()
    }, 1000)

    return () => {
      if (voiceEngineRef.current) {
        voiceEngineRef.current.stop()
      }
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current)
      }
    }
  }, [])

  const typewriterEffect = (text: string, speed = 30) => {
    setDisplayText("")
    let index = 0

    const type = () => {
      if (index < text.length) {
        setDisplayText(text.substring(0, index + 1))
        index++
        typewriterTimeoutRef.current = setTimeout(type, speed)
      }
    }

    type()
  }

  const speakCurrentStep = async () => {
    const step = ONBOARDING_STEPS[currentStep]
    if (!step || !voiceEngineRef.current) return

    let message = step.message

    // Personalize message with user data
    if (userData.userName) {
      message = message.replace("{{userName}}", userData.userName)
    }
    if (userData.tone) {
      message = message.replace("{{tone}}", userData.tone)
    }
    if (userData.goal) {
      message = message.replace("{{goal}}", userData.goal)
    }

    setOrbState("speaking")
    typewriterEffect(message)

    try {
      await voiceEngineRef.current.speak(
        message,
        () => setOrbState("speaking"),
        () => setOrbState("idle"),
      )

      // After speaking, wait for response (except for first step)
      if (step.saveAs) {
        setTimeout(() => {
          if (!useTextInput) {
            startListening()
          }
        }, 500)
      } else {
        // First step - just move to next
        setTimeout(() => {
          setCurrentStep(1)
        }, 1500)
      }
    } catch (error) {
      console.error("[v0] Speech error:", error)
      setOrbState("idle")
    }
  }

  const startListening = () => {
    if (!voiceEngineRef.current) return

    setIsListening(true)
    setOrbState("listening")

    voiceEngineRef.current.startListening(
      (transcript) => {
        handleUserResponse(transcript)
      },
      () => {
        setIsListening(false)
        setOrbState("idle")
      },
    )
  }

  const stopListening = () => {
    if (voiceEngineRef.current) {
      voiceEngineRef.current.stopListening()
    }
    setIsListening(false)
    setOrbState("idle")
  }

  const handleUserResponse = (response: string) => {
    const step = ONBOARDING_STEPS[currentStep]
    if (!step.saveAs) return

    setOrbState("thinking")

    // Save the response
    const newUserData = { ...userData, [step.saveAs]: response }
    setUserData(newUserData)

    // Show acknowledgment
    setTimeout(() => {
      if (currentStep < ONBOARDING_STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        finishOnboarding(newUserData)
      }
    }, 1000)
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!textInput.trim()) return

    handleUserResponse(textInput)
    setTextInput("")
  }

  const finishOnboarding = async (data: typeof userData) => {
    // Save to user context
    const profile = userContextManager.getUserProfile() || {
      id: `user_${Date.now()}`,
      name: data.userName,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      preferences: {
        communicationStyle: "professional" as const,
        tone: data.tone as any,
        notificationFrequency: "medium" as const,
        proactivityLevel: "high" as const,
        focusAreas: [data.goal.toLowerCase()],
        workingHours: { start: "09:00", end: "17:00" },
        preferredMeetingTimes: [],
        avoidMeetingTimes: [],
      },
      goals: [],
      habits: [],
      personalInfo: {
        interests: [],
        skills: [],
        learningGoals: [data.goal],
        challenges: [],
      },
      workStyle: {
        preferredWorkTime: "morning" as const,
        focusSessionDuration: 90,
        breakFrequency: 25,
        multitaskingPreference: "single-task" as const,
        decisionMakingStyle: "analytical" as const,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    userContextManager.saveUserProfile(profile)

    if (typeof window !== "undefined") {
      localStorage.setItem("apex_voice_onboarding_complete", "true")
    }

    // Final message
    const finalMessage = `Thanks, ${data.userName}. I've set your tone to ${data.tone} and focus to ${data.goal}. Let's begin.`

    setOrbState("speaking")
    typewriterEffect(finalMessage)

    if (voiceEngineRef.current) {
      await voiceEngineRef.current.speak(
        finalMessage,
        () => setOrbState("speaking"),
        () => setOrbState("idle"),
      )
    }

    // Navigate to dashboard
    setTimeout(() => {
      router.push("/")
    }, 2000)
  }

  useEffect(() => {
    if (currentStep > 0 && currentStep < ONBOARDING_STEPS.length) {
      speakCurrentStep()
    }
  }, [currentStep])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001F3F] via-[#002B4F] to-[#001F3F] flex flex-col items-center justify-center p-6">
      {/* Orb */}
      <div className="mb-8">
        <ApexOrb state={orbState} />
      </div>

      {/* Display Text */}
      <div className="max-w-2xl w-full text-center mb-12">
        <p className="text-2xl text-white font-light leading-relaxed min-h-[4rem]">{displayText}</p>
      </div>

      {/* Input Area */}
      {ONBOARDING_STEPS[currentStep]?.saveAs && (
        <div className="max-w-md w-full space-y-4">
          {!useTextInput ? (
            <div className="flex flex-col items-center gap-4">
              <Button
                size="lg"
                onClick={isListening ? stopListening : startListening}
                className={`w-20 h-20 rounded-full ${
                  isListening ? "bg-red-500 hover:bg-red-600" : "bg-[#00FFD1] hover:bg-[#00E5BD]"
                } text-[#001F3F] transition-all duration-300`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </Button>

              <p className="text-sm text-[#00FFD1]/60">{isListening ? "Listening..." : "Click to speak"}</p>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseTextInput(true)}
                className="text-[#00FFD1]/60 hover:text-[#00FFD1]"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Type instead
              </Button>
            </div>
          ) : (
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your response..."
                className="bg-white/10 border-[#00FFD1]/30 text-white placeholder:text-white/40"
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-[#00FFD1] hover:bg-[#00E5BD] text-[#001F3F]">
                  Submit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setUseTextInput(false)}
                  className="text-[#00FFD1]/60 hover:text-[#00FFD1]"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Skip Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/")}
        className="absolute top-6 right-6 text-[#00FFD1]/60 hover:text-[#00FFD1]"
      >
        Skip
      </Button>
    </div>
  )
}
