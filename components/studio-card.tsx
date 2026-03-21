"use client"

import type { Studio } from "@/lib/types/studio"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Award } from "lucide-react"

interface StudioCardProps {
  studio: Studio
  onClick: () => void
}

export function StudioCard({ studio, onClick }: StudioCardProps) {
  const achievedMilestones = studio.progress.milestones.filter((m) => m.achieved).length
  const totalMilestones = studio.progress.milestones.length

  return (
    <Card className="cursor-pointer hover:scale-105 transition-transform overflow-hidden group" onClick={onClick}>
      <div className="relative h-48 overflow-hidden">
        <img
          src={studio.backgroundImage || "/placeholder.svg"}
          alt={studio.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white mb-1">{studio.name}</h3>
          <Badge variant="secondary">{studio.skillLevel}</Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{studio.progress.sessionsLogged} sessions</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Award className="w-4 h-4" />
            <span>
              {achievedMilestones}/{totalMilestones} milestones
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{studio.progress.skillProgression}%</span>
          </div>
          <Progress value={studio.progress.skillProgression} />
        </div>

        {studio.progress.lastSession && (
          <p className="text-xs text-muted-foreground">
            Last session: {new Date(studio.progress.lastSession).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
