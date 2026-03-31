export interface TypewriterOptions {
  avg?: number
  jitter?: number
  onChar?: (index: number, char: string) => void
  onComplete?: () => void
}

export function typeText(
  setText: (text: string) => void,
  fullText: string,
  options: TypewriterOptions = {},
): () => void {
  const { avg = 28, jitter = 8, onChar, onComplete } = options
  let currentText = ""
  let i = 0
  let timeoutId: NodeJS.Timeout

  function tick() {
    if (i >= fullText.length) {
      onComplete?.()
      return
    }

    currentText += fullText[i]
    setText(currentText)
    onChar?.(i, fullText[i])
    i++

    const delay = Math.max(10, avg + (Math.random() * jitter * 2 - jitter))
    timeoutId = setTimeout(tick, delay)
  }

  tick()

  // Return cleanup function
  return () => {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function randomJitter(range = 100): number {
  return Math.random() * range - range / 2
}
