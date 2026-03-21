import { getTokens } from "../token-storage"
import { updateSyncTime } from "../integration-manager"

export interface StravaActivity {
  id: number
  name: string
  type: string
  distance: number
  movingTime: number
  elapsedTime: number
  totalElevationGain: number
  startDate: string
  averageSpeed: number
  maxSpeed: number
  averageHeartrate?: number
  maxHeartrate?: number
  calories?: number
}

export interface StravaAthlete {
  id: number
  username: string
  firstname: string
  lastname: string
  city: string
  state: string
  country: string
  profile: string
}

/**
 * Fetch Strava activities
 */
export async function fetchStravaActivities(integrationId: string, page = 1, perPage = 30): Promise<StravaActivity[]> {
  const tokens = await getTokens(integrationId)
  if (!tokens) throw new Error("No tokens found for integration")

  try {
    const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Strava API error: ${response.statusText}`)
    }

    const activities = await response.json()

    await updateSyncTime(integrationId)
    return activities
  } catch (error) {
    console.error("[v0] Failed to fetch Strava activities:", error)
    throw error
  }
}

/**
 * Get Strava athlete profile
 */
export async function getStravaAthlete(integrationId: string): Promise<StravaAthlete> {
  const tokens = await getTokens(integrationId)
  if (!tokens) throw new Error("No tokens found for integration")

  try {
    const response = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Strava API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Failed to fetch Strava athlete:", error)
    throw error
  }
}

/**
 * Get Strava activity stats
 */
export async function getStravaStats(integrationId: string): Promise<{
  totalActivities: number
  totalDistance: number
  totalMovingTime: number
  totalElevationGain: number
}> {
  const activities = await fetchStravaActivities(integrationId, 1, 100)

  return {
    totalActivities: activities.length,
    totalDistance: activities.reduce((sum, a) => sum + a.distance, 0),
    totalMovingTime: activities.reduce((sum, a) => sum + a.movingTime, 0),
    totalElevationGain: activities.reduce((sum, a) => sum + a.totalElevationGain, 0),
  }
}
