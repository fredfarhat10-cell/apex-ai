"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface ContextNode {
  label: string
  value: string
  color: string
}

export function LifeModelVisualizer() {
  const [nodes, setNodes] = useState<ContextNode[]>([])
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0)

  const contextNodes: ContextNode[] = [
    { label: "Financials", value: "$50k Savings", color: "from-green-500 to-emerald-500" },
    { label: "Career Quest", value: "Become Director", color: "from-blue-500 to-cyan-500" },
    { label: "Wellness", value: "7.2 hrs avg sleep", color: "from-purple-500 to-pink-500" },
    { label: "Network", value: "142 connections", color: "from-orange-500 to-red-500" },
    { label: "Goals", value: "3 active goals", color: "from-yellow-500 to-amber-500" },
    { label: "Stress Patterns", value: "Moderate baseline", color: "from-indigo-500 to-violet-500" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentNodeIndex < contextNodes.length) {
        setNodes((prev) => [...prev, contextNodes[currentNodeIndex]])
        speak(`Accessing ${contextNodes[currentNodeIndex].label}...`)
        setCurrentNodeIndex((prev) => prev + 1)
      }
    }, 800)

    return () => clearInterval(interval)
  }, [currentNodeIndex])

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.1
      utterance.pitch = 0.8
      utterance.volume = 0.7
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central Orb */}
      <motion.div
        className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
        animate={{
          boxShadow: [
            "0 0 30px rgba(168, 85, 247, 0.6)",
            "0 0 60px rgba(168, 85, 247, 1)",
            "0 0 30px rgba(168, 85, 247, 0.6)",
          ],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />

      {/* Context Nodes */}
      {nodes.map((node, index) => {
        const angle = (index / contextNodes.length) * 2 * Math.PI
        const radius = 200
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        return (
          <motion.div
            key={node.label}
            initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
            animate={{ scale: 1, x, y, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute"
          >
            {/* Connection Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ left: -x, top: -y }}>
              <motion.line
                x1="50%"
                y1="50%"
                x2={`calc(50% + ${x}px)`}
                y2={`calc(50% + ${y}px)`}
                stroke="url(#gradient)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(168, 85, 247, 0.8)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0.8)" />
                </linearGradient>
              </defs>
            </svg>

            {/* Node */}
            <motion.div
              className={`w-32 h-32 rounded-full bg-gradient-to-br ${node.color} flex flex-col items-center justify-center p-4 border-2 border-white/20`}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(255, 255, 255, 0.3)",
                  "0 0 40px rgba(255, 255, 255, 0.6)",
                  "0 0 20px rgba(255, 255, 255, 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 }}
            >
              <div className="text-white text-center">
                <div className="text-xs font-semibold mb-1">{node.label}</div>
                <div className="text-[10px] opacity-90">{node.value}</div>
              </div>
            </motion.div>
          </motion.div>
        )
      })}

      {/* Status Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-20 text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Accessing Life Model</h2>
        <p className="text-gray-400">Gathering comprehensive context from all life domains...</p>
      </motion.div>
    </div>
  )
}
