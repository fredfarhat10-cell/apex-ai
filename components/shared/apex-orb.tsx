"use client"

import { motion } from "framer-motion"

export function ApexOrb({ speaking }: { speaking: boolean }) {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl"
        animate={{
          scale: speaking ? [1, 1.3, 1] : [1, 1.1, 1],
          opacity: speaking ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: speaking ? 1.2 : 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/30 backdrop-blur-sm"
        animate={{
          scale: speaking ? [1, 1.15, 1] : [1, 1.05, 1],
          rotate: speaking ? [0, 180, 360] : [0, 360],
        }}
        transition={{
          duration: speaking ? 2 : 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Inner core */}
      <motion.div
        className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 shadow-2xl shadow-cyan-500/50"
        animate={{
          scale: speaking ? [1, 1.1, 1] : [1, 1.02, 1],
        }}
        transition={{
          duration: speaking ? 0.8 : 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 via-transparent to-transparent"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Center icon */}
      <motion.div
        className="relative z-10 text-4xl"
        animate={{
          scale: speaking ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 0.6,
          repeat: speaking ? Number.POSITIVE_INFINITY : 0,
          ease: "easeInOut",
        }}
      >
        🧠
      </motion.div>

      {/* Particle effects when speaking */}
      {speaking && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
              }}
              animate={{
                x: Math.cos((i * Math.PI * 2) / 8) * 60,
                y: Math.sin((i * Math.PI * 2) / 8) * 60,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}
