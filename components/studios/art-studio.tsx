"use client"

import { useEffect, useState } from "react"
import { PaintBrushIcon, SparklesIcon } from "@heroicons/react/24/solid"
import type { UserProfile } from "@/lib/types"

interface ArtStudioProps {
  userProfile: UserProfile | null
  onCustomize?: (setting: string, value: any) => void
}

export default function ArtStudio({ userProfile, onCustomize }: ArtStudioProps) {
  const [tips, setTips] = useState<string[]>([])
  const [isLoadingTips, setIsLoadingTips] = useState(false)
  const [showTips, setShowTips] = useState(false)

  useEffect(() => {
    fetchTips()
  }, [])

  const fetchTips = async () => {
    setIsLoadingTips(true)
    try {
      const response = await fetch("/api/ai/studio-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studioType: "art", userProfile }),
      })
      const data = await response.json()
      setTips(data.tips || [])
    } catch (error) {
      console.error("[v0] Failed to fetch art tips:", error)
    } finally {
      setIsLoadingTips(false)
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Easel hologram */}
      <div className="absolute top-20 left-1/4 w-48 h-64 opacity-40 animate-float">
        <div className="relative w-full h-full">
          {/* Canvas */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-40 h-48 border-4 border-orange-400/50 bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-sm">
            {/* Paint strokes */}
            <div className="absolute top-4 left-4 w-16 h-2 bg-orange-400/60 rounded-full rotate-12" />
            <div className="absolute top-12 right-6 w-20 h-3 bg-amber-400/60 rounded-full -rotate-6" />
            <div className="absolute bottom-8 left-8 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400/40 to-pink-400/40" />
          </div>
          {/* Easel legs */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-32 bg-amber-600/40" />
          <div className="absolute bottom-0 left-1/4 w-2 h-24 bg-amber-600/40 rotate-12" />
          <div className="absolute bottom-0 right-1/4 w-2 h-24 bg-amber-600/40 -rotate-12" />
        </div>
      </div>

      {/* Art supplies shelf */}
      <div className="absolute bottom-32 right-20 w-64 h-40 opacity-40">
        <div className="relative w-full h-full border-2 border-orange-400/40 rounded-lg bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-sm p-4">
          {/* Shelves */}
          <div className="space-y-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-8 rounded bg-gradient-to-b from-orange-400/40 to-amber-400/40"
                  style={{ height: `${20 + i * 4}px` }}
                />
              ))}
            </div>
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400/50 to-pink-400/50" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trending artists */}
      <div className="absolute top-1/3 right-1/4">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-lg border-2 border-orange-400/50 bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 hover:border-orange-400">
            <PaintBrushIcon className="w-12 h-12 text-orange-400" />
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-orange-300 font-semibold">Van Gogh</p>
          </div>
        </div>
      </div>

      {/* Inspiration gallery */}
      <div className="absolute top-8 right-8 w-80">
        <div className="bg-black/60 backdrop-blur-md border border-orange-400/30 rounded-lg p-4">
          <h4 className="text-orange-300 font-semibold text-sm mb-3 flex items-center gap-2">
            <SparklesIcon className="w-4 h-4" />
            Inspiration Gallery
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square rounded bg-gradient-to-br from-orange-400/30 to-amber-400/30 border border-orange-400/40 hover:scale-105 transition-transform cursor-pointer"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Practice tips panel */}
      <div className="absolute bottom-8 left-8 w-96">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full mb-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/50 rounded-lg text-orange-300 text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <SparklesIcon className="w-4 h-4" />
          {showTips ? "Hide" : "Show"} Creative Tips
        </button>

        {showTips && (
          <div className="bg-black/60 backdrop-blur-md border border-orange-400/30 rounded-lg p-4 space-y-3 animate-fadeIn">
            <h3 className="text-orange-300 font-semibold text-sm flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              AI-Powered Tips
            </h3>
            {isLoadingTips ? (
              <p className="text-orange-200/60 text-xs">Loading personalized tips...</p>
            ) : (
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="text-orange-100 text-xs leading-relaxed flex gap-2">
                    <span className="text-orange-400 font-bold">{i + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={fetchTips}
              className="w-full mt-2 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 rounded text-orange-300 text-xs transition-all"
            >
              Refresh Tips
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
