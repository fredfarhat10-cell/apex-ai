"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface FearAndGreedIndexProps {
  score: number // 0-100: 0 = Extreme Fear, 50 = Neutral, 100 = Extreme Greed
}

const getLabel = (score: number): string => {
  if (score <= 20) return "Extreme Fear"
  if (score <= 40) return "Fear"
  if (score <= 60) return "Neutral"
  if (score <= 80) return "Greed"
  return "Extreme Greed"
}

const getColor = (score: number): string => {
  if (score <= 20) return "#3b82f6" // Blue for Extreme Fear
  if (score <= 40) return "#60a5fa" // Light Blue for Fear
  if (score <= 60) return "#888888" // Gray for Neutral
  if (score <= 80) return "#ffa366" // Orange for Greed
  return "#22c55e" // Green for Extreme Greed
}

export default function FearAndGreedIndex({ score }: FearAndGreedIndexProps) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    // Animate the score on mount
    const timer = setTimeout(() => setDisplayScore(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  // Calculate needle rotation: -90deg (left) to 90deg (right)
  const rotation = -90 + (displayScore / 100) * 180

  const label = getLabel(displayScore)
  const color = getColor(displayScore)

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Semi-circular gauge background */}
      <div className="relative aspect-[2/1] overflow-hidden">
        {/* Gauge arc background */}
        <svg
          viewBox="0 0 200 100"
          className="w-full h-full"
          style={{ filter: "drop-shadow(0 0 10px rgba(255, 107, 0, 0.2))" }}
        >
          {/* Background arc */}
          <path
            d="M 10 90 A 80 80 0 0 1 190 90"
            fill="none"
            stroke="rgba(42, 42, 47, 0.8)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Gradient arc segments */}
          {/* Extreme Fear - Blue */}
          <path
            d="M 10 90 A 80 80 0 0 1 46 35"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Fear - Light Blue */}
          <path
            d="M 46 35 A 80 80 0 0 1 82 15"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Neutral - Gray */}
          <path
            d="M 82 15 A 80 80 0 0 1 118 15"
            fill="none"
            stroke="#888888"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Greed - Orange */}
          <path
            d="M 118 15 A 80 80 0 0 1 154 35"
            fill="none"
            stroke="#ffa366"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Extreme Greed - Green */}
          <path
            d="M 154 35 A 80 80 0 0 1 190 90"
            fill="none"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Active arc overlay */}
          <motion.path
            d={`M 10 90 A 80 80 0 0 1 ${10 + (displayScore / 100) * 180} ${90 - Math.sin((displayScore / 100) * Math.PI) * 80}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: [0.2, 0.9, 0.2, 1] }}
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />

          {/* Center circle */}
          <circle cx="100" cy="90" r="8" fill="#111116" stroke={color} strokeWidth="2" />
        </svg>

        {/* Animated needle */}
        <motion.div
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{
            width: "3px",
            height: "35%",
            marginLeft: "-1.5px",
          }}
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1.5, ease: [0.2, 0.9, 0.2, 1] }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `linear-gradient(to top, ${color}, transparent)`,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
        </motion.div>
      </div>

      {/* Labels */}
      <div className="absolute top-[60%] left-0 right-0 flex justify-between px-4 text-xs">
        <span className="text-blue-400 font-medium">Extreme Fear</span>
        <span className="text-gray-500 font-medium">Neutral</span>
        <span className="text-green-400 font-medium">Extreme Greed</span>
      </div>

      {/* Score display */}
      <div className="mt-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="inline-block"
        >
          <div className="text-5xl font-bold font-orbitron mb-2" style={{ color }}>
            {Math.round(displayScore)}
          </div>
          <div
            className="text-lg font-semibold tracking-wider uppercase"
            style={{
              color,
              textShadow: `0 0 10px ${color}40`,
            }}
          >
            {label}
          </div>
        </motion.div>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 mt-3">Market Sentiment Index</p>
      </div>
    </div>
  )
}
