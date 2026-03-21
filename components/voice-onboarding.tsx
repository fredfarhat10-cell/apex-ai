"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useVault } from "@/lib/vault-context"
import type { UserProfile } from "@/lib/types"
import { ShieldCheckIcon } from "@heroicons/react/24/solid"
import Spinner from "./spinner"
import { HolographicOrb } from "./holographic-orb"

interface VoiceOnboardingProps {
  onComplete?: () => void
}

export function VoiceOnboarding({ onComplete }: VoiceOnboardingProps) {
  const { createVault } = useVault()
  const [phase, setPhase] = useState("orb") // orb | security
  const [stage, setStage] = useState("intro")
  const [messages, setMessages] = useState<Array<{ from: "apex" | "user"; text: string }>>([])
  const [userInfo, setUserInfo] = useState<Partial<UserProfile>>({})
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const getAdaptiveGreeting = (prefs: Partial<UserProfile>) => {
    let greet = "Hello"
    const country = prefs.location?.toLowerCase() || ""
    const interests = prefs.interests?.join(" ").toLowerCase() || ""

    if (country.includes("italy")) greet = "Ciao"
    else if (country.includes("india") || interests.includes("wellness")) greet = "Namaste"
    else if (country.includes("france")) greet = "Bonjour"
    else if (country.includes("japan")) greet = "Konnichiwa"
    else if (country.includes("spain")) greet = "Hola"

    return greet
  }

  useEffect(() => {
    setTimeout(() => {
      addApex("Allow me to introduce myself. I am Apex — your adaptive AI symbiont.")
      setTimeout(() => {
        addApex("I learn through conversation, not forms. I remember context, not just commands.")
        setTimeout(() => {
          addApex("I can help you with strategy, finance, creativity, and personal growth.")
          setTimeout(() => {
            addApex("But first — what should I call you?")
            setStage("askName")
          }, 2000)
        }, 1500)
      }, 1000)
    }, 1000)
  }, [])

  function addApex(text: string) {
    setMessages((m) => [...m, { from: "apex", text }])
  }

  function addUser(text: string) {
    setMessages((m) => [...m, { from: "user", text }])
  }

  function handleUserResponse(text: string) {
    if (stage === "askName") {
      const name = text.split(" ")[0]
      const prefs = { ...userInfo, name }
      addUser(text)
      addApex(`${name}. I like it. Where are you joining me from?`)
      setStage("askLocation")
      setUserInfo(prefs)
    } else if (stage === "askLocation") {
      const location = text.trim()
      const prefs = { ...userInfo, location }
      addUser(text)
      const greeting = getAdaptiveGreeting(prefs)
      addApex(`${greeting}, ${prefs.name}. Now — what's one goal you're focused on right now?`)
      setStage("askGoal")
      setUserInfo(prefs)
    } else if (stage === "askGoal") {
      const goal = text.trim()
      const prefs = { ...userInfo, interests: [goal] }
      addUser(text)
      addApex(
        `Understood. I'll keep "${goal}" in mind as we work together. Now let's secure your Nexus with a master password.`,
      )
      setTimeout(() => setPhase("security"), 2500)
    }
  }

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }
    setError("")
    setIsLoading(true)

    const completeProfile: UserProfile = {
      name: userInfo.name || "User",
      occupation: "Not specified",
      location: userInfo.location || "Not specified",
      skills: [],
      interests: userInfo.interests || [],
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

  if (phase === "orb") {
    return (
      <section className="flex flex-col items-center justify-between min-h-screen text-white px-4 py-6 bg-gradient-to-br from-apex-darker via-apex-dark to-apex-darker">
        <div className="flex flex-col items-center mb-6 flex-1 justify-center max-w-3xl w-full">
          <HolographicOrb size={150} color="#00FFFF" intensity="high" className="mb-8" />

          {/* Conversation display */}
          <div className="overflow-y-auto max-h-[50vh] w-full space-y-3 mb-8">
            {messages.map((m, i) => (
              <div key={i} className={`animate-fadeIn ${m.from === "apex" ? "text-left" : "text-right"}`}>
                <div
                  className={`inline-block max-w-[80%] px-4 py-3 rounded-2xl ${
                    m.from === "apex"
                      ? "bg-cyan-500/10 border border-cyan-500/30 text-white"
                      : "bg-purple-500/20 border border-purple-500/30 text-white font-medium"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const text = e.currentTarget.elements.namedItem("input") as HTMLInputElement
            if (!text.value.trim()) return
            handleUserResponse(text.value.trim())
            e.currentTarget.reset()
          }}
          className="flex items-center w-full max-w-2xl gap-3 pb-6"
        >
          <input
            name="input"
            placeholder="Type your response..."
            className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-cyan-500/30 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 font-semibold hover:scale-105 transition-all shadow-lg shadow-cyan-500/20"
          >
            Send
          </button>
        </form>
      </section>
    )
  }

  // Security phase
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-apex-darker via-apex-dark to-apex-darker">
      <div className="relative z-10 w-full max-w-md glass-effect p-8 rounded-2xl animate-fadeIn">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 animate-glow flex items-center justify-center">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Seal Your Nexus
        </h1>
        <p className="text-center text-gray-400 mb-6 text-sm">Create your master encryption key</p>

        <form onSubmit={handleCreateVault} className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg mb-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-400" />
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

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all duration-300 hover:scale-[1.02] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner /> : "Activate Symbiosis"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default VoiceOnboarding
