import type { PinterestPin } from "./types/aesthetic"

export class PinterestAPI {
  private apiKey: string
  private baseUrl = "https://api.pinterest.com/v5"

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PINTEREST_API_KEY || ""
  }

  /**
   * Search for pins based on query
   */
  async searchPins(query: string, limit = 10): Promise<PinterestPin[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search/pins?query=${encodeURIComponent(query)}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Pinterest API error: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform Pinterest API response to our format
      return data.items.map((pin: any) => ({
        id: pin.id,
        imageUrl: pin.media?.images?.["600x"]?.url || pin.media?.images?.original?.url,
        title: pin.title || "",
        description: pin.description || "",
        link: pin.link || "",
        saves: pin.save_count || 0,
        repins: pin.repin_count || 0,
        engagementScore: this.calculateEngagementScore(pin),
      }))
    } catch (error) {
      console.error("Pinterest search error:", error)
      return []
    }
  }

  /**
   * Calculate engagement score for a pin
   */
  private calculateEngagementScore(pin: any): number {
    const saves = pin.save_count || 0
    const repins = pin.repin_count || 0

    // Weight saves more heavily than repins
    return saves * 2 + repins
  }

  /**
   * Get pin details by ID
   */
  async getPin(pinId: string): Promise<PinterestPin | null> {
    try {
      const response = await fetch(`${this.baseUrl}/pins/${pinId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Pinterest API error: ${response.statusText}`)
      }

      const pin = await response.json()

      return {
        id: pin.id,
        imageUrl: pin.media?.images?.["600x"]?.url || pin.media?.images?.original?.url,
        title: pin.title || "",
        description: pin.description || "",
        link: pin.link || "",
        saves: pin.save_count || 0,
        repins: pin.repin_count || 0,
        engagementScore: this.calculateEngagementScore(pin),
      }
    } catch (error) {
      console.error("Pinterest get pin error:", error)
      return null
    }
  }
}
