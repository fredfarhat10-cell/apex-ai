"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Square, Loader2 } from "lucide-react"
import { transcribeAudio, isVoiceSupported } from "@/lib/multimodal/voice-input"

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
}

export function VoiceRecorder({ onTranscription }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    if (!isVoiceSupported()) {
      alert("Voice recording is not supported in your browser")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())

        // Transcribe
        setIsTranscribing(true)
        try {
          const result = await transcribeAudio(blob)
          onTranscription(result.text)
        } catch (error) {
          console.error("[v0] Transcription failed:", error)
          alert("Failed to transcribe audio")
        } finally {
          setIsTranscribing(false)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("[v0] Failed to start recording:", error)
      alert("Failed to access microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          {isRecording && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording...</span>
              </div>
              <p className="text-2xl font-mono">{formatDuration(duration)}</p>
            </div>
          )}

          {isTranscribing && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Transcribing...</span>
            </div>
          )}

          <div className="flex gap-2">
            {!isRecording ? (
              <Button onClick={startRecording} disabled={isTranscribing} size="lg">
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" size="lg">
                <Square className="h-5 w-5 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
