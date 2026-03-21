"use client"

import { useVault } from "@/lib/vault-context"
import { TrendingUpIcon, FlameIcon, TrophyIcon } from "./icons"
import { useEffect, useState } from "react"

export default function HabitStreaks() {
  const { habits, habitLogs } = useVault()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted")
    }
  }, [])

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setNotificationsEnabled(permission === "granted")
    }
  }

  const calculateStreak = (habitId: string): number => {
    const logs = habitLogs
      .filter((log) => log.habitId === habitId && log.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (logs.length === 0) return 0

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].date)
      logDate.setHours(0, 0, 0, 0)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      if (logDate.getTime() === expectedDate.getTime()) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const getStreakBadge = (streak: number) => {
    if (streak >= 30) return { icon: <TrophyIcon className="w-5 h-5" />, color: "text-yellow-400", label: "Legend" }
    if (streak >= 14) return { icon: <FlameIcon className="w-5 h-5" />, color: "text-orange-400", label: "On Fire" }
    if (streak >= 7) return { icon: <TrendingUpIcon className="w-5 h-5" />, color: "text-green-400", label: "Strong" }
    return null
  }

  const habitsWithStreaks = habits.map((habit) => ({
    ...habit,
    streak: calculateStreak(habit.id),
  }))

  const topStreak = Math.max(...habitsWithStreaks.map((h) => h.streak), 0)

  return (
    <div className="bg-apex-dark border border-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FlameIcon className="w-5 h-5 text-orange-400" />
          Habit Streaks
        </h3>
        {!notificationsEnabled && (
          <button
            onClick={requestNotificationPermission}
            className="text-xs bg-apex-accent text-apex-darker px-3 py-1 rounded-md hover:opacity-90"
          >
            Enable Reminders
          </button>
        )}
      </div>

      {topStreak > 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-lg p-3">
          <p className="text-sm text-white font-semibold">Longest Streak: {topStreak} days!</p>
          <p className="text-xs text-apex-gray mt-1">Keep up the amazing work!</p>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {habitsWithStreaks.length === 0 ? (
          <p className="text-apex-gray text-sm text-center py-4">No habits tracked yet</p>
        ) : (
          habitsWithStreaks.map((habit) => {
            const badge = getStreakBadge(habit.streak)
            return (
              <div key={habit.id} className="flex items-center justify-between p-2 bg-apex-darker rounded-md">
                <div className="flex items-center gap-2">
                  {badge && <span className={badge.color}>{badge.icon}</span>}
                  <span className="text-sm text-white">{habit.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {badge && <span className="text-xs text-apex-gray">{badge.label}</span>}
                  <span className="text-sm font-semibold text-apex-accent">{habit.streak} days</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
