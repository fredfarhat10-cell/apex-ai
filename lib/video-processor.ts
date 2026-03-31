/**
 * Video frame extraction and processing utilities
 * Uses HTML5 Canvas API for client-side frame extraction
 */

export interface VideoFrame {
  timestamp: number
  dataUrl: string
  base64: string
}

export interface VideoMetadata {
  duration: number
  width: number
  height: number
  frameCount: number
}

/**
 * Extracts frames from a video file at specified intervals
 */
export async function extractFrames(
  videoFile: File,
  options: {
    maxFrames?: number
    interval?: number // seconds between frames
    quality?: number // 0-1
  } = {},
): Promise<{ frames: VideoFrame[]; metadata: VideoMetadata }> {
  const { maxFrames = 10, interval = 1, quality = 0.8 } = options

  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Canvas context not available"))
      return
    }

    video.preload = "metadata"
    video.muted = true

    const frames: VideoFrame[] = []
    let currentTime = 0

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const metadata: VideoMetadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        frameCount: Math.min(maxFrames, Math.floor(video.duration / interval)),
      }

      const captureFrame = () => {
        if (currentTime >= video.duration || frames.length >= maxFrames) {
          resolve({ frames, metadata })
          URL.revokeObjectURL(video.src)
          return
        }

        video.currentTime = currentTime
      }

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const dataUrl = canvas.toDataURL("image/jpeg", quality)
        const base64 = dataUrl.split(",")[1]

        frames.push({
          timestamp: currentTime,
          dataUrl,
          base64,
        })

        currentTime += interval
        captureFrame()
      }

      captureFrame()
    }

    video.onerror = () => {
      reject(new Error("Failed to load video"))
      URL.revokeObjectURL(video.src)
    }

    video.src = URL.createObjectURL(videoFile)
  })
}

/**
 * Analyzes video frames using Gemini Vision API
 */
export async function analyzeVideo(
  frames: VideoFrame[],
  prompt: string,
): Promise<{ analysis: string; error?: string }> {
  try {
    const response = await fetch("/api/ai/analyze-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        frames: frames.slice(0, 5).map((f) => f.base64), // Limit to 5 frames for API efficiency
        prompt,
      }),
    })

    if (!response.ok) {
      throw new Error("Video analysis failed")
    }

    const data = await response.json()
    return { analysis: data.analysis }
  } catch (error) {
    console.error("[v0] Video analysis error:", error)
    return {
      analysis: "",
      error: error instanceof Error ? error.message : "Failed to analyze video",
    }
  }
}

/**
 * Validates video file
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 100 * 1024 * 1024 // 100MB
  const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"]

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Please upload MP4, WebM, OGG, or MOV files.",
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File too large. Maximum size is 100MB.",
    }
  }

  return { valid: true }
}
