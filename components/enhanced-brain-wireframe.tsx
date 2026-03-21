"use client"

import { useEffect, useRef, useState } from "react"

interface EnhancedBrainWireframeProps {
  ctaHovered?: boolean
  reducedMotion?: boolean
}

export function EnhancedBrainWireframe({ ctaHovered = false, reducedMotion = false }: EnhancedBrainWireframeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pulseProgress, setPulseProgress] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const size = 500
    canvas.width = size
    canvas.height = size

    // Neural network nodes
    const nodes = [
      { x: 250, y: 100, size: 4 },
      { x: 200, y: 150, size: 3 },
      { x: 300, y: 150, size: 3 },
      { x: 180, y: 200, size: 3 },
      { x: 250, y: 200, size: 5 }, // Central node
      { x: 320, y: 200, size: 3 },
      { x: 200, y: 250, size: 3 },
      { x: 300, y: 250, size: 3 },
      { x: 220, y: 300, size: 3 },
      { x: 280, y: 300, size: 3 },
      { x: 250, y: 350, size: 4 },
    ]

    // Connections between nodes
    const connections = [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [2, 4],
      [2, 5],
      [3, 4],
      [4, 5],
      [4, 6],
      [4, 7],
      [6, 8],
      [7, 9],
      [8, 10],
      [9, 10],
    ]

    // Brain outline path (simplified wireframe)
    const brainPath = [
      { x: 250, y: 80 },
      { x: 300, y: 90 },
      { x: 340, y: 120 },
      { x: 360, y: 170 },
      { x: 360, y: 220 },
      { x: 350, y: 270 },
      { x: 320, y: 320 },
      { x: 280, y: 350 },
      { x: 250, y: 360 },
      { x: 220, y: 350 },
      { x: 180, y: 320 },
      { x: 150, y: 270 },
      { x: 140, y: 220 },
      { x: 140, y: 170 },
      { x: 160, y: 120 },
      { x: 200, y: 90 },
      { x: 250, y: 80 },
    ]

    let animationFrame: number
    let lastPulseTime = 0

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, size, size)

      if (!reducedMotion && timestamp - lastPulseTime > 6000) {
        lastPulseTime = timestamp
        setPulseProgress(0)
      }
      const progress = reducedMotion ? 0 : ((timestamp - lastPulseTime) / 6000) * connections.length

      ctx.strokeStyle = `rgba(168, 85, 247, ${ctaHovered ? 0.3 : 0.2})`
      ctx.lineWidth = 2
      ctx.beginPath()
      brainPath.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y)
        else ctx.lineTo(point.x, point.y)
      })
      ctx.stroke()

      connections.forEach((conn, index) => {
        const [startIdx, endIdx] = conn
        const start = nodes[startIdx]
        const end = nodes[endIdx]

        // Base connection line
        ctx.strokeStyle = `rgba(139, 92, 246, ${ctaHovered ? 0.25 : 0.18})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.stroke()

        if (!reducedMotion && progress >= index && progress < index + 1) {
          const pulsePos = progress - index
          const pulseX = start.x + (end.x - start.x) * pulsePos
          const pulseY = start.y + (end.y - start.y) * pulsePos

          ctx.fillStyle = `rgba(168, 85, 247, ${ctaHovered ? 0.9 : 0.7})`
          ctx.beginPath()
          ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2)
          ctx.fill()

          // Glow effect
          ctx.shadowBlur = 10
          ctx.shadowColor = "rgba(168, 85, 247, 0.8)"
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })

      nodes.forEach((node) => {
        const brightness = ctaHovered ? 1 : 0.7
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        ctx.fill()

        // Node glow
        if (ctaHovered) {
          ctx.shadowBlur = 8
          ctx.shadowColor = "rgba(168, 85, 247, 0.6)"
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [ctaHovered, reducedMotion])

  return (
    <div className="relative w-[500px] h-[500px]">
      {/* Glowing orbit ring */}
      <div className="absolute inset-0 rounded-full">
        <svg className="w-full h-full animate-spin-slow" viewBox="0 0 500 500">
          <defs>
            <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
              <stop offset="33%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="66%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="250"
            cy="250"
            r="200"
            fill="none"
            stroke="url(#orbitGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="20 10"
            filter="url(#glow)"
          />
        </svg>
      </div>

      {/* Brain wireframe canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        <canvas ref={canvasRef} className="drop-shadow-2xl" />
      </div>

      {/* Orbiting particles */}
      <div className="absolute top-1/4 left-0 w-2 h-2 rounded-full bg-blue-400 animate-orbit" />
      <div className="absolute top-0 right-1/4 w-2 h-2 rounded-full bg-purple-400 animate-orbit-reverse" />
      <div className="absolute bottom-1/4 right-0 w-2 h-2 rounded-full bg-pink-400 animate-orbit delay-500" />
    </div>
  )
}
