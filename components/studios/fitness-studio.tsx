"use client"

import { useEffect, useState } from "react"
import { SparklesIcon } from "@heroicons/react/24/solid"
import { HeartIcon } from "../icons"
import type { UserProfile } from "@/lib/types"

interface FitnessStudioProps {
  userProfile: UserProfile | null
  onCustomize?: (setting: string, value: any) => void
  showcaseMode?: boolean
  onGetCreative?: () => void
}

export default function FitnessStudio({
  userProfile,
  onCustomize,
  showcaseMode = false,
  onGetCreative,
}: FitnessStudioProps) {
  const [tips, setTips] = useState<string[]>([])
  const [isLoadingTips, setIsLoadingTips] = useState(false)
  const [showTips, setShowTips] = useState(false)

  useEffect(() => {
    if (showcaseMode) {
      // Pre-load demo tips for showcase
      setTips([
        "Start with a 5-minute warm-up to prevent injuries",
        "Focus on form over speed - quality reps build strength",
        "Stay hydrated: drink water before, during, and after workouts",
        "Rest days are crucial for muscle recovery and growth",
        "Track your progress to stay motivated and see improvements",
      ])
    } else {
      fetchTips()
    }
  }, [showcaseMode])

  const fetchTips = async () => {
    setIsLoadingTips(true)
    try {
      const response = await fetch("/api/ai/studio-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studioType: "fitness", userProfile }),
      })
      const data = await response.json()
      setTips(data.tips || [])
    } catch (error) {
      console.error("[v0] Failed to fetch fitness tips:", error)
    } finally {
      setIsLoadingTips(false)
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Showcase banner */}
      {showcaseMode && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 animate-fadeIn">
          <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-md border border-emerald-400/50 rounded-full px-6 py-3 flex items-center gap-3">
            <SparklesIcon className="w-5 h-5 text-emerald-400 animate-pulse" />
            <p className="text-emerald-300 text-sm font-semibold">Here's a glimpse of what's possible</p>
          </div>
        </div>
      )}

      {/* Holographic dumbbells */}
      <div className="absolute top-32 left-20 w-48 h-32 opacity-40 animate-float">
        <div className="relative w-full h-full">
          {/* Left dumbbell */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/40 to-cyan-500/40 border-2 border-emerald-400/50" />
            <div className="w-16 h-4 bg-gradient-to-r from-emerald-400/40 to-cyan-400/40 rounded-full" />
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/40 to-cyan-500/40 border-2 border-emerald-400/50" />
          </div>
        </div>
      </div>

      {/* Holographic treadmill */}
      <div className="absolute bottom-32 right-20 w-64 h-40 opacity-40">
        <div className="relative w-full h-full border-2 border-emerald-400/40 rounded-lg bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 backdrop-blur-sm p-4">
          {/* Treadmill belt */}
          <div className="absolute bottom-4 left-4 right-4 h-16 bg-gradient-to-r from-emerald-400/30 to-cyan-400/30 rounded-lg overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          </div>
          {/* Control panel */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-12 bg-emerald-500/20 rounded border border-emerald-400/40 flex items-center justify-center">
            <div className="text-emerald-400 text-xs font-mono">5.0 MPH</div>
          </div>
        </div>
      </div>

      {/* Yoga mat hologram */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-32 h-48 opacity-40">
        <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border-2 border-cyan-400/50 rounded-lg backdrop-blur-sm" />
      </div>

      {/* Workout routine showcase */}
      <div className="absolute top-8 right-8 w-80">
        <div className="bg-black/60 backdrop-blur-md border border-emerald-400/30 rounded-lg p-4">
          <h4 className="text-emerald-300 font-semibold text-sm mb-3 flex items-center gap-2">
            <HeartIcon className="w-4 h-4" />
            {showcaseMode ? "Demo Workout Routine" : "Your Workout Plan"}
          </h4>
          <div className="space-y-2">
            {[
              "Push-ups: 3 sets × 12 reps",
              "Squats: 3 sets × 15 reps",
              "Plank: 3 sets × 30 sec",
              "Lunges: 3 sets × 10 reps",
            ].map((exercise, i) => (
              <div
                key={i}
                className="bg-emerald-500/10 border border-emerald-400/20 rounded p-2 text-emerald-100 text-xs hover:bg-emerald-500/20 transition-colors cursor-pointer"
              >
                {exercise}
              </div>
            ))}
          </div>
          {showcaseMode && (
            <button
              onClick={onGetCreative}
              className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <SparklesIcon className="w-4 h-4" />
              Customize Your Routine
            </button>
          )}
        </div>
      </div>

      {/* Famous athletes inspiration */}
      <div className="absolute top-1/3 left-1/3">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full border-2 border-emerald-400/50 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 hover:border-emerald-400">
            <HeartIcon className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-emerald-300 font-semibold">Serena Williams</p>
          </div>
        </div>
      </div>

      {/* Training tips panel */}
      <div className="absolute bottom-8 left-8 w-96">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full mb-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 rounded-lg text-emerald-300 text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <SparklesIcon className="w-4 h-4" />
          {showTips ? "Hide" : "Show"} Training Tips
        </button>

        {showTips && (
          <div className="bg-black/60 backdrop-blur-md border border-emerald-400/30 rounded-lg p-4 space-y-3 animate-fadeIn">
            <h3 className="text-emerald-300 font-semibold text-sm flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              {showcaseMode ? "Demo Tips" : "AI-Powered Tips"}
            </h3>
            {isLoadingTips && !showcaseMode ? (
              <p className="text-emerald-200/60 text-xs">Loading personalized tips...</p>
            ) : (
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="text-emerald-100 text-xs leading-relaxed flex gap-2">
                    <span className="text-emerald-400 font-bold">{i + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
            {!showcaseMode && (
              <button
                onClick={fetchTips}
                className="w-full mt-2 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded text-emerald-300 text-xs transition-all"
              >
                Refresh Tips
              </button>
            )}
          </div>
        )}
      </div>

      {/* Get Creative CTA for showcase mode */}
      {showcaseMode && (
        <div className="absolute bottom-8 right-8 animate-fadeIn" style={{ animationDelay: "500ms" }}>
          <button
            onClick={onGetCreative}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-full hover:scale-110 transition-all shadow-lg hover:shadow-emerald-500/50 flex items-center gap-2"
          >
            <SparklesIcon className="w-5 h-5" />
            Now it's your turn — customize your training!
          </button>
        </div>
      )}
    </div>
  )
}
