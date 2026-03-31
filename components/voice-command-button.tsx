"use client"

import { MicIcon } from "./icons"
import { useCustomization } from "@/lib/customization-context"

export function VoiceCommandButton() {
  const { isListening, startVoiceCommand, settings } = useCustomization()

  if (!settings.voiceEnabled) return null

  return (
    <button
      onClick={startVoiceCommand}
      disabled={isListening}
      className={`fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
        isListening
          ? "bg-apex-primary animate-pulse scale-110 shadow-[0_0_30px_rgba(34,211,238,0.8)]"
          : "bg-apex-primary/80 hover:bg-apex-primary hover:scale-110 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
      }`}
      title="Voice Command (Say: 'Make it warmer', 'Switch to music studio', etc.)"
    >
      <MicIcon className={`w-8 h-8 ${isListening ? "text-white animate-pulse" : "text-black"}`} />

      {isListening && <div className="absolute inset-0 rounded-full border-4 border-apex-primary animate-ping" />}
    </button>
  )
}
