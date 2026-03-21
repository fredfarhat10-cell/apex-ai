"use client"

import { useEffect, useState, useRef } from "react"
import { useVault } from "@/lib/vault-context"
import { detectStudioFromHobbies } from "@/lib/studio-mapper"
import type { StudioType } from "@/lib/types"
import { getTemplatesByCategory } from "@/lib/templates"
import TemplateSelector from "./template-selector"
import StudioBackground from "./studio-background"
import MusicStudio from "./studios/music-studio"
import ArtStudio from "./studios/art-studio"
import FitnessStudio from "./studios/fitness-studio"
import WritingStudio from "./studios/writing-studio"
import { Mic, Settings } from "lucide-react"

export default function StudioManager() {
  const { userProfile, activeStudio, updateState, studioPreferences, activities, applyTemplate } = useVault()
  const [availableStudios, setAvailableStudios] = useState<StudioType[]>(["nexus"])
  const [currentStudio, setCurrentStudio] = useState<StudioType>(activeStudio || "nexus")
  const [isListening, setIsListening] = useState(false)
  const [voiceCommand, setVoiceCommand] = useState("")
  const [showCustomization, setShowCustomization] = useState(false)
  const [showcaseMode, setShowcaseMode] = useState(true)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const hasPersonalizedContent = activities.length > 0 || (userProfile?.hobbies && userProfile.hobbies.length > 0)
    setShowcaseMode(!hasPersonalizedContent)
  }, [activities, userProfile])

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase()
        setVoiceCommand(transcript)
        handleVoiceCommand(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => setIsListening(false)
      recognitionRef.current.onend = () => setIsListening(false)
    }
  }, [])

  useEffect(() => {
    if (userProfile?.hobbies && userProfile.hobbies.length > 0) {
      const studios = detectStudioFromHobbies(userProfile.hobbies)
      setAvailableStudios(["nexus", ...studios])
    } else {
      setAvailableStudios(["nexus"])
    }
  }, [userProfile?.hobbies])

  const handleVoiceCommand = (command: string) => {
    if (command.includes("warmer") || command.includes("warm")) {
      updateStudioPreference("lighting", "warm")
    } else if (command.includes("cooler") || command.includes("cool")) {
      updateStudioPreference("lighting", "cool")
    } else if (command.includes("purple")) {
      updateStudioPreference("lighting", "purple")
    } else if (command.includes("cyan") || command.includes("blue")) {
      updateStudioPreference("lighting", "cyan")
    }

    if (command.includes("music")) {
      switchStudio("music")
    } else if (command.includes("art")) {
      switchStudio("art")
    } else if (command.includes("fitness") || command.includes("workout")) {
      switchStudio("fitness")
    } else if (command.includes("writing") || command.includes("write")) {
      switchStudio("reading")
    } else if (command.includes("nexus") || command.includes("home")) {
      switchStudio("nexus")
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const switchStudio = (studio: StudioType) => {
    if (availableStudios.includes(studio)) {
      setCurrentStudio(studio)
      updateState("activeStudio", studio)
    }
  }

  const updateStudioPreference = (setting: string, value: any) => {
    const currentPrefs = studioPreferences || []
    const existingPref = currentPrefs.find((p) => p.type === currentStudio)

    if (existingPref) {
      const updated = currentPrefs.map((p) => (p.type === currentStudio ? { ...p, [setting]: value } : p))
      updateState("studioPreferences", updated)
    } else {
      updateState("studioPreferences", [...currentPrefs, { type: currentStudio, [setting]: value, intensity: 3 }])
    }
  }

  const handleGetCreative = () => {
    setShowcaseMode(false)
    setShowTemplateSelector(true)
  }

  const handleSelectTemplate = (template: any) => {
    applyTemplate(template)
    setShowTemplateSelector(false)
    setShowcaseMode(false)
  }

  const getTemplateCategoryForStudio = (studio: StudioType) => {
    switch (studio) {
      case "music":
        return "music"
      case "fitness":
        return "fitness"
      case "reading":
        return "writing"
      case "art":
        return "art"
      default:
        return "music"
    }
  }

  const renderStudio = () => {
    switch (currentStudio) {
      case "music":
        return (
          <MusicStudio
            userProfile={userProfile}
            onCustomize={updateStudioPreference}
            showcaseMode={showcaseMode}
            onGetCreative={handleGetCreative}
          />
        )
      case "art":
        return <ArtStudio userProfile={userProfile} onCustomize={updateStudioPreference} />
      case "fitness":
        return (
          <FitnessStudio
            userProfile={userProfile}
            onCustomize={updateStudioPreference}
            showcaseMode={showcaseMode}
            onGetCreative={handleGetCreative}
          />
        )
      case "reading":
        return (
          <WritingStudio
            userProfile={userProfile}
            onCustomize={updateStudioPreference}
            showcaseMode={showcaseMode}
            onGetCreative={handleGetCreative}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="relative w-full h-full">
      <StudioBackground studio={currentStudio} />

      <div className="relative z-10 w-full h-full">{renderStudio()}</div>

      {availableStudios.length > 1 && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex gap-2 bg-black/60 backdrop-blur-md border border-cyan-400/30 rounded-full p-2">
            {availableStudios.map((studio) => (
              <button
                key={studio}
                onClick={() => switchStudio(studio)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  currentStudio === studio
                    ? "bg-cyan-500 text-black"
                    : "bg-transparent text-cyan-300 hover:bg-cyan-500/20"
                }`}
              >
                {studio}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={startListening}
        disabled={isListening}
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 px-6 py-3 rounded-full border-2 transition-all flex items-center gap-2 ${
          isListening
            ? "border-cyan-400 bg-cyan-400/20 animate-pulse"
            : "border-cyan-400/50 bg-black/60 hover:bg-cyan-400/10 backdrop-blur-md"
        }`}
      >
        <Mic className={`w-5 h-5 ${isListening ? "text-cyan-400" : "text-cyan-300"}`} />
        <span className="text-cyan-300 text-sm font-semibold">{isListening ? "Listening..." : "Voice Command"}</span>
      </button>

      {voiceCommand && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-black/80 backdrop-blur-md border border-cyan-400/30 rounded-lg">
          <p className="text-cyan-300 text-xs">"{voiceCommand}"</p>
        </div>
      )}

      <button
        onClick={() => setShowCustomization(!showCustomization)}
        className="absolute top-8 right-8 z-20 p-3 rounded-full bg-black/60 backdrop-blur-md border border-cyan-400/30 hover:bg-cyan-400/10 transition-all"
      >
        <Settings className="w-5 h-5 text-cyan-300" />
      </button>

      {showCustomization && (
        <div className="absolute top-20 right-8 z-20 w-64 bg-black/80 backdrop-blur-md border border-cyan-400/30 rounded-lg p-4 space-y-3 animate-fadeIn">
          <h3 className="text-cyan-300 font-semibold text-sm">Studio Settings</h3>
          <div>
            <label className="text-cyan-200 text-xs mb-1 block">Lighting</label>
            <div className="flex gap-2">
              {["warm", "cool", "purple", "cyan"].map((lighting) => (
                <button
                  key={lighting}
                  onClick={() => updateStudioPreference("lighting", lighting)}
                  className="flex-1 px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded text-cyan-300 text-xs transition-all"
                >
                  {lighting}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showTemplateSelector && (
        <TemplateSelector
          templates={getTemplatesByCategory(getTemplateCategoryForStudio(currentStudio))}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  )
}
