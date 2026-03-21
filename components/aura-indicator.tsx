"use client"

import { useState, useRef, useEffect } from "react"
import { useVault } from "@/lib/vault-context"
import type { AuraState } from "@/lib/types"
import { BrainCircuitIcon, SparklesIcon, CloudRainIcon, ZapIcon, MoonIcon, SunIcon } from "./icons"
import type { JSX } from "react"

const auraConfig: { [key in AuraState]: { icon: JSX.Element; color: string; description: string } } = {
  Neutral: { icon: <SunIcon />, color: "text-apex-gray", description: "Baseline state" },
  Focused: { icon: <BrainCircuitIcon />, color: "text-blue-400", description: "Deep work mode" },
  Creative: { icon: <SparklesIcon />, color: "text-purple-400", description: "Ideation mode" },
  Stressed: { icon: <CloudRainIcon />, color: "text-red-400", description: "High pressure" },
  Energized: { icon: <ZapIcon />, color: "text-yellow-400", description: "Peak performance" },
  Tired: { icon: <MoonIcon />, color: "text-indigo-400", description: "Recovery needed" },
}

export default function AuraIndicator() {
  const { aura, updateState } = useVault()
  const [isOpen, setIsOpen] = useState(false)
  const [inferredAura, setInferredAura] = useState<any>(null)
  const [isInferring, setIsInferring] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const handleSelectAura = (newAura: AuraState) => {
    updateState("aura", newAura)
    setIsOpen(false)
  }

  useEffect(() => {
    inferAura()
  }, [])

  const inferAura = async () => {
    setIsInferring(true)
    try {
      const response = await fetch("/api/aura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "current-user" }),
      })

      const data = await response.json()
      if (data.success && data.aura) {
        setInferredAura(data.aura)

        // Map the inferred mood state to our AuraState type
        const moodStateMap: { [key: string]: AuraState } = {
          Energized: "Energized",
          Balanced: "Focused",
          Stressed: "Stressed",
          Overwhelmed: "Stressed",
          Recovering: "Tired",
        }

        const mappedAura = moodStateMap[data.aura.moodState] || "Neutral"
        updateState("aura", mappedAura)
      }
    } catch (error) {
      console.error("[v0] Aura inference error:", error)
    } finally {
      setIsInferring(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative mb-4" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-md bg-apex-dark border border-gray-700 hover:border-gray-600 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={auraConfig[aura].color}>{auraConfig[aura].icon}</span>
          <span className="text-sm font-medium text-apex-light">Aura</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${auraConfig[aura].color}`}>{aura}</span>
          {isInferring && (
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </button>

      {inferredAura && (
        <div className="mt-2 p-2 bg-apex-dark/50 border border-gray-700 rounded-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Aura Score</span>
            <span className="text-xs font-semibold text-cyan-400">{inferredAura.auraScore}/100</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${inferredAura.auraScore}%` }}
            />
          </div>
          {inferredAura.biometricInputs && (
            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Calibrated with your {inferredAura.biometricInputs.recovery !== undefined ? "Whoop" : "Garmin"} data
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">{inferredAura.toneRecommendation}</p>
          <button
            onClick={inferAura}
            disabled={isInferring}
            className="mt-2 w-full text-xs py-1 px-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded transition-colors disabled:opacity-50"
          >
            {isInferring ? "Analyzing..." : "Refresh Aura"}
          </button>
        </div>
      )}

      {isOpen && (
        <div className="absolute bottom-full mb-2 w-full bg-apex-dark border border-gray-700 rounded-lg shadow-2xl p-2 z-10 animate-in fade-in duration-200">
          <div className="grid grid-cols-3 gap-1">
            {(Object.keys(auraConfig) as AuraState[]).map((key) => (
              <button
                key={key}
                onClick={() => handleSelectAura(key)}
                className={`flex flex-col items-center justify-center p-2 rounded-md hover:bg-apex-darker transition-colors ${
                  aura === key ? "bg-apex-primary/20" : ""
                }`}
                title={auraConfig[key].description}
              >
                <span className={`${auraConfig[key].color} mb-1`}>{auraConfig[key].icon}</span>
                <span className="text-xs text-apex-gray">{key}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
