"use client"

import { useEffect, useRef } from "react"

interface ApexOrbProps {
  state: "idle" | "speaking" | "listening" | "thinking"
}

export function ApexOrb({ state }: ApexOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let time = 0

    const animate = () => {
      time += 0.02

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const baseRadius = 80

      // Different animations based on state
      if (state === "idle") {
        // Gentle pulse
        const radius = baseRadius + Math.sin(time) * 5
        drawOrb(ctx, centerX, centerY, radius, "#00FFD1", 0.6)
      } else if (state === "speaking") {
        // Pulsing with energy rings
        const radius = baseRadius + Math.sin(time * 2) * 10
        drawOrb(ctx, centerX, centerY, radius, "#00FFD1", 0.8)

        // Energy rings
        for (let i = 0; i < 3; i++) {
          const ringRadius = radius + 20 + i * 15 + ((time * 20) % 60)
          const opacity = 0.3 - i * 0.1 - ((time * 20) % 60) / 200
          if (opacity > 0) {
            drawRing(ctx, centerX, centerY, ringRadius, "#00FFD1", opacity)
          }
        }
      } else if (state === "listening") {
        // Waveform visualization
        const radius = baseRadius
        drawOrb(ctx, centerX, centerY, radius, "#00FFD1", 0.7)

        // Waveform bars
        const bars = 12
        for (let i = 0; i < bars; i++) {
          const angle = (i / bars) * Math.PI * 2
          const barHeight = 20 + Math.sin(time * 3 + i) * 15
          const x1 = centerX + Math.cos(angle) * (radius + 10)
          const y1 = centerY + Math.sin(angle) * (radius + 10)
          const x2 = centerX + Math.cos(angle) * (radius + 10 + barHeight)
          const y2 = centerY + Math.sin(angle) * (radius + 10 + barHeight)

          ctx.strokeStyle = `rgba(0, 255, 209, ${0.6 + Math.sin(time * 3 + i) * 0.3})`
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
      } else if (state === "thinking") {
        // Rotating particles
        const radius = baseRadius
        drawOrb(ctx, centerX, centerY, radius, "#00FFD1", 0.5)

        const particles = 8
        for (let i = 0; i < particles; i++) {
          const angle = (i / particles) * Math.PI * 2 + time
          const distance = radius + 30
          const x = centerX + Math.cos(angle) * distance
          const y = centerY + Math.sin(angle) * distance

          ctx.fillStyle = `rgba(0, 255, 209, ${0.5 + Math.sin(time * 2 + i) * 0.3})`
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [state])

  return <canvas ref={canvasRef} width={400} height={400} className="mx-auto" />
}

function drawOrb(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, opacity: number) {
  // Outer glow
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.5)
  gradient.addColorStop(0, `rgba(0, 255, 209, ${opacity})`)
  gradient.addColorStop(0.5, `rgba(0, 255, 209, ${opacity * 0.5})`)
  gradient.addColorStop(1, "rgba(0, 255, 209, 0)")

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2)
  ctx.fill()

  // Core orb
  const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  coreGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.8})`)
  coreGradient.addColorStop(0.3, `rgba(0, 255, 209, ${opacity})`)
  coreGradient.addColorStop(1, `rgba(0, 200, 180, ${opacity * 0.6})`)

  ctx.fillStyle = coreGradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

function drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, opacity: number) {
  ctx.strokeStyle = `rgba(0, 255, 209, ${opacity})`
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.stroke()
}
