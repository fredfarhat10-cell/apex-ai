export interface VoiceAnalysis {
  timestamp: Date
  duration: number
  features: {
    pitch: number // Hz
    energy: number // 0-100
    tempo: number // words per minute
    pauseFrequency: number // pauses per minute
  }
  emotions: {
    stress: number // 0-100
    confidence: number // 0-100
    excitement: number // 0-100
    fatigue: number // 0-100
  }
  indicators: {
    cognitiveLoad: number // 0-100
    emotionalStability: number // 0-100
    burnoutRisk: number // 0-100
  }
}

export interface BiometricData {
  timestamp: Date
  heartRate: number // BPM
  hrv: number // ms
  respiratoryRate: number // breaths per minute
  stressLevel: number // 0-100
  recoveryScore: number // 0-100
}

export interface NeuroLinkTrigger {
  id: string
  type: "stress" | "burnout" | "opportunity" | "alert"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  detectedAt: Date
  metrics: {
    heartRate?: number
    stressLevel?: number
    voiceStress?: number
    cognitiveLoad?: number
  }
  recommendations: string[]
  autoActions: {
    action: string
    executed: boolean
    executedAt?: Date
  }[]
}

export interface NeuroLinkSession {
  id: string
  startTime: Date
  endTime?: Date
  voiceAnalyses: VoiceAnalysis[]
  biometricData: BiometricData[]
  triggers: NeuroLinkTrigger[]
  summary: {
    avgStress: number
    avgHeartRate: number
    peakStress: number
    recoveryTime: number
    totalTriggers: number
  }
}
