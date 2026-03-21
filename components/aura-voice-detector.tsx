"use client"

import { useState, useEffect, useRef } from "react"
import { useVault } from "@/lib/vault-context"
import { Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuraVoiceDetector() {
  const { updateState } = useVault()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex
        const transcriptText = event.results[current][0].transcript.toLowerCase()
        setTranscript(transcriptText)

        if (transcriptText.includes("focused") || transcriptText.includes("focus")) {
          updateState("aura", "Focused")
          setIsListening(false)
          recognitionRef.current?.stop()
        } else if (transcriptText.includes("creative") || transcriptText.includes("create")) {
          updateState("aura", "Creative")
          setIsListening(false)
          recognitionRef.current?.stop()
        } else if (transcriptText.includes("stressed") || transcriptText.includes("stress")) {
          updateState("aura", "Stressed")
          setIsListening(false)
          recognitionRef.current?.stop()
        } else if (transcriptText.includes("energized") || transcriptText.includes("energy")) {
          updateState("aura", "Energized")
          setIsListening(false)
          recognitionRef.current?.stop()
        } else if (transcriptText.includes("tired") || transcriptText.includes("exhausted")) {
          updateState("aura", "Tired")
          setIsListening(false)
          recognitionRef.current?.stop()
        } else if (transcriptText.includes("neutral") || transcriptText.includes("normal")) {
          updateState("aura", "Neutral")
          setIsListening(false)
          recognitionRef.current?.stop()
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [updateState])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
      setTranscript("")
    }
  }

  if (!recognitionRef.current) {
    return null // Voice detection not supported
  }

  return (
    <div className="bg-apex-dark border border-gray-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Voice Aura Detection</h4>
        <Button onClick={toggleListening} size="sm" variant={isListening ? "destructive" : "default"} className="gap-2">
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isListening ? "Stop" : "Start"}
        </Button>
      </div>
      {isListening && (
        <div className="space-y-2">
          <p className="text-xs text-apex-gray">
            Say: "I'm feeling focused", "I'm creative", "I'm stressed", "I'm energized", "I'm tired", or "I'm neutral"
          </p>
          {transcript && <p className="text-sm text-apex-accent">Heard: "{transcript}"</p>}
        </div>
      )}
    </div>
  )
}
