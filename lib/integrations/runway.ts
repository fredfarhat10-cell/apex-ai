import type { GenerativeContentType, GenerativeContent } from "../types/generative"

export class RunwayAPI {
  private apiKey: string
  private baseUrl = "https://api.runwayml.com/v1"

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.RUNWAY_API_KEY || ""
  }

  /**
   * Generate content using Runway API
   */
  async generateContent(type: GenerativeContentType, prompt: string, options: any = {}): Promise<GenerativeContent> {
    try {
      let endpoint = ""
      let requestBody: any = { prompt }

      switch (type) {
        case "video":
          endpoint = "/generate/video"
          requestBody = {
            ...requestBody,
            duration: options.duration || 5,
            resolution: options.resolution || "1280x720",
          }
          break

        case "audio":
          endpoint = "/generate/audio"
          requestBody = {
            ...requestBody,
            duration: options.duration || 30,
            style: options.style || "ambient",
          }
          break

        case "image":
          endpoint = "/generate/image"
          requestBody = {
            ...requestBody,
            width: options.width || 1024,
            height: options.height || 1024,
          }
          break
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`Runway API error: ${response.statusText}`)
      }

      const data = await response.json()

      // Poll for completion
      const result = await this.pollForCompletion(data.id)

      return {
        id: result.id,
        type,
        url: result.output_url,
        thumbnail: result.thumbnail_url,
        metadata: result.metadata,
      }
    } catch (error) {
      console.error("Runway generation error:", error)
      throw error
    }
  }

  /**
   * Poll for generation completion
   */
  private async pollForCompletion(taskId: string, maxAttempts = 60): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      const data = await response.json()

      if (data.status === "completed") {
        return data
      } else if (data.status === "failed") {
        throw new Error("Generation failed")
      }

      // Wait 2 seconds before next poll
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    throw new Error("Generation timeout")
  }

  /**
   * Generate backing track for music practice
   */
  async generateBackingTrack(key: string, bpm: number, style: string): Promise<GenerativeContent> {
    const prompt = `Create a ${style} backing track in the key of ${key} at ${bpm} BPM. Include chord progressions and rhythm section suitable for practice.`

    return this.generateContent("audio", prompt, {
      duration: 120, // 2 minutes
      style: "musical",
    })
  }

  /**
   * Generate technique demonstration video
   */
  async generateTechniqueVideo(sport: string, technique: string): Promise<GenerativeContent> {
    const prompt = `Create a slow-motion demonstration video of the ${technique} technique in ${sport}. Show proper form and key movement points.`

    return this.generateContent("video", prompt, {
      duration: 10,
      resolution: "1280x720",
    })
  }

  /**
   * Generate calming visual
   */
  async generateCalmingVisual(theme: string): Promise<GenerativeContent> {
    const prompt = `Create a calming, meditative visual with ${theme}. Soft colors, gentle movement, peaceful atmosphere.`

    return this.generateContent("video", prompt, {
      duration: 60,
      resolution: "1920x1080",
    })
  }
}
