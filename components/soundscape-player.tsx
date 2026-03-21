"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SoundscapeGenerator } from "@/lib/audio-generator"
import { useVault } from "@/lib/vault-context"
import { PlayIcon, PauseIcon, Volume2Icon } from "./icons"

export function SoundscapePlayer() {
  const { aura } = useVault()
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const generatorRef = useRef<SoundscapeGenerator | null>(null)

  useEffect(() => {
    generatorRef.current = new SoundscapeGenerator()

    return () => {
      generatorRef.current?.dispose()
    }
  }, [])

  const handleTogglePlay = async () => {
    if (!generatorRef.current) return

    if (isPlaying) {
      generatorRef.current.stop()
      setIsPlaying(false)
    } else {
      try {
        await generatorRef.current.play({ aura, volume })
        setIsPlaying(true)
      } catch (error) {
        console.error("[v0] Soundscape error:", error)
      }
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    generatorRef.current?.setVolume(newVolume)
  }

  const auraDescriptions: Record<string, string> = {
    Neutral: "Balanced ambient tones",
    Focused: "Clear, structured frequencies for concentration",
    Creative: "Uplifting harmonies to inspire innovation",
    Stressed: "Calming solfeggio frequencies",
    Energized: "Bright, energetic soundscape",
    Tired: "Restful low frequencies for relaxation",
  }

  return (
    <Card className="p-6 bg-apex-dark border-apex-primary/20">
      <h3 className="text-lg font-semibold text-apex-light mb-2 flex items-center gap-2">
        <Volume2Icon className="text-apex-primary" />
        Aura Soundscape
      </h3>
      <p className="text-sm text-apex-gray mb-4">
        {auraDescriptions[aura]} - Generated procedurally based on your current state.
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button onClick={handleTogglePlay} size="sm" className="flex-shrink-0">
            {isPlaying ? (
              <>
                <PauseIcon className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4 mr-2" />
                Play
              </>
            )}
          </Button>

          <div className="flex-1 flex items-center gap-2">
            <Volume2Icon className="w-4 h-4 text-apex-gray" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-apex-darker rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${volume * 100}%, #1e293b ${volume * 100}%, #1e293b 100%)`,
              }}
            />
            <span className="text-xs text-apex-gray w-8">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        <div className="text-xs text-apex-gray">
          Current Aura: <span className="text-apex-accent font-semibold">{aura}</span>
        </div>
      </div>
    </Card>
  )
}
