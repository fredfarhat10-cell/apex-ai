"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, Video, Activity, Brain, Heart, AlertTriangle } from "lucide-react"
import type { VoiceAnalysis, BiometricData, NeuroLinkTrigger, NeuroLinkSession } from "@/lib/types/neurolink"
import { NeuroLinkEngine } from "@/lib/neurolink-engine"

export function NeuroLinkMonitor() {
  const [session, setSession] = useState<NeuroLinkSession | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoActive, setIsVideoActive] = useState(false)
  const [latestVoice, setLatestVoice] = useState<VoiceAnalysis | null>(null)
  const [latestBiometric, setLatestBiometric] = useState<BiometricData | null>(null)
  const [triggers, setTriggers] = useState<NeuroLinkTrigger[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const videoStreamRef = useRef<MediaStream | null>(null)

  const startSession = () => {
    const newSession = NeuroLinkEngine.createSession()
    setSession(newSession)
    setTriggers([])
  }

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const audioChunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" })
        const analysis = await NeuroLinkEngine.analyzeVoice(audioBlob)
        setLatestVoice(analysis)

        if (session) {
          const updatedSession = NeuroLinkEngine.updateSession(session, analysis, latestBiometric || undefined)
          setSession(updatedSession)
          setTriggers(updatedSession.triggers)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop()
          setIsRecording(false)
          stream.getTracks().forEach((track) => track.stop())
        }
      }, 10000)
    } catch (error) {
      console.error("Error starting voice recording:", error)
    }
  }

  const startVideoMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoStreamRef.current = stream
      setIsVideoActive(true)

      // Simulate rPPG detection every 5 seconds
      const interval = setInterval(async () => {
        if (videoStreamRef.current) {
          const biometric = await NeuroLinkEngine.detectHeartRate(videoStreamRef.current)
          setLatestBiometric(biometric)

          if (session) {
            const updatedSession = NeuroLinkEngine.updateSession(session, latestVoice || undefined, biometric)
            setSession(updatedSession)
            setTriggers(updatedSession.triggers)
          }
        }
      }, 5000)

      return () => {
        clearInterval(interval)
        stream.getTracks().forEach((track) => track.stop())
      }
    } catch (error) {
      console.error("Error starting video monitoring:", error)
    }
  }

  const stopVideoMonitoring = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop())
      videoStreamRef.current = null
      setIsVideoActive(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">NeuroLink Light</h1>
          <p className="text-muted-foreground">Real-time voice and biometric monitoring</p>
        </div>
        {!session ? (
          <Button onClick={startSession}>
            <Brain className="w-4 h-4 mr-2" />
            Start Session
          </Button>
        ) : (
          <Badge variant="default" className="animate-pulse">
            <Activity className="w-3 h-3 mr-1" />
            Active Session
          </Badge>
        )}
      </div>

      {session && (
        <>
          {/* Controls */}
          <Card className="p-6">
            <div className="flex gap-4">
              <Button
                onClick={startVoiceRecording}
                disabled={isRecording}
                variant={isRecording ? "secondary" : "default"}
              >
                <Mic className="w-4 h-4 mr-2" />
                {isRecording ? "Recording..." : "Analyze Voice"}
              </Button>
              <Button
                onClick={isVideoActive ? stopVideoMonitoring : startVideoMonitoring}
                variant={isVideoActive ? "secondary" : "default"}
              >
                <Video className="w-4 h-4 mr-2" />
                {isVideoActive ? "Stop Video" : "Start rPPG"}
              </Button>
            </div>
          </Card>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Voice Analysis */}
            {latestVoice && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Analysis
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Emotions</div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(latestVoice.emotions).map(([emotion, value]) => (
                        <div key={emotion} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{emotion}</span>
                          <span className="font-medium">{Math.round(value)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Indicators</div>
                    <div className="space-y-2">
                      {Object.entries(latestVoice.indicators).map(([indicator, value]) => (
                        <div key={indicator}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="capitalize">{indicator.replace(/([A-Z])/g, " $1").trim()}</span>
                            <span className="font-medium">{Math.round(value)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all" style={{ width: `${value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Biometric Data */}
            {latestBiometric && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Biometric Data
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Heart Rate</div>
                      <div className="text-2xl font-bold">{Math.round(latestBiometric.heartRate)} BPM</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">HRV</div>
                      <div className="text-2xl font-bold">{Math.round(latestBiometric.hrv)} ms</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Stress Level</div>
                      <div className="text-2xl font-bold">{Math.round(latestBiometric.stressLevel)}%</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Recovery</div>
                      <div className="text-2xl font-bold">{Math.round(latestBiometric.recoveryScore)}%</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Triggers */}
          {triggers.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Active Triggers
              </h3>
              <div className="space-y-3">
                {triggers.map((trigger) => (
                  <div key={trigger.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">{trigger.title}</div>
                        <div className="text-sm text-muted-foreground">{trigger.description}</div>
                      </div>
                      <Badge className={getSeverityColor(trigger.severity)}>{trigger.severity}</Badge>
                    </div>
                    <div className="text-sm space-y-1 mb-3">
                      <div className="font-medium">Recommendations:</div>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {trigger.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      {trigger.autoActions.map((action, i) => (
                        <Button key={i} size="sm" variant="outline">
                          {action.action}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Session Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Session Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(session.summary.avgStress)}%</div>
                <div className="text-xs text-muted-foreground">Avg Stress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(session.summary.avgHeartRate)}</div>
                <div className="text-xs text-muted-foreground">Avg HR</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(session.summary.peakStress)}%</div>
                <div className="text-xs text-muted-foreground">Peak Stress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{session.voiceAnalyses.length}</div>
                <div className="text-xs text-muted-foreground">Voice Samples</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{session.triggers.length}</div>
                <div className="text-xs text-muted-foreground">Triggers</div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
