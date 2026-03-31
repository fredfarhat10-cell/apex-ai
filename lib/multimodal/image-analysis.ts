export interface ImageAnalysisResult {
  description: string
  objects: Array<{
    name: string
    confidence: number
    boundingBox?: { x: number; y: number; width: number; height: number }
  }>
  text?: string
  colors: Array<{ color: string; percentage: number }>
  tags: string[]
  metadata: {
    width: number
    height: number
    format: string
    size: number
  }
}

/**
 * Analyze image using AI
 */
export async function analyzeImage(imageFile: File): Promise<ImageAnalysisResult> {
  try {
    const formData = new FormData()
    formData.append("image", imageFile)

    const response = await fetch("/api/image-analysis", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Image analysis failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("[v0] Image analysis error:", error)
    throw error
  }
}

/**
 * Extract text from image (OCR)
 */
export async function extractTextFromImage(imageFile: File): Promise<string> {
  const result = await analyzeImage(imageFile)
  return result.text || ""
}

/**
 * Get image metadata
 */
export async function getImageMetadata(
  file: File,
): Promise<{ width: number; height: number; format: string; size: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.width,
        height: img.height,
        format: file.type,
        size: file.size,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }

    img.src = url
  })
}

/**
 * Compress image before upload
 */
export async function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const canvas = document.createElement("canvas")
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Failed to get canvas context"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to compress image"))
          }
        },
        "image/jpeg",
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }

    img.src = url
  })
}
