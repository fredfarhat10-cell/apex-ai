"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useVault } from "@/lib/vault-context"
import type { UserProfile } from "@/lib/types"
import { VoiceEngine } from "@/lib/voice-engine"
import { ApexOrb } from "@/components/shared/apex-orb"

interface VoiceFirstOnboardingProps {
  onComplete?: () => void
}

export function VoiceFirstOnboarding({ onComplete }: VoiceFirstOnboardingProps) {
  const { createVault } = useVault()
  const [stage, setStage] = useState("intro") // intro | askName | askGoal | finalizing | security
  const [orbState, setOrbState] = useState("speaking") // speaking | listening | thinking
  const [spokenText, setSpokenText] = useState("")
  const [userTranscript, setUserTranscript] = useState("")
  const [userData, setUserData] = useState<Partial<UserProfile>>({})
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isCreatingVault, setIsCreatingVault] = useState(false)

  const voiceEngine = useRef<VoiceEngine | null>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    voiceEngine.current = new VoiceEngine()
    runSequence()

    return () => {
      voiceEngine.current?.stop()
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
    }
  }, [])

  const speakWithTyping = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      setOrbState("speaking")
      setSpokenText("")

      let i = 0
      typingIntervalRef.current = setInterval(() => {
        if (i >= text.length) {
          clearInterval(typingIntervalRef.current!)
          voiceEngine.current?.speak(text, undefined, () => {
            resolve()
          })
        } else {
          setSpokenText(text.substring(0, i + 1))
          i++
        }
      }, 30)
    })
  }

  const listenForResponse = () => {
    setOrbState("listening")
    setUserTranscript("")
    voiceEngine.current?.startListening(
      (transcript) => {
        setUserTranscript(transcript)
      },
      () => {
        setOrbState("thinking")
        setTimeout(() => {
          if (userTranscript.trim()) {
            handleResponse(userTranscript.trim())
          } else {
            // If no response, ask again
            listenForResponse()
          }
        }, 1500)
      },
    )
  }

  const handleResponse = async (text: string) => {
    const updatedUserData = { ...userData }

    if (stage === "intro") {
      // Move to asking for name
      await speakWithTyping("Allow me to introduce myself. I am Apex.")
      await speakWithTyping(
        "I learn through conversation to become your personalized co-pilot, adapting to your goals and your mindset.",
      )
      await speakWithTyping("Before we begin our journey together... who am I speaking with?")
      setStage("askName")
      listenForResponse()
    } else if (stage === "askName") {
      const name = text.split(" ")[0] // Extract first word as name
      updatedUserData.name = name
      setUserData(updatedUserData)
      await speakWithTyping(
        `A pleasure, ${name}. Every great journey has a destination. Tell me, what is the summit you are climbing right now?`,
      )
      setStage("askGoal")
      listenForResponse()
    } else if (stage === "askGoal") {
      updatedUserData.interests = [text]
      setUserData(updatedUserData)
      await speakWithTyping(`An excellent goal. I'll keep "${text}" in mind as we work together.`)
      await speakWithTyping("Now let's secure your Nexus with a master password.")
      setStage("security")
    }
  }

  const runSequence = async () => {
    // Start with intro stage
    setStage("intro")
    handleResponse("")
  }

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      return
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.")
      return
    }

    setPasswordError("")
    setIsCreatingVault(true)

    const completeProfile: UserProfile = {
      name: userData.name || "User",
      occupation: "Not specified",
      location: "Not specified",
      skills: [],
      interests: userData.interests || [],
      hobbies: [],
      financialRiskStyle: "Moderate",
      aiPersona: "Collaborator",
      aiModel: "GPT-4",
    }

    await createVault(completeProfile, password, true)

    if (onComplete) {
      onComplete()
    }
  }

  if (stage === "security") {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-apex-darker via-apex-dark to-apex-darker">
        <div className="relative z-10 w-full max-w-md glass-effect p-8 rounded-2xl animate-fadeIn">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 animate-glow flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Seal Your Nexus
          </h1>
          <p className="text-center text-gray-400 mb-6 text-sm">Create your master encryption key</p>

          <form onSubmit={handleCreateVault} className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg mb-4 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.218c0 1.102-.585 2.172-1.536 2.743l-8.546 5.955a3.066 3.066 0 01-3.322 0l-8.546-5.955A3.066 3.066 0 011.455 9.735V3.517a3.066 3.066 0 012.812-3.062zm7.958 5.28a.75.75 0 00-1.214-.882l-3.083 4.2-1.44-1.494a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l3.85-5.195z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-semibold text-green-400">Zero-Knowledge Encryption</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed text-center">
                Your master password encrypts all data locally using AES-256-GCM. It is NEVER sent to any server. If you
                forget it, your data cannot be recovered.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-white">Master Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimum 8 characters"
                className="w-full bg-black/50 border border-cyan-500/30 rounded-lg p-3 mt-1 outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-black/50 border border-cyan-500/30 rounded-lg p-3 mt-1 outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-all"
              />
            </div>

            {passwordError && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                <p className="text-red-400 text-sm text-center">{passwordError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isCreatingVault}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingVault ? "Activating..." : "Activate Symbiosis"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Voice-first onboarding interface
  return (
    <div className="h-screen w-full bg-gradient-to-br from-apex-darker via-apex-dark to-apex-darker flex flex-col items-center justify-center text-white p-6 animate-fadeIn relative overflow-hidden">
      {/* Atmospheric background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* The Apex Orb */}
      <div className="relative z-10 mb-12">
        <ApexOrb speaking={orbState === "speaking"} />
      </div>

      {/* Spoken Text Display */}
      <div className="w-full max-w-3xl text-center min-h-[120px] mb-8 relative z-10">
        <p className="text-3xl font-light text-gray-300 leading-relaxed transition-opacity duration-500 text-balance">
          {spokenText}
        </p>
      </div>

      {/* User Transcript Display */}
      <div className="w-full max-w-3xl text-center min-h-[40px] mb-8 relative z-10">
        {userTranscript && <p className="text-xl text-cyan-400 font-semibold animate-fadeIn">"{userTranscript}"</p>}
      </div>

      {/* Status Indicator */}
      <div className="mt-8 text-sm text-gray-500 font-mono uppercase tracking-widest relative z-10">
        {orbState === "listening" ? "Listening..." : orbState === "thinking" ? "Processing..." : "Awaiting Command"}
      </div>

      {/* Keyboard fallback hint */}
      <div className="absolute bottom-6 text-xs text-gray-600 text-center">
        Speech recognition not working? Check your browser permissions or try a different browser.
      </div>
    </div>
  )
}

export default VoiceFirstOnboarding
