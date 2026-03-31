"use client"

import { useEffect, useState } from "react"
import { Music, Sparkles } from "lucide-react"
import type { UserProfile } from "@/lib/types"

interface MusicStudioProps {
  userProfile: UserProfile | null
  onCustomize?: (setting: string, value: any) => void
  showcaseMode?: boolean
  onGetCreative?: () => void
}

export default function MusicStudio({
  userProfile,
  onCustomize,
  showcaseMode = false,
  onGetCreative,
}: MusicStudioProps) {
  const [tips, setTips] = useState<string[]>([])
  const [isLoadingTips, setIsLoadingTips] = useState(false)
  const [showTips, setShowTips] = useState(false)

  useEffect(() => {
    if (showcaseMode) {
      setTips([
        "Practice scales daily to build muscle memory and finger dexterity",
        "Use a metronome to develop consistent timing and rhythm",
        "Record yourself playing to identify areas for improvement",
        "Learn songs you love - passion fuels progress",
        "Take breaks to prevent fatigue and maintain focus",
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
        body: JSON.stringify({ studioType: "music", userProfile }),
      })
      const data = await response.json()
      setTips(data.tips || [])
    } catch (error) {
      console.error("[v0] Failed to fetch music tips:", error)
    } finally {
      setIsLoadingTips(false)
    }
  }

  return (
    <div className="relative w-full h-full">
      {showcaseMode && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 animate-fadeIn">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-purple-400/50 rounded-full px-6 py-3 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <p className="text-purple-300 text-sm font-semibold">Here's a glimpse of what's possible</p>
          </div>
        </div>
      )}

      {/* 3D-style guitar hologram */}
      <div className="absolute top-20 right-20 w-64 h-96 opacity-30 animate-float">
        <div className="relative w-full h-full">
          {/* Guitar body */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-32 h-40 rounded-[50%] border-4 border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm" />
          {/* Guitar neck */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-48 bg-gradient-to-b from-purple-400/40 to-purple-600/40 rounded-lg" />
          {/* Strings */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute top-0 h-48 w-px bg-purple-300/60"
              style={{ left: `calc(50% - 12px + ${i * 4}px)` }}
            />
          ))}
        </div>
      </div>

      {/* Mixing board hologram */}
      <div className="absolute bottom-32 left-20 w-80 h-48 opacity-40">
        <div className="relative w-full h-full border-2 border-pink-400/40 rounded-lg bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm p-4">
          {/* Faders */}
          <div className="flex gap-4 h-full items-end">
            {[60, 80, 40, 90, 50, 70].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-purple-500/20 rounded-full" style={{ height: `${height}%` }}>
                  <div className="w-full h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
                </div>
                <div className="w-6 h-6 rounded-full bg-purple-400/60" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Famous bands holograms */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full border-2 border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 hover:border-purple-400">
            <Music className="w-12 h-12 text-purple-400" />
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-purple-300 font-semibold">The Beatles</p>
          </div>
        </div>
      </div>

      <div className="absolute top-1/3 right-1/3">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full border-2 border-pink-400/50 bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 hover:border-pink-400">
            <Music className="w-12 h-12 text-pink-400" />
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-pink-300 font-semibold">Pink Floyd</p>
          </div>
        </div>
      </div>

      {/* Practice tips panel */}
      <div className="absolute bottom-8 right-8 w-96">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full mb-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-lg text-purple-300 text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {showTips ? "Hide" : "Show"} Practice Tips
        </button>

        {showTips && (
          <div className="bg-black/60 backdrop-blur-md border border-purple-400/30 rounded-lg p-4 space-y-3 animate-fadeIn">
            <h3 className="text-purple-300 font-semibold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {showcaseMode ? "Demo Tips" : "AI-Powered Tips"}
            </h3>
            {isLoadingTips && !showcaseMode ? (
              <p className="text-purple-200/60 text-xs">Loading personalized tips...</p>
            ) : (
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="text-purple-100 text-xs leading-relaxed flex gap-2">
                    <span className="text-purple-400 font-bold">{i + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
            {!showcaseMode && (
              <button
                onClick={fetchTips}
                className="w-full mt-2 px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded text-purple-300 text-xs transition-all"
              >
                Refresh Tips
              </button>
            )}
          </div>
        )}
      </div>

      {/* Integration preview - Calendar link */}
      <div className="absolute top-8 left-8 w-64">
        <div className="bg-black/60 backdrop-blur-md border border-purple-400/30 rounded-lg p-4">
          <h4 className="text-purple-300 font-semibold text-sm mb-2">Practice Schedule</h4>
          <p className="text-purple-200/60 text-xs mb-3">Set up regular practice sessions</p>
          <button className="w-full px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded text-purple-300 text-xs font-semibold transition-all">
            Link Calendar
          </button>
        </div>
      </div>

      {showcaseMode && (
        <div className="absolute bottom-8 left-8 animate-fadeIn" style={{ animationDelay: "500ms" }}>
          <button
            onClick={onGetCreative}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full hover:scale-110 transition-all shadow-lg hover:shadow-purple-500/50 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Now it's your turn — start creating music!
          </button>
        </div>
      )}
    </div>
  )
}
