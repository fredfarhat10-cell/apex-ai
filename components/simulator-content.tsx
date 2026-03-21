"use client"

import { useState, useEffect, useRef } from "react"
import { useVault } from "@/lib/vault-context"
import type { LifeSimulation } from "@/lib/types"
import Widget from "./widget"
import {
  GitBranchIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  HeartIcon,
  DollarSignIcon,
  RepeatIcon,
  BrainCircuitIcon,
  Volume2Icon,
  VolumeXIcon,
  DownloadIcon,
} from "./icons"
import { ExportUtils } from "@/lib/export-utils"
import { Button } from "@/components/ui/button"

const soundscapes = {
  positive: "/sounds/positive-ambient.mp3", // Placeholder - would need actual audio files
  negative: "/sounds/negative-ambient.mp3",
  neutral: "/sounds/neutral-ambient.mp3",
}

const ImpactIcon = ({ dimension }: { dimension: string }) => {
  switch (dimension) {
    case "Wellness":
      return <HeartIcon className="w-4 h-4 text-pink-400" />
    case "Productivity":
      return <BrainCircuitIcon className="w-4 h-4 text-yellow-400" />
    case "Finances":
      return <DollarSignIcon className="w-4 h-4 text-green-400" />
    case "Habits":
      return <RepeatIcon className="w-4 h-4 text-blue-400" />
    default:
      return <BrainCircuitIcon className="w-4 h-4 text-purple-400" />
  }
}

export default function SimulatorContent() {
  const { userProfile, strategicGoal, updateState, symbiontFeed } = useVault()
  const [decision, setDecision] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LifeSimulation | null>(null)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (result && audioEnabled) {
      // Determine overall sentiment from paths
      const avgProbability = result.paths.reduce((acc, p) => acc + p.probability, 0) / result.paths.length
      const soundscape = avgProbability > 60 ? "positive" : avgProbability < 40 ? "negative" : "neutral"

      // In a real implementation, this would play actual audio files
      console.log(`[v0] Playing ${soundscape} soundscape for simulation`)
    }
  }, [result, audioEnabled])

  const handleSimulate = async () => {
    if (!decision.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/ai/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          aura: 75,
          userContext: {
            name: userProfile?.name,
            occupation: userProfile?.occupation,
            goal: strategicGoal,
          },
        }),
      })

      if (!response.ok) throw new Error("Simulation failed")

      const data = await response.json()
      setResult(data)

      const newEvent = {
        id: Date.now().toString(),
        text: `Simulated decision: "${decision.slice(0, 50)}..."`,
        timestamp: new Date().toISOString(),
      }
      updateState("symbiontFeed", [newEvent, ...symbiontFeed])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    if (result) {
      ExportUtils.generateSimulationPDF(result)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <GitBranchIcon className="w-8 h-8" /> Life Echo Simulator
          </h1>
          <p className="text-apex-gray">Explore potential futures by simulating the echoes of your decisions.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="flex items-center gap-2 px-4 py-2 bg-apex-darker border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
            title={audioEnabled ? "Disable soundscapes" : "Enable soundscapes"}
          >
            {audioEnabled ? (
              <Volume2Icon className="w-5 h-5 text-apex-primary" />
            ) : (
              <VolumeXIcon className="w-5 h-5 text-apex-gray" />
            )}
            <span className="text-sm text-apex-gray">Soundscapes</span>
          </button>
          {result && (
            <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2 bg-transparent">
              <DownloadIcon className="w-4 h-4" />
              Export PDF
            </Button>
          )}
        </div>
      </div>

      <Widget title="Define Scenario">
        <div className="flex flex-col gap-4">
          <textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="e.g., What if I practice guitar daily for the next 6 months?"
            className="w-full bg-apex-darker border border-gray-700 rounded-md p-3 text-lg outline-none focus:ring-2 focus:ring-apex-primary text-white"
            rows={3}
          />
          <button
            onClick={handleSimulate}
            disabled={loading || !decision}
            className="w-full bg-apex-primary text-white font-semibold py-3 px-6 rounded-md hover:bg-opacity-80 transition-colors flex items-center justify-center gap-2 disabled:bg-opacity-50 text-lg"
          >
            {loading ? "Simulating..." : "Simulate Echoes"}
          </button>
        </div>
      </Widget>

      {loading && (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-apex-primary"></div>
          <p className="text-apex-gray mt-4">Simulating quantum echoes across timelines...</p>
        </div>
      )}

      {error && (
        <Widget title="Error">
          <p className="text-red-400">{error}</p>
        </Widget>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold text-white">
            Simulation for: <span className="text-apex-accent">{result.decision}</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {result.paths.map((path, index) => (
              <Widget key={index} title={path.title} className="flex flex-col">
                <div className="space-y-4 flex-grow">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-apex-gray">Probability</span>
                      <span className="font-semibold text-apex-light">{path.probability}%</span>
                    </div>
                    <div className="w-full bg-apex-darker rounded-full h-2.5">
                      <div
                        className="bg-apex-primary h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${path.probability}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-apex-gray text-sm">{path.description}</p>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-apex-light">Key Impacts:</h4>
                    <ul className="space-y-2">
                      {path.impacts.map((impact, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          <ImpactIcon dimension={impact.dimension} />
                          <span className="font-medium w-24 text-apex-light">{impact.dimension}</span>
                          <span
                            className={`flex items-center gap-1 ${
                              impact.direction === "positive"
                                ? "text-green-400"
                                : impact.direction === "negative"
                                  ? "text-red-400"
                                  : "text-apex-gray"
                            }`}
                          >
                            {impact.direction === "positive" ? (
                              <TrendingUpIcon className="w-3.5 h-3.5" />
                            ) : impact.direction === "negative" ? (
                              <TrendingDownIcon className="w-3.5 h-3.5" />
                            ) : null}
                            {impact.change}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Widget>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
