import type { BiometricData } from "../types/wellness"

export class WhoopAPI {
  private accessToken: string
  private baseUrl = "https://api.whoop.com/v1"

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  /**
   * Get user's recovery data
   */
  async getRecovery(startDate: string, endDate: string): Promise<BiometricData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recovery?start=${startDate}&end=${endDate}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Whoop API error: ${response.statusText}`)
      }

      const data = await response.json()

      return data.records.map((record: any) => ({
        date: record.created_at.split("T")[0],
        recovery: record.score.recovery_score,
        hrv: record.score.hrv_rmssd_milli,
        rhr: record.score.resting_heart_rate,
        sleepDuration: record.sleep.total_in_bed_time_milli / (1000 * 60 * 60),
        sleepEfficiency: (record.sleep.sleep_performance_percentage || 0) * 100,
      }))
    } catch (error) {
      console.error("Whoop recovery fetch error:", error)
      return []
    }
  }

  /**
   * Get user's strain data
   */
  async getStrain(startDate: string, endDate: string): Promise<BiometricData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/activity/strain?start=${startDate}&end=${endDate}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Whoop API error: ${response.statusText}`)
      }

      const data = await response.json()

      return data.records.map((record: any) => ({
        date: record.created_at.split("T")[0],
        strain: record.score.strain,
      }))
    } catch (error) {
      console.error("Whoop strain fetch error:", error)
      return []
    }
  }

  /**
   * Get user's sleep data
   */
  async getSleep(startDate: string, endDate: string): Promise<BiometricData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/activity/sleep?start=${startDate}&end=${endDate}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Whoop API error: ${response.statusText}`)
      }

      const data = await response.json()

      return data.records.map((record: any) => ({
        date: record.created_at.split("T")[0],
        sleepDuration: record.score.total_in_bed_time_milli / (1000 * 60 * 60),
        sleepEfficiency: (record.score.sleep_performance_percentage || 0) * 100,
      }))
    } catch (error) {
      console.error("Whoop sleep fetch error:", error)
      return []
    }
  }
}
