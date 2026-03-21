/**
 * Image optimization utilities
 * Compress and optimize images for better performance
 */

export interface OptimizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: "jpeg" | "png" | "webp"
}

/**
 * Optimize an image file
 */
export async function optimizeImage(file: File, options: OptimizeOptions = {}): Promise<Blob> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, format = "jpeg" } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    img.onload = () => {
      // Calculate new dimensions
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // Create canvas and draw resized image
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Could not create blob"))
          }
        },
        `image/${format}`,
        quality,
      )
    }

    img.onerror = () => {
      reject(new Error("Could not load image"))
    }

    reader.onerror = () => {
      reject(new Error("Could not read file"))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Convert image to base64 with optimization
 */
export async function imageToBase64(file: File, options: OptimizeOptions = {}): Promise<string> {
  const optimized = await optimizeImage(file, options)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(optimized)
  })
}

/**
 * Preload images for better performance
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = reject
          img.src = url
        }),
    ),
  )
}
