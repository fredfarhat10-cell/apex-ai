"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Brain } from "lucide-react"
import { getActivePersonality } from "@/lib/personality-engine"
import type { PersonalityProfile } from "@/lib/types/personality"

export function PersonalityIndicator() {
  const [personality, setPersonality] = useState<PersonalityProfile | null>(null)

  useEffect(() => {
    loadPersonality()
  }, [])

  const loadPersonality = async () => {
    const active = await getActivePersonality()
    setPersonality(active)
  }

  if (!personality) return null

  return (
    <Badge variant="outline" className="gap-2">
      <Brain className="h-3 w-3" />
      {personality.name}
    </Badge>
  )
}
