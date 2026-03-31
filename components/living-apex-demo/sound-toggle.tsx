"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"
import { isSoundEnabled, toggleSound } from "@/lib/sound-manager"

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(isSoundEnabled())
  }, [])

  const handleToggle = () => {
    const newState = toggleSound()
    setEnabled(newState)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="text-apex-gray hover:text-apex-primary transition-colors"
      aria-label={enabled ? "Disable sound effects" : "Enable sound effects"}
      title={enabled ? "Sound On" : "Sound Off"}
    >
      {enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </Button>
  )
}
