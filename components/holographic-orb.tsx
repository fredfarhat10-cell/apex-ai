"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface HolographicOrbProps {
  size?: number
  color?: string
  intensity?: "low" | "medium" | "high"
  animated?: boolean
  className?: string
}

export function HolographicOrb({
  size = 100,
  color = "#00FFFF",
  intensity = "medium",
  animated = true,
  className = "",
}: HolographicOrbProps) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (!animated) return

    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360)
    }, 50)

    return () => clearInterval(interval)
  }, [animated])

  const glowIntensity = {
    low: 0.3,
    medium: 0.5,
    high: 0.7,
  }[intensity]

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      animate={animated ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
    >
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: `radial-gradient(circle, ${color}${Math.floor(glowIntensity * 255).toString(16)} 0%, transparent 70%)`,
        }}
      />

      {/* Middle ring */}
      <div
        className="absolute inset-[10%] rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          boxShadow: `0 0 ${size / 4}px ${color}80`,
        }}
      />

      {/* Core orb */}
      <div
        className="absolute inset-[20%] rounded-full holographic"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}60 0%, ${color}20 50%, transparent 100%)`,
          boxShadow: `inset 0 0 ${size / 8}px ${color}40, 0 0 ${size / 6}px ${color}60`,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {/* Highlight */}
        <div
          className="absolute top-[15%] left-[15%] w-[30%] h-[30%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}80 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Rotating particles */}
      {animated && (
        <>
          {[0, 120, 240].map((angle) => (
            <motion.div
              key={angle}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: color,
                boxShadow: `0 0 10px ${color}`,
                top: "50%",
                left: "50%",
              }}
              animate={{
                x: [
                  Math.cos((angle * Math.PI) / 180) * (size / 2),
                  Math.cos(((angle + 360) * Math.PI) / 180) * (size / 2),
                ],
                y: [
                  Math.sin((angle * Math.PI) / 180) * (size / 2),
                  Math.sin(((angle + 360) * Math.PI) / 180) * (size / 2),
                ],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  )
}

export default HolographicOrb
