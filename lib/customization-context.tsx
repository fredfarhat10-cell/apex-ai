"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useVault } from "./vault-context"

interface CustomizationSettings {
  globalLighting: "warm" | "cool" | "neutral"
  particleIntensity: "low" | "medium" | "high"
  soundEnabled: boolean
  gesturesEnabled: boolean
  voiceEnabled: boolean
}

interface CustomizationContextType {
  settings: CustomizationSettings
  updateSettings: (settings: Partial<CustomizationSettings>) => void
  isListening: boolean
  startVoiceCommand: () => void
  stopVoiceCommand: () => void
  executeVoiceCommand: (command: string) => void
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined)

export function CustomizationProvider({ children }: { children: React.ReactNode }) {
  const { userProfile, updateUserProfile } = useVault()
  const [settings, setSettings] = useState<CustomizationSettings>({
    globalLighting: "neutral",
    particleIntensity: "medium",
    soundEnabled: true,
    gesturesEnabled: true,
    voiceEnabled: true,
  })
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        executeVoiceCommand(transcript)
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

  // Load settings from user profile
  useEffect(() => {
    if (userProfile?.studioPreferences) {
      setSettings((prev) => ({
        ...prev,
        globalLighting: userProfile.studioPreferences.lighting || "neutral",
        particleIntensity: userProfile.studioPreferences.particleIntensity || "medium",
      }))
    }
  }, [userProfile])

  const updateSettings = (newSettings: Partial<CustomizationSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }

      // Save to user profile
      if (userProfile) {
        updateUserProfile({
          ...userProfile,
          studioPreferences: {
            ...userProfile.studioPreferences,
            lighting: updated.globalLighting,
            particleIntensity: updated.particleIntensity,
          },
        })
      }

      return updated
    })
  }

  const startVoiceCommand = () => {
    if (recognitionRef.current && !isListening && settings.voiceEnabled) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopVoiceCommand = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const executeVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()

    // Lighting commands
    if (lowerCommand.includes("make it warmer") || lowerCommand.includes("warmer lighting")) {
      updateSettings({ globalLighting: "warm" })
    } else if (lowerCommand.includes("make it cooler") || lowerCommand.includes("cooler lighting")) {
      updateSettings({ globalLighting: "cool" })
    } else if (lowerCommand.includes("neutral lighting") || lowerCommand.includes("reset lighting")) {
      updateSettings({ globalLighting: "neutral" })
    }

    // Particle commands
    if (lowerCommand.includes("more particles") || lowerCommand.includes("increase particles")) {
      updateSettings({ particleIntensity: "high" })
    } else if (lowerCommand.includes("less particles") || lowerCommand.includes("decrease particles")) {
      updateSettings({ particleIntensity: "low" })
    }

    // Sound commands
    if (lowerCommand.includes("enable sound") || lowerCommand.includes("turn on sound")) {
      updateSettings({ soundEnabled: true })
    } else if (lowerCommand.includes("disable sound") || lowerCommand.includes("turn off sound")) {
      updateSettings({ soundEnabled: false })
    }

    console.log("[v0] Voice command executed:", command)
  }

  return (
    <CustomizationContext.Provider
      value={{
        settings,
        updateSettings,
        isListening,
        startVoiceCommand,
        stopVoiceCommand,
        executeVoiceCommand,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  )
}

export function useCustomization() {
  const context = useContext(CustomizationContext)
  if (!context) {
    throw new Error("useCustomization must be used within CustomizationProvider")
  }
  return context
}
