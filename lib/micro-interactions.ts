import type React from "react"
export const microInteractions = {
  // Celebration animations
  celebrate: () => {
    if (typeof window !== "undefined" && (window as any).confetti) {
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        // Trigger confetti from random positions
        ;(window as any).confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          }),
        )
        ;(window as any).confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          }),
        )
      }, 250)
    }
  },

  successPulse: (elementId: string) => {
    if (typeof window !== "undefined") {
      const element = document.getElementById(elementId)
      if (element) {
        element.classList.add("animate-success-pulse")
        setTimeout(() => {
          element.classList.remove("animate-success-pulse")
        }, 1000)
      }
    }
  },

  errorShake: (elementId: string) => {
    if (typeof window !== "undefined") {
      const element = document.getElementById(elementId)
      if (element) {
        element.classList.add("animate-error-shake")
        setTimeout(() => {
          element.classList.remove("animate-error-shake")
        }, 500)
      }
    }
  },

  // Smooth scroll with easing
  smoothScrollTo: (elementId: string) => {
    if (typeof window !== "undefined") {
      const element = document.getElementById(elementId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  },

  // Haptic feedback (mobile)
  hapticFeedback: (type: "light" | "medium" | "heavy" = "medium") => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      }
      navigator.vibrate(patterns[type])
    }
  },

  ripple: (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget
    const ripple = document.createElement("span")
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.classList.add("ripple-effect")

    button.style.position = "relative"
    button.style.overflow = "hidden"
    button.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  },

  // Progress bar animation
  animateProgress: (elementId: string, from: number, to: number, duration = 1000) => {
    if (typeof window !== "undefined") {
      const element = document.getElementById(elementId) as HTMLElement
      if (element) {
        const startTime = Date.now()
        const animate = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3) // Ease out cubic
          const current = from + (to - from) * eased

          element.style.width = `${current}%`

          if (progress < 1) {
            requestAnimationFrame(animate)
          }
        }
        animate()
      }
    }
  },

  // Number counter animation
  animateNumber: (elementId: string, from: number, to: number, duration = 1000) => {
    if (typeof window !== "undefined") {
      const element = document.getElementById(elementId)
      if (element) {
        const startTime = Date.now()
        const animate = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          const current = Math.floor(from + (to - from) * eased)

          element.textContent = current.toLocaleString()

          if (progress < 1) {
            requestAnimationFrame(animate)
          }
        }
        animate()
      }
    }
  },
}
