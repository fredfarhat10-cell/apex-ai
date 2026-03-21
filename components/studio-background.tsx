"use client"

import { useEffect, useState } from "react"
import type { StudioType } from "@/lib/types"

interface StudioBackgroundProps {
  studioType: StudioType
  className?: string
}

export function StudioBackground({ studioType, className = "" }: StudioBackgroundProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    // Generate particles for the studio
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }))
    setParticles(newParticles)
  }, [studioType])

  const getStudioStyles = () => {
    switch (studioType) {
      case "music":
        return {
          gradient: "from-purple-900/30 via-pink-900/20 to-black",
          accentColor: "#a78bfa",
          pattern: "music-notes",
        }
      case "art":
        return {
          gradient: "from-amber-900/20 via-orange-900/10 to-black",
          accentColor: "#fb923c",
          pattern: "paint-splatter",
        }
      case "fitness":
        return {
          gradient: "from-green-900/30 via-emerald-900/20 to-black",
          accentColor: "#10b981",
          pattern: "energy-waves",
        }
      case "coding":
        return {
          gradient: "from-cyan-900/30 via-blue-900/20 to-black",
          accentColor: "#22d3ee",
          pattern: "code-matrix",
        }
      case "gaming":
        return {
          gradient: "from-red-900/30 via-purple-900/20 to-black",
          accentColor: "#ef4444",
          pattern: "neon-grid",
        }
      case "reading":
        return {
          gradient: "from-slate-900/40 via-gray-900/30 to-black",
          accentColor: "#94a3b8",
          pattern: "book-pages",
        }
      case "cooking":
        return {
          gradient: "from-yellow-900/30 via-orange-900/20 to-black",
          accentColor: "#f59e0b",
          pattern: "steam-swirls",
        }
      case "nexus":
      default:
        return {
          gradient: "from-black via-apex-darker to-black",
          accentColor: "#22d3ee",
          pattern: "starfield",
        }
    }
  }

  const styles = getStudioStyles()

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient}`} />

      {/* Animated particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full opacity-40 particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: styles.accentColor,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(${styles.accentColor}22 1px, transparent 1px), linear-gradient(90deg, ${styles.accentColor}22 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Glow effect */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${styles.accentColor}40 0%, transparent 70%)`,
        }}
      />
    </div>
  )
}

export default StudioBackground
