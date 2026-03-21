import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { BiometricData, MorningBriefing, ExpertTip, CorrelationInsight, WearableDevice } from "./types/wellness"
import { WhoopAPI } from "./integrations/whoop"
import { GarminEnhancedAPI } from "./integrations/garmin-enhanced"

interface WellnessDB extends DBSchema {
  biometricData: {
    key: string
    value: BiometricData & { userId: string }
    indexes: { "by-date": string; "by-user": string }
  }
  morningBriefings: {
    key: string
    value: MorningBriefing & { userId: string }
  }
  expertTips: {
    key: string
    value: ExpertTip
    indexes: { "by-problem": string }
  }
  correlationInsights: {
    key: string
    value: CorrelationInsight & { userId: string }
  }
  wearableDevices: {
    key: string
    value: WearableDevice & { userId: string }
  }
}

export class WellnessOracle {
  private db: IDBPDatabase<WellnessDB> | null = null

  async init() {
    this.db = await openDB<WellnessDB>("apex-wellness-db", 1, {
      upgrade(db) {
        // Biometric data store
        if (!db.objectStoreNames.contains("biometricData")) {
          const store = db.createObjectStore("biometricData", { keyPath: "key" })
          store.createIndex("by-date", "date")
          store.createIndex("by-user", "userId")
        }

        // Morning briefings store
        if (!db.objectStoreNames.contains("morningBriefings")) {
          db.createObjectStore("morningBriefings", { keyPath: "key" })
        }

        // Expert tips store
        if (!db.objectStoreNames.contains("expertTips")) {
          const store = db.createObjectStore("expertTips", { keyPath: "id" })
          store.createIndex("by-problem", "problemType")
        }

        // Correlation insights store
        if (!db.objectStoreNames.contains("correlationInsights")) {
          db.createObjectStore("correlationInsights", { keyPath: "id" })
        }

        // Wearable devices store
        if (!db.objectStoreNames.contains("wearableDevices")) {
          db.createObjectStore("wearableDevices", { keyPath: "id" })
        }
      },
    })

    // Initialize expert tips
    await this.initializeExpertTips()
  }

