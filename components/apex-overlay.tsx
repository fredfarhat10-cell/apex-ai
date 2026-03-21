"use client"

import { useEffect } from "react"

interface Notification {
  id: number
  level: "POS" | "NEU" | "ALR"
  title: string
  body: string
  detail: string
  module: "performance" | "portfolio" | "wellness"
  date: string
}

type Mood = "calm" | "alert" | "happy"

interface ApexOverlayProps {
  item: Notification
  onClose: () => void
  setMood: (mood: Mood) => void
  speak: (text: string) => void
}

export default function ApexOverlay({ item, onClose, setMood, speak }: ApexOverlayProps) {
  useEffect(() => {
    if (item.level === "ALR") setMood("alert")
    else if (item.level === "POS") setMood("happy")
    else setMood("calm")
  }, [item, setMood])

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-[#0f1118] border border-white/10 rounded-2xl p-8 w-[90%] max-w-lg shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          ✕
        </button>
        <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
        <p className="text-base text-gray-300 mb-6 leading-relaxed">{item.detail}</p>
        <ApexSuggestions module={item.module} speak={speak} />
      </div>
    </div>
  )
}

function ApexSuggestions({
  module,
  speak,
}: {
  module: "performance" | "portfolio" | "wellness"
  speak: (text: string) => void
}) {
  const advice = {
    portfolio: "Maintain current allocations; volatility is low. Review sector exposure tomorrow.",
    performance: "Momentum is positive. Schedule a 15-minute reflection to capture what worked well today.",
    wellness: "Rest debt noted. Activate low-stimulus mode after 9 PM. I will remind you if patterns repeat.",
  }

  const key = advice[module]

  useEffect(() => {
    if (key) speak(key)
  }, [module, key, speak])

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-sm">
      <p className="text-blue-300 mb-2 font-semibold">Apex Advice:</p>
      <p className="text-gray-300 leading-relaxed">{key}</p>
    </div>
  )
}
