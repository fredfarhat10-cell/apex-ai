"use client"

import { TrophyIcon, FlameIcon, StarIcon, ZapIcon } from "./icons"

interface Badge {
  id: string
  name: string
  description: string
  icon: "trophy" | "flame" | "star" | "zap"
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

interface GamificationBadgesProps {
  badges: Badge[]
}

export function GamificationBadges({ badges }: GamificationBadgesProps) {
  const getIcon = (icon: Badge["icon"]) => {
    const iconClass = "w-8 h-8"
    switch (icon) {
      case "trophy":
        return <TrophyIcon className={iconClass} />
      case "flame":
        return <FlameIcon className={iconClass} />
      case "star":
        return <StarIcon className={iconClass} />
      case "zap":
        return <ZapIcon className={iconClass} />
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`relative p-4 rounded-lg border transition-all ${
            badge.unlocked
              ? "bg-gradient-to-br from-apex-primary/20 to-apex-accent/20 border-apex-primary/50 shadow-lg shadow-apex-primary/20"
              : "bg-apex-dark/50 border-gray-800 opacity-50"
          }`}
          role="article"
          aria-label={`${badge.name} badge ${badge.unlocked ? "unlocked" : "locked"}`}
        >
          {badge.unlocked && (
            <div className="absolute -top-2 -right-2 bg-apex-primary text-white text-xs px-2 py-1 rounded-full animate-bounce">
              ✓
            </div>
          )}

          <div className={`mb-3 ${badge.unlocked ? "text-apex-primary" : "text-gray-600"}`}>{getIcon(badge.icon)}</div>

          <h4 className="font-semibold text-white mb-1">{badge.name}</h4>
          <p className="text-xs text-apex-gray mb-2">{badge.description}</p>

          {badge.progress !== undefined && badge.maxProgress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-apex-gray mb-1">
                <span>Progress</span>
                <span>
                  {badge.progress}/{badge.maxProgress}
                </span>
              </div>
              <div className="h-1.5 bg-apex-darker rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-apex-primary to-apex-accent transition-all duration-500"
                  style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                  role="progressbar"
                  aria-valuenow={badge.progress}
                  aria-valuemin={0}
                  aria-valuemax={badge.maxProgress}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
