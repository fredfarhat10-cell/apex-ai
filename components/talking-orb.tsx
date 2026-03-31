"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { recognizeVoiceIntent } from "@/lib/voice-intent-recognizer"
import { lookupNextMeeting, lookupMeetingByTime, getCurrentLocation } from "@/lib/calendar-lookup"
import type { VoiceCommand, VoiceCommandExecution } from "@/lib/types/voice-command"
import { CauseEffectPanel } from "@/components/cause-effect-panel"

export function TalkingOrb() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [execution, setExecution] = useState<VoiceCommandExecution | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCauseEffect, setShowCauseEffect] = useState(false)
  const recognitionRef = useRef<any>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex
        const transcriptText = event.results[current][0].transcript
        setTranscript(transcriptText)

        // If final result, process the command
        if (event.results[current].isFinal) {
          processVoiceCommand(transcriptText)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("[v0] Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
      setTranscript("")
      setExecution(null)
    }
  }

  const processVoiceCommand = async (text: string) => {
    setIsProcessing(true)

    try {
      // Recognize intent
      const intent = recognizeVoiceIntent(text)

      if (intent.name === "book_ride" && intent.parameters.needsCalendarLookup) {
        let meetingEvent = null

        if (intent.parameters.destination === "CALENDAR_LOOKUP_NEXT_MEETING") {
          meetingEvent = await lookupNextMeeting()
        } else if (intent.parameters.destination?.startsWith("CALENDAR_LOOKUP_TIME_")) {
          const timeStr = intent.parameters.meetingTime
          meetingEvent = await lookupMeetingByTime(timeStr)
        }

        if (meetingEvent && meetingEvent.location) {
          // Replace calendar reference with actual location
          intent.parameters.destination = meetingEvent.location
          intent.parameters.meetingTitle = meetingEvent.title
          delete intent.parameters.needsCalendarLookup
        } else {
          // No meeting found, ask for clarification
          setExecution({
            taskId: `clarify_${Date.now()}`,
            status: "needs_clarification",
            progress: 0,
            clarificationQuestion: "I couldn't find a meeting with a location. Where would you like to go?",
          })
          setIsProcessing(false)
          return
        }
      }

      if (intent.name === "book_ride" && !intent.parameters.origin) {
        intent.parameters.origin = await getCurrentLocation()
      }

      // Create voice command
      const command: VoiceCommand = {
        id: `cmd_${Date.now()}`,
        text,
        intent: intent.name,
        parameters: intent.parameters,
        timestamp: Date.now(),
        userId: "current_user", // Replace with actual user ID
      }

      // Execute command
      const response = await fetch("/api/crewai/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      })

      const result = await response.json()

      if (result.success) {
        // Start polling for status
        startStatusPolling(result.taskId)
      } else {
        console.error("[v0] Command execution failed:", result.error)
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("[v0] Voice command processing error:", error)
      setIsProcessing(false)
    }
  }

  const startStatusPolling = (taskId: string) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/crewai/status?task_id=${taskId}`)
        const result = await response.json()

        if (result.success) {
          setExecution(result.execution)

          // Stop polling if completed or failed
          if (result.execution.status === "completed" || result.execution.status === "failed") {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current)
              pollIntervalRef.current = null
            }
            setIsProcessing(false)
          }
        }
      } catch (error) {
        console.error("[v0] Status polling error:", error)
      }
    }, 2000) // Poll every 2 seconds
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Card className="p-6 w-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <div className="flex flex-col items-center gap-4">
          {/* Orb Button */}
          <Button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`w-24 h-24 rounded-full transition-all duration-300 ${
              isListening
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 animate-pulse shadow-lg shadow-cyan-500/50"
                : "bg-gradient-to-br from-gray-700 to-gray-800 hover:from-cyan-600 hover:to-blue-700"
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            ) : isListening ? (
              <Mic className="w-8 h-8 text-white" />
            ) : (
              <MicOff className="w-8 h-8 text-white" />
            )}
          </Button>

          {/* Status Text */}
          <div className="text-center">
            {isListening && <p className="text-sm text-cyan-400 font-medium">Listening...</p>}
            {isProcessing && <p className="text-sm text-blue-400 font-medium">Processing...</p>}
            {!isListening && !isProcessing && <p className="text-sm text-gray-400">Tap to speak with Apex</p>}
          </div>

          {/* Button to toggle Cause & Effect panel */}
          <Button
            onClick={() => setShowCauseEffect(!showCauseEffect)}
            variant="outline"
            size="sm"
            className="w-full border-purple-500/20 hover:border-purple-500/40 text-purple-400"
          >
            {showCauseEffect ? "Hide" : "Show"} Cause & Effect
          </Button>

          {/* Transcript */}
          {transcript && (
            <div className="w-full p-3 bg-black/20 rounded-lg border border-cyan-500/20">
              <p className="text-sm text-gray-300">{transcript}</p>
            </div>
          )}

          {/* Execution Status */}
          {execution && (
            <div className="w-full space-y-2">
              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${execution.progress}%` }}
                />
              </div>

              {/* Current Step */}
              {execution.currentStep && <p className="text-xs text-cyan-400 text-center">{execution.currentStep}</p>}

              {/* Result */}
              {execution.status === "completed" && execution.result && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400">{execution.result}</p>
                </div>
              )}

              {/* Error */}
              {execution.status === "failed" && execution.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{execution.error}</p>
                </div>
              )}

              {/* Clarification */}
              {execution.status === "needs_clarification" && execution.clarificationQuestion && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-400">{execution.clarificationQuestion}</p>
                </div>
              )}
            </div>
          )}

          {/* Cause & Effect Panel */}
          {showCauseEffect && (
            <div className="w-full mt-4 animate-fadeIn">
              <CauseEffectPanel />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
