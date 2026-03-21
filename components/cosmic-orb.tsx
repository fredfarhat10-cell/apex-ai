"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function CosmicOrb() {
  const [particles, setParticles] = useState<Array<{ id: number; angle: number; speed: number; distance: number }>>([])

  useEffect(() => {
    // Generate particle rings
    const particleCount = 60
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      angle: (i / particleCount) * 360,
      speed: 0.5 + Math.random() * 0.5,
      distance: 80 + Math.random() * 40,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute w-full h-full rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-3xl"
      />

      {/* Particle Rings */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          animate={{
            rotate: [particle.angle, particle.angle + 360],
            scale: [0.8, 1.2, 0.8],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 20 / particle.speed,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{
            left: "50%",
            top: "50%",
            transformOrigin: `0 0`,
            transform: `translate(-50%, -50%) rotate(${particle.angle}deg) translateX(${particle.distance}px)`,
          }}
        />
      ))}

      {/* Inner Nebula */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: {
            duration: 30,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          },
          scale: {
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
        }}
        className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/40 via-blue-600/40 to-purple-600/40 blur-xl"
      />

      {/* Core */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          boxShadow: [
            "0 0 20px rgba(6, 182, 212, 0.5)",
            "0 0 40px rgba(6, 182, 212, 0.8)",
            "0 0 20px rgba(6, 182, 212, 0.5)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 blur-sm"
      />

      {/* Core Center (bright spot) */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute w-8 h-8 rounded-full bg-white"
      />
    </div>
  )
}
