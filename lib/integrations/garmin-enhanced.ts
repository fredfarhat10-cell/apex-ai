import type { BiometricData } from "../types/wellness"

export class GarminEnhancedAPI {
  private accessToken: string
  private baseUrl = "https://apis.garmin.com"

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  /**
   * Get user's daily summary including Body Battery
   */
  async getDailySummary(startDate: string, endDate: string): Promise<BiometricData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/wellness-api/rest/dailies?uploadStartTimeInSeconds=${this.dateToSeconds(startDate)}&uploadEndTimeInSeconds=${this.dateToSeconds(endDate)}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Garmin API error: ${response.statusText}`)
      }

      const data = await response.json()

      return data.map((day: any) => ({
        date: day.calendarDate,
        bodyBattery: day.maxAvgBodyBattery,
        rhr: day.restingHeartRate,
        steps: day.totalSteps,
        activeMinutes: day.activeTimeInSeconds / 60,
        calories: day.activeKilocalories,
        sleepDuration: day.sleepingSeconds / 3600,
      }))
    } catch (error) {
      console.error("Garmin daily summary fetch error:", error)
      return []
    }
  }

  /**
   * Get user's HRV data
   */
  async getHRV(startDate: string, endDate: string): Promise<BiometricData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/wellness-api/rest/hrv?uploadStartTimeInSeconds=${this.dateToSeconds(startDate)}&uploadEndTimeInSeconds=${this.dateToSeconds(endDate)}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Garmin API error: ${response.statusText}`)
      }

      const data = await response.json()

      return data.hrvSummaries.map((summary: any) => ({
        date: summary.calendarDate,
        hrv: summary.lastNightAvg,
      }))
    } catch (error) {
      console.error("Garmin HRV fetch error:", error)
      return []
    }
  }

  /**
   * Get user's sleep data
   */
  async getSleep(startDate: string, endDate: string): Promise<BiometricData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/wellness-api/rest/sleeps?uploadStartTimeInSeconds=${this.dateToSeconds(startDate)}&uploadEndTimeInSeconds=${this.dateToSeconds(endDate)}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Garmin API error: ${response.statusText}`)
      }

      const data = await response.json()

      return data.map((sleep: any) => ({
        date: sleep.calendarDate,
        sleepDuration: sleep.sleepTimeSeconds / 3600,
        sleepEfficiency: (sleep.sleepTimeSeconds / sleep.sleepWindowConfirmedSeconds) * 100,
      }))
    } catch (error) {
      console.error("Garmin sleep fetch error:", error)
      return []
    }
  }

  private dateToSeconds(dateString: string): number {
    return Math.floor(new Date(dateString).getTime() / 1000)
  }
}
