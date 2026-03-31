"use client"

import { useState, useEffect } from "react"
import { Brain, Zap, CheckCircle } from "lucide-react"

interface AIPersonaCardProps {
  userName?: string
  currentTask?: string
}

export default function AIPersonaCard({ userName = "User", currentTask }: AIPersonaCardProps) {
  const [status, setStatus] = useState<"online" | "analyzing" | "idle">("online")
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (currentTask) {
      setStatus("analyzing")
    } else {
      setStatus("online")
    }
  }, [currentTask])

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    switch (status) {
      case "analyzing":
        return "bg-[#FF6B00]"
      case "online":
        return "bg-green-400"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = () => {
    if (currentTask) return currentTask
    switch (status) {
      case "analyzing":
        return "Analyzing..."
      case "online":
        return "Ready to assist"
      default:
        return "Idle"
    }
  }

  return (
    <div className="glass-effect p-4 rounded-2xl border border-gray-700 hover:border-[#FF6B00]/50 transition-all">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div
            className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8533] flex items-center justify-center ${
              pulse ? "apex-glow" : ""
            } transition-all`}
          >
            <Brain className="w-7 h-7 text-white" />
          </div>
          {/* Status indicator */}
          <div
            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ${getStatusColor()} border-2 border-[#111116]`}
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white">Apex</h3>
            {status === "online" && <CheckCircle className="w-4 h-4 text-green-400" />}
            {status === "analyzing" && <Zap className="w-4 h-4 text-[#FF6B00] animate-pulse" />}
          </div>
          <p className="text-sm text-gray-400">{getStatusText()}</p>
          <p className="text-xs text-gray-500 mt-1">Assisting {userName}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-lg font-bold text-[#FF6B00]">24/7</div>
          <div className="text-xs text-gray-500">Available</div>
        </div>
        <div>
          <div className="text-lg font-bold text-[#FF6B00]">∞</div>
          <div className="text-xs text-gray-500">Memory</div>
        </div>
        <div>
          <div className="text-lg font-bold text-[#FF6B00]">100%</div>
          <div className="text-xs text-gray-500">Private</div>
        </div>
      </div>
    </div>
  )
}
