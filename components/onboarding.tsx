"use client"

import type React from "react"
import { ShieldCheckIcon, MicrophoneIcon, SparklesIcon } from "@heroicons/react/24/solid"
import { useState, useEffect, useRef } from "react"
import { useVault } from "@/lib/vault-context"
import type { UserProfile, StudioType } from "@/lib/types"
import { detectStudioFromHobbies, getStudioDescription } from "@/lib/studio-mapper"
import Spinner from "./spinner"
import StudioBackground from "./studio-background"
import ModelSelector from "./model-selector"
import VaultSecurityIntro from "./vault-security-intro"

export default function Onboarding() {
  const { createVault } = useVault()
  const [step, setStep] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [orbActivated, setOrbActivated] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [detectedStudios, setDetectedStudios] = useState<StudioType[]>([])
  const [previewStudio, setPreviewStudio] = useState<StudioType>("nexus")

  // Voice recognition state
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  const [profile, setProfile] = useState<Partial<UserProfile>>({
    skills: [],
    interests: [],
    hobbies: [],
    financialRiskStyle: "Moderate",
    aiPersona: "Collaborator",
    aiModel: "GPT-4", // Added AI model state
  })

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [includeSampleData, setIncludeSampleData] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setVoiceSupported(true)
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        handleVoiceInput(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setOrbActivated(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (profile.hobbies && profile.hobbies.length > 0) {
      const studios = detectStudioFromHobbies(profile.hobbies)
      setDetectedStudios(studios)
      if (studios.length > 0) {
        setPreviewStudio(studios[0])
        triggerConfetti()
      }
    }
  }, [profile.hobbies])

  const handleVoiceInput = (transcript: string) => {
    // Simple parsing - in production, you'd use NLP
    const lowerTranscript = transcript.toLowerCase()

    if (lowerTranscript.includes("guitar") || lowerTranscript.includes("music") || lowerTranscript.includes("piano")) {
      addHobby("guitar")
    } else if (
      lowerTranscript.includes("art") ||
      lowerTranscript.includes("paint") ||
      lowerTranscript.includes("draw")
    ) {
      addHobby("art")
    } else if (
      lowerTranscript.includes("code") ||
      lowerTranscript.includes("program") ||
      lowerTranscript.includes("develop")
    ) {
      addHobby("coding")
    } else if (
      lowerTranscript.includes("fitness") ||
      lowerTranscript.includes("gym") ||
      lowerTranscript.includes("workout")
    ) {
      addHobby("fitness")
    } else if (lowerTranscript.includes("game") || lowerTranscript.includes("gaming")) {
      addHobby("gaming")
    } else if (lowerTranscript.includes("read") || lowerTranscript.includes("book")) {
      addHobby("reading")
    } else if (lowerTranscript.includes("cook") || lowerTranscript.includes("baking")) {
      addHobby("cooking")
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const addHobby = (hobby: string) => {
    const currentHobbies = profile.hobbies || []
    if (!currentHobbies.includes(hobby)) {
      setProfile({ ...profile, hobbies: [...currentHobbies, hobby] })
    }
  }

  const removeHobby = (hobby: string) => {
    const currentHobbies = profile.hobbies || []
    setProfile({ ...profile, hobbies: currentHobbies.filter((h) => h !== hobby) })
  }

  const triggerConfetti = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === "skills" || name === "interests") {
      setProfile({ ...profile, [name]: value.split(",").map((s) => s.trim()) })
    } else {
      setProfile({ ...profile, [name]: value })
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
    await createVault(profile as UserProfile, password, includeSampleData)
  }

  if (step === -1) {
    return <VaultSecurityIntro onContinue={() => setStep(0)} />
  }

  if (step === 0) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <StudioBackground studio="nexus" />

        {/* Nexus Core Orb */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`relative transition-all duration-1000 ${
              orbActivated ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            {/* Outer glow rings */}
            <div className="absolute inset-0 -m-20">
              <div className="absolute inset-0 rounded-full border-2 border-apex-primary/30 animate-pulse-ring" />
              <div
                className="absolute inset-0 rounded-full border-2 border-apex-accent/20 animate-pulse-ring"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute inset-0 rounded-full border border-apex-secondary/10 animate-pulse-ring"
                style={{ animationDelay: "1s" }}
              />
            </div>

            {/* Core orb with plasma effect */}
            <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-apex-primary via-apex-secondary to-apex-accent animate-glow">
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 opacity-80 animate-pulseBg" />
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-white to-cyan-200 opacity-60 blur-md" />

              {/* Particle explosions */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-apex-accent rounded-full particle"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `rotate(${i * 30}deg) translateY(-80px)`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Text overlays */}
          <div
            className={`mt-12 text-center transition-all duration-1000 delay-500 ${
              orbActivated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl font-bold mb-4 gradient-text">Awaken Your Symbiosis</h1>
            <p className="text-apex-gray text-lg mb-4 max-w-2xl mx-auto px-4">
              A privacy-first AI co-pilot that evolves with you. Share your passions, and watch your personal studio
              come to life.
            </p>
            <p className="text-apex-accent text-sm mb-8 max-w-xl mx-auto px-4">
              The more you share about your hobbies and goals, the more I evolve your studios—let's build our bond
              together.
            </p>

            {/* Holographic unlock button */}
            <button
              onClick={() => setStep(1)}
              className="group relative px-8 py-4 bg-transparent border-2 border-apex-primary rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-apex-primary/20 to-apex-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative text-apex-primary font-semibold text-lg flex items-center gap-2">
                <SparklesIcon className="w-6 h-6" />
                Begin Awakening
              </span>
            </button>

            <p className="mt-6 text-xs text-apex-gray/60 flex items-center justify-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-green-400" />
              Zero-Knowledge • Data Never Leaves Your Device
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <StudioBackground studio={previewStudio} />

        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-apex-primary rounded-full animate-fadeIn"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `fadeIn 1s ease-out ${Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 w-full max-w-2xl glass-effect p-8 rounded-2xl animate-fadeIn">
          {/* Orb icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-apex-primary to-apex-accent animate-glow flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 gradient-text">Tell Me What Sparks You</h1>
          <p className="text-center text-apex-gray mb-6 text-sm">
            Share your hobbies and watch your personal studio evolve
          </p>

          {/* Studio preview */}
          {detectedStudios.length > 0 && (
            <div className="mb-6 p-4 bg-apex-primary/10 border border-apex-primary/30 rounded-lg">
              <p className="text-apex-primary text-sm font-semibold mb-2">Studio Unlocked!</p>
              <p className="text-apex-light text-xs">{getStudioDescription(previewStudio)}</p>
              {detectedStudios.length > 1 && (
                <div className="flex gap-2 mt-3">
                  {detectedStudios.map((studio) => (
                    <button
                      key={studio}
                      onClick={() => setPreviewStudio(studio)}
                      className={`px-3 py-1 rounded text-xs transition-all ${
                        previewStudio === studio
                          ? "bg-apex-primary text-black"
                          : "bg-apex-primary/20 text-apex-primary hover:bg-apex-primary/30"
                      }`}
                    >
                      {studio}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              setStep(2)
            }}
            className="space-y-4"
          >
            {/* Voice input section */}
            <div className="bg-black/30 border border-apex-primary/20 rounded-lg p-4">
              <label className="text-sm font-medium text-apex-light mb-2 block">What hobbies spark your passion?</label>

              {voiceSupported && (
                <button
                  type="button"
                  onClick={startListening}
                  disabled={isListening}
                  className={`w-full mb-3 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    isListening
                      ? "border-apex-primary bg-apex-primary/20 animate-pulse"
                      : "border-apex-primary/30 hover:border-apex-primary hover:bg-apex-primary/10"
                  }`}
                >
                  <MicrophoneIcon className={`w-5 h-5 ${isListening ? "text-apex-primary" : "text-apex-gray"}`} />
                  <span className="text-apex-light text-sm">{isListening ? "Listening..." : "Tap to speak"}</span>
                </button>
              )}

              {/* Quick hobby buttons */}
              <div className="flex flex-wrap gap-2 mb-3">
                {["guitar", "art", "coding", "fitness", "gaming", "reading", "cooking"].map((hobby) => (
                  <button
                    key={hobby}
                    type="button"
                    onClick={() => addHobby(hobby)}
                    className="px-3 py-1 bg-apex-primary/20 hover:bg-apex-primary/30 text-apex-primary text-xs rounded-lg transition-all"
                  >
                    + {hobby}
                  </button>
                ))}
              </div>

              {/* Selected hobbies */}
              {profile.hobbies && profile.hobbies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.hobbies.map((hobby) => (
                    <div
                      key={hobby}
                      className="px-3 py-1 bg-apex-primary text-black text-xs rounded-lg flex items-center gap-2"
                    >
                      {hobby}
                      <button
                        type="button"
                        onClick={() => removeHobby(hobby)}
                        className="hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Basic profile fields */}
            <div>
              <label className="text-sm font-medium text-apex-light">Your Name</label>
              <input
                type="text"
                name="name"
                onChange={handleProfileChange}
                required
                className="w-full bg-black/50 border border-apex-primary/30 rounded-lg p-3 mt-1 outline-none focus:ring-2 focus:ring-apex-primary text-white transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-apex-light">Occupation</label>
              <input
                type="text"
                name="occupation"
                onChange={handleProfileChange}
                required
                className="w-full bg-black/50 border border-apex-primary/30 rounded-lg p-3 mt-1 outline-none focus:ring-2 focus:ring-apex-primary text-white transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-apex-light">AI Persona</label>
              <select
                name="aiPersona"
                value={profile.aiPersona}
                onChange={handleProfileChange}
                required
                className="w-full bg-black/50 border border-apex-primary/30 rounded-lg p-3 mt-1 outline-none focus:ring-2 focus:ring-apex-primary text-white transition-all"
              >
                <option value="Collaborator">Collaborator - Works alongside you</option>
                <option value="Coach">Coach - Guides and motivates</option>
                <option value="Oracle">Oracle - Provides deep insights</option>
              </select>
            </div>

            {/* Hint for zero inputs */}
            {(!profile.hobbies || profile.hobbies.length === 0) && (
              <div className="bg-apex-accent/10 border border-apex-accent/30 p-3 rounded-lg">
                <p className="text-apex-accent text-xs text-center">
                  💡 Share hobbies to unlock personalized studios! Or skip to start with the neutral Nexus.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-apex-primary to-apex-secondary text-white font-semibold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all duration-300 hover:scale-[1.02]"
            >
              Continue to AI Model Selection
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <StudioBackground studio={previewStudio} />

        <div className="relative z-10 w-full max-w-2xl glass-effect p-8 rounded-2xl animate-fadeIn">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-apex-primary to-apex-accent animate-glow flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 gradient-text">Choose Your AI Brain</h1>
          <p className="text-center text-apex-gray mb-6 text-sm">Select the AI model that powers your Apex assistant</p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              setStep(3)
            }}
            className="space-y-4"
          >
            <ModelSelector />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-black/50 border border-apex-primary/30 text-apex-light font-semibold py-3 rounded-lg hover:bg-black/70 transition-all"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-apex-primary to-apex-secondary text-white font-semibold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all duration-300 hover:scale-[1.02]"
              >
                Continue to Security
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <StudioBackground studio={previewStudio} />

      <div className="relative z-10 w-full max-w-md glass-effect p-8 rounded-2xl animate-fadeIn">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-apex-primary to-apex-accent animate-glow flex items-center justify-center">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 gradient-text">Seal Your Nexus</h1>
        <p className="text-center text-apex-gray mb-6 text-sm">Create your master encryption key</p>

        <form onSubmit={handleCreateVault} className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg mb-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-400" />
              <p className="font-semibold text-green-400">Zero-Knowledge Encryption</p>
            </div>
            <p className="text-xs text-apex-gray leading-relaxed text-center">
              Your master password encrypts all data locally using AES-256-GCM. It is NEVER sent to any server. If you
              forget it, your data cannot be recovered.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-apex-light">Master Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 8 characters"
              className="w-full bg-black/50 border border-apex-primary/30 rounded-lg p-3 mt-1 outline-none focus:ring-2 focus:ring-apex-primary text-white transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-apex-light">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-black/50 border border-apex-primary/30 rounded-lg p-3 mt-1 outline-none focus:ring-2 focus:ring-apex-primary text-white transition-all"
            />
          </div>
          <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-apex-primary/20">
            <input
              type="checkbox"
              id="sampleData"
              checked={includeSampleData}
              onChange={(e) => setIncludeSampleData(e.target.checked)}
              className="w-4 h-4 accent-apex-primary"
            />
            <label htmlFor="sampleData" className="text-sm text-apex-light cursor-pointer">
              Include sample data to explore features
            </label>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-apex-primary to-apex-secondary text-white font-semibold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all duration-300 hover:scale-[1.02] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner /> : "Activate Symbiosis"}
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full text-center text-sm text-apex-gray hover:text-apex-primary transition-colors mt-2"
          >
            ← Back to AI Model Selection
          </button>
        </form>
      </div>
    </div>
  )
}
