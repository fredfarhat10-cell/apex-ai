"use client"

import type React from "react"

import { useState } from "react"
import { useVault } from "@/lib/vault-context"
import type { AuraState } from "@/lib/types"
import { BrainCircuit, Sparkles, CloudRain, Zap, Moon, Sun } from "lucide-react"
import { Slider } from "@/components/ui/slider"

const auraConfig: {
  [key in AuraState]: {
    icon: React.ReactNode
    color: string
    description: string
    adaptations: string[]
  }
} = {
  Neutral: {
    icon: <Sun size={20} />,
    color: "text-gray-400",
    description: "Balanced and ready for anything",
    adaptations: ["Standard pacing", "Balanced recommendations"],
  },
  Focused: {
    icon: <BrainCircuit size={20} />,
    color: "text-blue-400",
    description: "Deep work mode activated",
    adaptations: ["Detailed steps", "Minimal distractions", "Complex tasks prioritized"],
  },
  Creative: {
    icon: <Sparkles size={20} />,
    color: "text-purple-400",
    description: "Innovation and exploration",
    adaptations: ["Open-ended suggestions", "Brainstorming prompts", "Creative challenges"],
  },
  Stressed: {
    icon: <CloudRain size={20} />,
    color: "text-red-400",
    description: "Need support and simplification",
    adaptations: ["Shorter tasks", "Calming suggestions", "Stress-relief focus"],
  },
  Energized: {
    icon: <Zap size={20} />,
    color: "text-yellow-400",
    description: "High energy and motivation",
    adaptations: ["Ambitious goals", "Quick wins", "High-intensity tasks"],
  },
  Tired: {
    icon: <Moon size={20} />,
    color: "text-indigo-400",
    description: "Low energy, need rest",
    adaptations: ["Minimal steps", "Easy wins", "Rest reminders"],
  },
}

export default function EnhancedAuraSelector() {
  const { aura, updateState } = useVault()
  const [intensity, setIntensity] = useState(50)
  const [showDetails, setShowDetails] = useState(false)

  const handleAuraChange = (newAura: AuraState) => {
    updateState("aura", newAura)
  }

  return (
    <div className="bg-apex-dark border border-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className={auraConfig[aura].color}>{auraConfig[aura].icon}</span>
          Current Aura: {aura}
        </h3>
        <button onClick={() => setShowDetails(!showDetails)} className="text-xs text-apex-accent hover:underline">
          {showDetails ? "Hide" : "Show"} Details
        </button>
      </div>

      {showDetails && (
        <div className="space-y-3 animate-fadeIn">
          <p className="text-sm text-apex-gray">{auraConfig[aura].description}</p>
          <div className="space-y-2">
            <label className="text-xs text-apex-gray">Intensity Level</label>
            <Slider
              value={[intensity]}
              onValueChange={(value) => setIntensity(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-apex-gray text-right">{intensity}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-apex-accent">AI Adaptations:</p>
            <ul className="text-xs text-apex-gray space-y-1">
              {auraConfig[aura].adaptations.map((adaptation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-apex-accent">•</span>
                  {adaptation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(auraConfig) as AuraState[]).map((key) => (
          <button
            key={key}
            onClick={() => handleAuraChange(key)}
            className={`flex flex-col items-center justify-center p-3 rounded-md transition-all ${
              aura === key
                ? "bg-apex-primary/20 border-2 border-apex-primary"
                : "bg-apex-darker border border-gray-700 hover:border-gray-600"
            }`}
          >
            <span className={auraConfig[key].color}>{auraConfig[key].icon}</span>
            <span className="text-xs text-apex-gray mt-1">{key}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
