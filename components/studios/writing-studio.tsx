"use client"

import { useEffect, useState } from "react"
import { Sparkles, BookOpen } from "lucide-react"
import type { UserProfile } from "@/lib/types"

interface WritingStudioProps {
  userProfile: UserProfile | null
  onCustomize?: (setting: string, value: any) => void
  showcaseMode?: boolean
  onGetCreative?: () => void
}

export default function WritingStudio({
  userProfile,
  onCustomize,
  showcaseMode = false,
  onGetCreative,
}: WritingStudioProps) {
  const [tips, setTips] = useState<string[]>([])
  const [isLoadingTips, setIsLoadingTips] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)

  const demoWritingSamples = [
    {
      genre: "Poetry",
      title: "Digital Dreams",
      excerpt: "In circuits deep and data streams,\nWhere silicon meets human dreams...",
      color: "from-violet-500/20 to-purple-500/20",
      border: "violet-400/50",
    },
    {
      genre: "Fiction",
      title: "The Last Upload",
      excerpt: "She pressed the button, and her consciousness began its journey into the cloud...",
      color: "from-blue-500/20 to-cyan-500/20",
      border: "blue-400/50",
    },
    {
      genre: "Non-Fiction",
      title: "The Art of Focus",
      excerpt: "In an age of infinite distraction, the ability to concentrate has become a superpower...",
      color: "from-amber-500/20 to-orange-500/20",
      border: "amber-400/50",
    },
  ]

  useEffect(() => {
    if (showcaseMode) {
      setTips([
        "Write every day, even if it's just for 10 minutes",
        "Read widely in your genre to understand conventions",
        "Show, don't tell - use vivid details and sensory language",
        "First drafts are meant to be messy - just get words on the page",
        "Read your work aloud to catch awkward phrasing",
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
        body: JSON.stringify({ studioType: "writing", userProfile }),
      })
      const data = await response.json()
      setTips(data.tips || [])
    } catch (error) {
      console.error("[v0] Failed to fetch writing tips:", error)
    } finally {
      setIsLoadingTips(false)
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Showcase banner */}
      {showcaseMode && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 animate-fadeIn">
          <div className="bg-gradient-to-r from-violet-500/20 to-blue-500/20 backdrop-blur-md border border-violet-400/50 rounded-full px-6 py-3 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
            <p className="text-violet-300 text-sm font-semibold">Discover your creative voice</p>
          </div>
        </div>
      )}

      {/* Holographic typewriter */}
      <div className="absolute top-20 right-20 w-64 h-48 opacity-40 animate-float">
        <div className="relative w-full h-full">
          {/* Typewriter body */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 rounded-lg border-2 border-violet-400/50 bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-sm">
            {/* Keys */}
            <div className="absolute bottom-2 left-4 right-4 grid grid-cols-8 gap-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-sm bg-violet-400/40" />
              ))}
            </div>
          </div>
          {/* Paper */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-40 bg-gradient-to-b from-white/20 to-white/10 border border-violet-400/30 rounded-sm">
            <div className="p-2 space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-1 bg-violet-400/30 rounded"
                  style={{ width: `${60 + Math.random() * 40}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quill and ink hologram */}
      <div className="absolute bottom-32 left-20 w-32 h-32 opacity-40">
        <div className="relative w-full h-full">
          {/* Ink bottle */}
          <div className="absolute bottom-0 left-0 w-16 h-20 bg-gradient-to-br from-violet-500/30 to-purple-500/30 border-2 border-violet-400/40 rounded-lg" />
          {/* Quill */}
          <div className="absolute top-0 right-0 w-20 h-24 rotate-45">
            <div className="w-2 h-16 bg-gradient-to-b from-violet-400/40 to-violet-600/40 rounded-full" />
            <div className="absolute top-0 left-0 w-12 h-8 bg-gradient-to-br from-violet-400/30 to-purple-400/30 rounded-full transform -rotate-12" />
          </div>
        </div>
      </div>

      {/* Writing samples showcase */}
      <div className="absolute top-8 left-8 w-96">
        <div className="bg-black/60 backdrop-blur-md border border-violet-400/30 rounded-lg p-4">
          <h4 className="text-violet-300 font-semibold text-sm mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {showcaseMode ? "Demo Writing Samples" : "Your Writing Portfolio"}
          </h4>
          <div className="space-y-3">
            {demoWritingSamples.map((sample, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${sample.color} border border-${sample.border} rounded-lg p-3 hover:scale-105 transition-all cursor-pointer`}
                onClick={() => setSelectedGenre(sample.genre)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-violet-300">{sample.genre}</span>
                  <Sparkles className="w-3 h-3 text-violet-400" />
                </div>
                <h5 className="text-white text-sm font-semibold mb-1">{sample.title}</h5>
                <p className="text-violet-100 text-xs italic leading-relaxed">{sample.excerpt}</p>
              </div>
            ))}
          </div>
          {showcaseMode && (
            <button
              onClick={onGetCreative}
              className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Start Your Story
            </button>
          )}
        </div>
      </div>

      {/* Famous authors inspiration */}
      <div className="absolute top-1/2 right-1/3 -translate-y-1/2">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-lg border-2 border-violet-400/50 bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 hover:border-violet-400">
            <BookOpen className="w-12 h-12 text-violet-400" />
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-violet-300 font-semibold">Maya Angelou</p>
          </div>
        </div>
      </div>

      {/* Genre gallery */}
      <div className="absolute bottom-32 right-20 w-64">
        <div className="bg-black/60 backdrop-blur-md border border-violet-400/30 rounded-lg p-4">
          <h4 className="text-violet-300 font-semibold text-sm mb-3">Explore Genres</h4>
          <div className="grid grid-cols-2 gap-2">
            {["Poetry", "Fiction", "Non-Fiction", "Memoir", "Fantasy", "Sci-Fi"].map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedGenre === genre
                    ? "bg-violet-500 text-white"
                    : "bg-violet-500/20 text-violet-300 hover:bg-violet-500/30"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Writing tips panel */}
      <div className="absolute bottom-8 left-8 w-96">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full mb-2 px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-400/50 rounded-lg text-violet-300 text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {showTips ? "Hide" : "Show"} Writing Tips
        </button>

        {showTips && (
          <div className="bg-black/60 backdrop-blur-md border border-violet-400/30 rounded-lg p-4 space-y-3 animate-fadeIn">
            <h3 className="text-violet-300 font-semibold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {showcaseMode ? "Demo Tips" : "AI-Powered Tips"}
            </h3>
            {isLoadingTips && !showcaseMode ? (
              <p className="text-violet-200/60 text-xs">Loading personalized tips...</p>
            ) : (
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="text-violet-100 text-xs leading-relaxed flex gap-2">
                    <span className="text-violet-400 font-bold">{i + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
            {!showcaseMode && (
              <button
                onClick={fetchTips}
                className="w-full mt-2 px-3 py-1 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-400/30 rounded text-violet-300 text-xs transition-all"
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
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold rounded-full hover:scale-110 transition-all shadow-lg hover:shadow-violet-500/50 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Make it yours — start writing today!
          </button>
        </div>
      )}
    </div>
  )
}
