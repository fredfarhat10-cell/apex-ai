export interface BiometricData {
  date: string
  recovery?: number // 0-100
  hrv?: number // Heart Rate Variability in ms
  rhr?: number // Resting Heart Rate in bpm
  sleepDuration?: number // in hours
  sleepEfficiency?: number // 0-100
  strain?: number // 0-21 for Whoop
  bodyBattery?: number // 0-100 for Garmin
  steps?: number
  activeMinutes?: number
  calories?: number
}

export interface WearableDevice {
  id: string
  type: "whoop" | "garmin" | "apple" | "google"
  name: string
  connected: boolean
  lastSync?: Date
}

export interface MorningBriefing {
  date: string
  primaryScore: number
  scoreType: "recovery" | "bodyBattery"
  recommendation: string
  activityLevel: "rest" | "light" | "moderate" | "intense"
  insights: string[]
  warnings: string[]
}

export interface ExpertTip {
  id: string
  problemType: "low_hrv" | "poor_sleep" | "high_strain" | "low_recovery" | "high_rhr"
  context: string[]
  tip: string
  actionable: boolean
}

export interface CorrelationInsight {
  id: string
  type: "calendar" | "habit" | "activity"
  description: string
  biometricImpact: string
  confidence: number
  timestamp: Date
}
