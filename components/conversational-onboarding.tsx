"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useVault } from "@/lib/vault-context"
import type { UserProfile } from "@/lib/types"
import { Shield, User, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ConversationalOnboardingProps {
  onComplete?: () => void
}

export default function ConversationalOnboarding({ onComplete }: ConversationalOnboardingProps) {
  const { createVault } = useVault()
  const [phase, setPhase] = useState("conversation") // conversation | security
  const [stage, setStage] = useState("intro")
  const [messages, setMessages] = useState<Array<{ from: "apex" | "user"; text: string }>>([])
  const [userInfo, setUserInfo] = useState<Partial<UserProfile>>({})
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const getAdaptiveGreeting = (prefs: Partial<UserProfile>) => {
    const country = prefs.location?.toLowerCase() || ""
    if (country.includes("italy")) return "Ciao"
    if (country.includes("india")) return "Namaste"
    if (country.includes("france")) return "Bonjour"
    if (country.includes("japan")) return "Konnichiwa"
    if (country.includes("spain")) return "Hola"
    return "Hello"
  }

  useEffect(() => {
    setTimeout(() => {
      addApex("Welcome to Apex. I'm your AI companion, designed to help you orchestrate your life.")
      setTimeout(() => {
        addApex("I learn through conversation, not forms. Let's start simple.")
        setTimeout(() => {
          addApex("What's your name?")
          setStage("askName")
        }, 1500)
      }, 1500)
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
      addApex(`Nice to meet you, ${name}. Where are you based?`)
      setStage("askLocation")
      setUserInfo(prefs)
    } else if (stage === "askLocation") {
      const location = text.trim()
      const prefs = { ...userInfo, location }
      addUser(text)
      addApex(`${getAdaptiveGreeting(prefs)}, ${prefs.name}. What's one thing you're focused on right now?`)
      setStage("askInterest")
      setUserInfo(prefs)
    } else if (stage === "askInterest") {
      const interest = text.trim()
      const prefs = { ...userInfo, interests: [interest] }
      addUser(text)
      addApex(`Perfect. Now let's secure your data with a master password.`)
      setTimeout(() => setPhase("security"), 2000)
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

  if (phase === "conversation") {
    return (
      <section className="flex flex-col items-center justify-between min-h-screen text-white px-4 py-6 bg-[#0A0A0F]">
        <div className="flex flex-col items-center mb-6 flex-1 justify-center max-w-3xl w-full">
          <div className="mb-8 p-6 rounded-full bg-[#111116] border border-[#2A2A2F]">
            <User className="w-12 h-12 text-[#FF6B00]" />
          </div>

          {/* Conversation display */}
          <div className="overflow-y-auto max-h-[50vh] w-full space-y-3 mb-8">
            {messages.map((m, i) => (
              <div key={i} className={`animate-fadeIn ${m.from === "apex" ? "text-left" : "text-right"}`}>
                <div
                  className={`inline-block max-w-[80%] px-4 py-3 rounded-lg ${
                    m.from === "apex"
                      ? "bg-[#111116] border border-[#2A2A2F] text-[#E5E5E5]"
                      : "bg-[#FF6B00] text-white font-medium"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            const text = inputValue.trim()
            if (!text) return
            handleUserResponse(text)
            setInputValue("")
          }}
          className="flex items-center w-full max-w-2xl gap-3 pb-6"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 px-5 py-4 rounded-lg bg-[#111116] border border-[#2A2A2F] text-white placeholder-[#888888] outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
            autoFocus
          />
          <Button
            type="submit"
            className="px-6 py-4 rounded-lg bg-[#FF6B00] hover:bg-[#FF8533] font-semibold transition-all shadow-lg"
          >
            Send
          </Button>
        </form>
      </section>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-[#0A0A0F]">
      <div className="relative z-10 w-full max-w-md bg-[#111116] border border-[#2A2A2F] p-8 rounded-xl animate-fadeIn">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-[#FF6B00]" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-white">Secure Your Vault</h1>
        <p className="text-center text-[#888888] mb-6 text-sm">Create your master encryption key</p>

        <form onSubmit={handleCreateVault} className="space-y-4">
          <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 p-4 rounded-lg mb-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-[#FF6B00]" />
              <p className="font-semibold text-[#FF6B00]">Zero-Knowledge Encryption</p>
            </div>
            <p className="text-xs text-[#888888] leading-relaxed text-center">
              Your master password encrypts all data locally using AES-256-GCM. It is NEVER sent to any server. If you
              forget it, your data cannot be recovered.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-[#E5E5E5]">Master Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 8 characters"
              className="w-full bg-[#0A0A0F] border border-[#2A2A2F] rounded-lg p-3 mt-1 outline-none focus:ring-2 focus:ring-[#FF6B00] text-white transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#E5E5E5]">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-[#0A0A0F] border border-[#2A2A2F] rounded-lg p-3 mt-1 outline-none focus:ring-2 focus:ring-[#FF6B00] text-white transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FF6B00] hover:bg-[#FF8533] text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Vault..." : "Activate Apex"}
          </Button>
        </form>
      </div>
    </div>
  )
}