  /**
   * Fetch and store biometric data from wearable
   */
  async syncWearableData(userId: string, deviceType: "whoop" | "garmin", accessToken: string) {
    const endDate = new Date().toISOString().split("T")[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    let data: BiometricData[] = []

    if (deviceType === "whoop") {
      const whoop = new WhoopAPI(accessToken)
      const [recovery, strain, sleep] = await Promise.all([
        whoop.getRecovery(startDate, endDate),
        whoop.getStrain(startDate, endDate),
        whoop.getSleep(startDate, endDate),
      ])

      // Merge data by date
      data = this.mergeBiometricData([recovery, strain, sleep])
    } else if (deviceType === "garmin") {
      const garmin = new GarminEnhancedAPI(accessToken)
      const [daily, hrv, sleep] = await Promise.all([
        garmin.getDailySummary(startDate, endDate),
        garmin.getHRV(startDate, endDate),
        garmin.getSleep(startDate, endDate),
      ])

      // Merge data by date
      data = this.mergeBiometricData([daily, hrv, sleep])
    }

    // Store in database
    for (const entry of data) {
      await this.storeBiometricData(userId, entry)
    }

    return data
  }

  /**
   * Generate morning briefing
   */
  async generateMorningBriefing(userId: string): Promise<MorningBriefing> {
    // Get today's and recent biometric data
    const today = new Date().toISOString().split("T")[0]
    const todayData = await this.getBiometricData(userId, today)
    const recentData = await this.getRecentBiometricData(userId, 7)

    if (!todayData) {
      throw new Error("No biometric data available for today")
    }

    // Determine primary score and type
    const primaryScore = todayData.recovery || todayData.bodyBattery || 50
    const scoreType = todayData.recovery !== undefined ? "recovery" : "bodyBattery"

    // Calculate baseline from recent data
    const baseline = this.calculateBaseline(recentData, scoreType)

    // Generate recommendation
    const activityLevel = this.determineActivityLevel(primaryScore, baseline)
    const recommendation = this.generateRecommendation(primaryScore, scoreType, activityLevel, todayData)

    // Generate insights
    const insights = await this.generateInsights(userId, todayData, recentData)

    // Check for warnings
    const warnings = this.checkForWarnings(todayData, recentData)

    const briefing: MorningBriefing = {
      date: today,
      primaryScore,
      scoreType,
      recommendation,
      activityLevel,
      insights,
      warnings,
    }

    // Store briefing
    await this.storeMorningBriefing(userId, briefing)

    return briefing
  }

  /**
   * Generate correlation insights
   */
  async generateCorrelationInsights(userId: string, calendarEvents: any[]): Promise<CorrelationInsight[]> {
    const insights: CorrelationInsight[] = []
    const recentData = await this.getRecentBiometricData(userId, 14)

    // Correlate heart rate with calendar events
    for (const event of calendarEvents) {
      const eventDate = new Date(event.start).toISOString().split("T")[0]
      const eventHour = new Date(event.start).getHours()
      const dayData = recentData.find((d) => d.date === eventDate)

      if (dayData && dayData.rhr) {
        // Check if RHR was elevated during event time
        if (dayData.rhr > this.calculateBaseline(recentData, "rhr") + 10) {
          insights.push({
            id: `${userId}-${eventDate}-${event.id}`,
            type: "calendar",
            description: `Elevated heart rate during "${event.title}"`,
            biometricImpact: `Your resting heart rate was ${dayData.rhr} bpm, which is higher than your baseline. This event may have been stressful.`,
            confidence: 0.7,
            timestamp: new Date(),
          })
        }
      }
    }

    // Correlate sleep with next-day performance
    for (let i = 0; i < recentData.length - 1; i++) {
      const today = recentData[i]
      const tomorrow = recentData[i + 1]

      if (today.sleepEfficiency && today.sleepEfficiency < 70 && tomorrow.recovery) {
        insights.push({
          id: `${userId}-${today.date}-sleep-recovery`,
          type: "habit",
          description: "Poor sleep impacted next-day recovery",
          biometricImpact: `Your sleep efficiency of ${today.sleepEfficiency.toFixed(0)}% on ${today.date} resulted in a recovery score of ${tomorrow.recovery} the next day.`,
          confidence: 0.8,
          timestamp: new Date(),
        })
      }
    }

    // Store insights
    for (const insight of insights) {
      await this.storeCorrelationInsight(userId, insight)
    }

    return insights
  }

  /**
   * Get expert tip for a problem
   */
  async getExpertTip(problemType: ExpertTip["problemType"], context: string[]): Promise<ExpertTip | null> {
    if (!this.db) await this.init()

    const tips = await this.db!.getAllFromIndex("expertTips", "by-problem", problemType)

    if (tips.length === 0) return null

    // Find best matching tip based on context
    const matchingTip = tips.find((tip) => tip.context.some((c) => context.includes(c))) || tips[0]

    return matchingTip
  }

  // Helper methods

  private mergeBiometricData(datasets: BiometricData[][]): BiometricData[] {
    const merged = new Map<string, BiometricData>()

    for (const dataset of datasets) {
      for (const entry of dataset) {
        const existing = merged.get(entry.date) || { date: entry.date }
        merged.set(entry.date, { ...existing, ...entry })
      }
    }

    return Array.from(merged.values()).sort((a, b) => a.date.localeCompare(b.date))
  }

  private calculateBaseline(data: BiometricData[], metric: string): number {
    const values = data.map((d) => (d as any)[metric]).filter((v) => v !== undefined)
    if (values.length === 0) return 0
    return values.reduce((sum, v) => sum + v, 0) / values.length
  }

  private determineActivityLevel(score: number, baseline: number): MorningBriefing["activityLevel"] {
    const diff = score - baseline

    if (score < 33 || diff < -20) return "rest"
    if (score < 66 || diff < -10) return "light"
    if (score < 80) return "moderate"
    return "intense"
  }

  private generateRecommendation(
    score: number,
    scoreType: string,
    activityLevel: MorningBriefing["activityLevel"],
    data: BiometricData,
  ): string {
    const scoreName = scoreType === "recovery" ? "Recovery" : "Body Battery"

    if (activityLevel === "rest") {
      return `Your ${scoreName} is at ${score}%, which is quite low. Today is a great day for rest and recovery. Consider light stretching or a gentle walk instead of intense exercise.`
    } else if (activityLevel === "light") {
      return `Your ${scoreName} is at ${score}%. You're moderately recovered. Light to moderate activity is recommended. Listen to your body and don't push too hard.`
    } else if (activityLevel === "moderate") {
      return `Your ${scoreName} is at ${score}%. You're well-recovered and ready for a solid workout. This is a good day for moderate to high-intensity training.`
    } else {
      return `Your ${scoreName} is at ${score}%! You're fully recovered and primed for peak performance. This is an excellent day to push your limits.`
    }
  }

  private async generateInsights(
    userId: string,
    todayData: BiometricData,
    recentData: BiometricData[],
  ): Promise<string[]> {
    const insights: string[] = []

    // HRV insight
    if (todayData.hrv) {
      const avgHRV = this.calculateBaseline(recentData, "hrv")
      const diff = todayData.hrv - avgHRV
      if (Math.abs(diff) > 10) {
        insights.push(
          `Your HRV is ${diff > 0 ? "higher" : "lower"} than usual (${todayData.hrv.toFixed(0)}ms vs ${avgHRV.toFixed(0)}ms average). ${diff > 0 ? "Great sign of recovery!" : "Your body may need more rest."}`,
        )
      }
    }

    // Sleep insight
    if (todayData.sleepDuration) {
      if (todayData.sleepDuration < 7) {
        insights.push(
          `You only got ${todayData.sleepDuration.toFixed(1)} hours of sleep. Try to get at least 7-8 hours tonight for optimal recovery.`,
        )
      } else if (todayData.sleepDuration > 9) {
        insights.push(
          `You got ${todayData.sleepDuration.toFixed(1)} hours of sleep. While rest is important, oversleeping can sometimes indicate overtraining or stress.`,
        )
      }
    }

    // Sleep efficiency insight
    if (todayData.sleepEfficiency && todayData.sleepEfficiency < 70) {
      const tip = await this.getExpertTip("poor_sleep", ["efficiency"])
      if (tip) {
        insights.push(tip.tip)
      }
    }

    return insights
  }

  private checkForWarnings(todayData: BiometricData, recentData: BiometricData[]): string[] {
    const warnings: string[] = []

    // Check for 1% recovery (Whoop milestone)
    if (todayData.recovery !== undefined && todayData.recovery <= 1) {
      warnings.push(
        "⚠️ 1% Recovery Alert: Your body is in serious need of rest. This is a clear signal to take the day off from training. Focus on sleep, hydration, and stress management.",
      )
    }

    // Check for consistently low recovery
    const recentRecoveries = recentData
      .slice(-3)
      .map((d) => d.recovery || d.bodyBattery)
      .filter((r) => r !== undefined)

    if (recentRecoveries.length >= 3 && recentRecoveries.every((r) => r! < 40)) {
      warnings.push(
        "⚠️ Overtraining Warning: Your recovery has been consistently low for 3+ days. You may be overtraining. Consider taking a rest day or reducing training intensity.",
      )
    }

    // Check for elevated RHR
    if (todayData.rhr) {
      const avgRHR = this.calculateBaseline(recentData, "rhr")
      if (todayData.rhr > avgRHR + 10) {
        warnings.push(
          `⚠️ Elevated Resting Heart Rate: Your RHR is ${todayData.rhr} bpm, which is ${(todayData.rhr - avgRHR).toFixed(0)} bpm higher than your baseline. This could indicate stress, illness, or insufficient recovery.`,
        )
      }
    }

    return warnings
  }

  private async initializeExpertTips() {
    if (!this.db) return

    const tips: ExpertTip[] = [
      {
        id: "low-hrv-1",
        problemType: "low_hrv",
        context: ["stress", "overtraining"],
        tip: "Low HRV often indicates stress or overtraining. Try meditation, deep breathing exercises, or a gentle yoga session to help your nervous system recover.",
        actionable: true,
      },
      {
        id: "poor-sleep-1",
        problemType: "poor_sleep",
        context: ["efficiency"],
        tip: "Your sleep efficiency is low. Try establishing a consistent bedtime routine: dim lights 1 hour before bed, avoid screens, and keep your room cool (65-68°F).",
        actionable: true,
      },
      {
        id: "poor-sleep-2",
        problemType: "poor_sleep",
        context: ["duration"],
        tip: "You're not getting enough sleep. Aim for 7-9 hours per night. Try going to bed 30 minutes earlier tonight and see how you feel tomorrow.",
        actionable: true,
      },
      {
        id: "high-strain-1",
        problemType: "high_strain",
        context: ["recovery"],
        tip: "High strain with low recovery is a recipe for burnout. Consider an active recovery day: light swimming, walking, or stretching instead of intense training.",
        actionable: true,
      },
      {
        id: "low-recovery-1",
        problemType: "low_recovery",
        context: ["sleep"],
        tip: "Low recovery is often linked to poor sleep. Focus on sleep quality tonight: avoid caffeine after 2 PM, limit alcohol, and create a dark, quiet sleep environment.",
        actionable: true,
      },
      {
        id: "high-rhr-1",
        problemType: "high_rhr",
        context: ["illness", "stress"],
        tip: "Elevated resting heart rate can indicate illness or stress. Listen to your body. If you feel unwell, take a rest day. If it's stress, try a 10-minute meditation or breathing exercise.",
        actionable: true,
      },
    ]

    for (const tip of tips) {
      try {
        await this.db.put("expertTips", tip)
      } catch (error) {
        // Tip already exists, skip
      }
    }
  }

  private async storeBiometricData(userId: string, data: BiometricData) {
    if (!this.db) await this.init()
    await this.db!.put("biometricData", {
      ...data,
      userId,
      key: `${userId}-${data.date}`,
    })
  }

  private async getBiometricData(userId: string, date: string): Promise<BiometricData | null> {
    if (!this.db) await this.init()
    const data = await this.db!.get("biometricData", `${userId}-${date}`)
    return data || null
  }

  private async getRecentBiometricData(userId: string, days: number): Promise<BiometricData[]> {
    if (!this.db) await this.init()
    const allData = await this.db!.getAllFromIndex("biometricData", "by-user", userId)

    // Sort by date and get last N days
    return allData
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, days)
      .reverse()
  }

  private async storeMorningBriefing(userId: string, briefing: MorningBriefing) {
    if (!this.db) await this.init()
    await this.db!.put("morningBriefings", {
      ...briefing,
      userId,
      key: `${userId}-${briefing.date}`,
    })
  }

  private async storeCorrelationInsight(userId: string, insight: CorrelationInsight) {
    if (!this.db) await this.init()
    await this.db!.put("correlationInsights", {
      ...insight,
      userId,
    })
  }
}
