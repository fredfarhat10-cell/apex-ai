interface ApexStats {
  conversationsCompleted: number
  daysActive: number[]
  favoriteMode: string | null
  lastVisit: string
  totalInteractions: number
  scenariosCompleted: string[]
}

const STATS_KEY = "apex_user_stats"

export function getApexStats(): ApexStats {
  if (typeof window === "undefined") {
    return getDefaultStats()
  }

  const stored = localStorage.getItem(STATS_KEY)
  if (!stored) {
    return getDefaultStats()
  }

  try {
    return JSON.parse(stored)
  } catch {
    return getDefaultStats()
  }
}

function getDefaultStats(): ApexStats {
  return {
    conversationsCompleted: 0,
    daysActive: [],
    favoriteMode: null,
    lastVisit: new Date().toISOString(),
    totalInteractions: 0,
    scenariosCompleted: [],
  }
}

export function updateApexStats(updates: Partial<ApexStats>) {
  if (typeof window === "undefined") return

  const current = getApexStats()
  const updated = { ...current, ...updates }

  // Track days active
  const today = new Date().toISOString().split("T")[0]
  if (!updated.daysActive.includes(today)) {
    updated.daysActive = [...updated.daysActive, today]
  }

  updated.lastVisit = new Date().toISOString()

  localStorage.setItem(STATS_KEY, JSON.stringify(updated))
}

export function incrementConversations() {
  const stats = getApexStats()
  updateApexStats({
    conversationsCompleted: stats.conversationsCompleted + 1,
    totalInteractions: stats.totalInteractions + 1,
  })
}

export function trackScenarioCompletion(scenarioId: string) {
  const stats = getApexStats()
  if (!stats.scenariosCompleted.includes(scenarioId)) {
    updateApexStats({
      scenariosCompleted: [...stats.scenariosCompleted, scenarioId],
    })
  }

  // Update favorite mode
  const modeCounts: Record<string, number> = {}
  stats.scenariosCompleted.forEach((id) => {
    modeCounts[id] = (modeCounts[id] || 0) + 1
  })
  modeCounts[scenarioId] = (modeCounts[scenarioId] || 0) + 1

  const favoriteMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  updateApexStats({
    favoriteMode,
  })
}

export function getStreakDays(): number {
  const stats = getApexStats()
  const sortedDays = stats.daysActive.sort().reverse()

  if (sortedDays.length === 0) return 0

  let streak = 1
  const today = new Date().toISOString().split("T")[0]

  // Check if today is included
  if (sortedDays[0] !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    if (sortedDays[0] !== yesterday) return 0
  }

  for (let i = 1; i < sortedDays.length; i++) {
    const current = new Date(sortedDays[i - 1])
    const previous = new Date(sortedDays[i])
    const diffDays = Math.floor((current.getTime() - previous.getTime()) / 86400000)

    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export function clearApexStats() {
  if (typeof window === "undefined") return
  localStorage.removeItem(STATS_KEY)
}
