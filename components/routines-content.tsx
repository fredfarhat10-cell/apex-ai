"use client"

import { useState, useEffect } from "react"
import { useVault } from "@/lib/vault-context"
import type { Habit, HabitLog } from "@/lib/types"
import Widget from "./widget"
import { RepeatIcon, PlusIcon, SparklesIcon, CheckSquareIcon, SquareIcon, TrophyIcon, BellIcon } from "./icons"
import { generateSymbiontEvent } from "@/lib/symbiont-utils"
import { StreakCalculator } from "@/lib/streak-calculator"
import { NotificationManager } from "@/lib/notification-manager"
import { Button } from "@/components/ui/button"

export default function RoutinesContent() {
  const { habits, habitLogs, strategicGoal, userProfile, updateState, symbiontFeed } = useVault()
  const [newHabitName, setNewHabitName] = useState("")
  const [suggestedHabit, setSuggestedHabit] = useState("")
  const [dailyFeedback, setDailyFeedback] = useState("")
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [streaks, setStreaks] = useState<ReturnType<typeof StreakCalculator.calculateAllStreaks>>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  const todayStr = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const habitIds = habits.map((h) => h.id)
    const calculatedStreaks = StreakCalculator.calculateAllStreaks(habitIds, habitLogs)
    setStreaks(calculatedStreaks)

    if (notificationsEnabled) {
      calculatedStreaks.forEach((streak) => {
        if (StreakCalculator.shouldNotifyStreak(streak)) {
          const habit = habits.find((h) => h.id === streak.habitId)
          if (habit) {
            NotificationManager.send("Streak Alert!", {
              body: `Don't break your ${streak.currentStreak}-day streak for "${habit.name}"!`,
              tag: `streak-${habit.id}`,
            })
          }
        }
      })
    }
  }, [habits, habitLogs, notificationsEnabled])

  const handleEnableNotifications = async () => {
    const granted = await NotificationManager.requestPermission()
    setNotificationsEnabled(granted)
    if (granted) {
      NotificationManager.scheduleDailyReminder(9, 0, "Time to check your daily habits!")
    }
  }

  const handleAddHabit = async () => {
    if (!newHabitName) return
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      goal: "Daily",
      createdAt: new Date().toISOString(),
    }
    updateState("habits", [...habits, newHabit])
    setNewHabitName("")

    const event = await generateSymbiontEvent(
      `Added new habit: "${newHabitName}"`,
      {
        habitCount: habits.length + 1,
        strategicGoal,
      },
      userProfile,
    )
    updateState("symbiontFeed", [event, ...symbiontFeed])
  }

  const toggleHabit = async (habitId: string) => {
    const existingLogIndex = habitLogs.findIndex((log) => log.habitId === habitId && log.date === todayStr)
    let newLogs: HabitLog[]
    let wasCompleted = false

    if (existingLogIndex > -1) {
      wasCompleted = habitLogs[existingLogIndex].completed
      newLogs = habitLogs.map((log, index) =>
        index === existingLogIndex ? { ...log, completed: !log.completed } : log,
      )
    } else {
      const newLog: HabitLog = { id: Date.now().toString(), habitId, date: todayStr, completed: true }
      newLogs = [...habitLogs, newLog]
    }
    updateState("habitLogs", newLogs)

    if (!wasCompleted) {
      const habit = habits.find((h) => h.id === habitId)
      if (habit) {
        const completedToday = newLogs.filter((log) => log.date === todayStr && log.completed).length
        const event = await generateSymbiontEvent(
          `Completed habit: "${habit.name}"`,
          {
            habitName: habit.name,
            completedToday,
            totalHabits: habits.length,
          },
          userProfile,
        )
        updateState("symbiontFeed", [event, ...symbiontFeed])
      }
    }
  }

  const handleSuggestHabit = async () => {
    setLoadingSuggestion(true)
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Based on this strategic goal: "${strategicGoal}", suggest one new habit that would help achieve it. Current habits: ${habits.map((h) => h.name).join(", ")}. Respond with just the habit name, nothing else.`,
        }),
      })
      const data = await response.json()
      setSuggestedHabit(data.text)
    } catch (error) {
      console.error("[v0] Habit suggestion error:", error)
    } finally {
      setLoadingSuggestion(false)
    }
  }

  const handleGenerateFeedback = async () => {
    if (!userProfile) return
    setLoadingFeedback(true)
    try {
      const todaysLogs = habits.map((h) => {
        const log = habitLogs.find((l) => l.habitId === h.id && l.date === todayStr)
        return { habitName: h.name, completed: !!log?.completed }
      })

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Provide encouraging feedback on today's habit completion for ${userProfile.name}. Habits: ${todaysLogs.map((l) => `${l.habitName} (${l.completed ? "✓" : "✗"})`).join(", ")}. Keep it brief and motivating.`,
        }),
      })
      const data = await response.json()
      setDailyFeedback(data.text)
    } catch (error) {
      console.error("[v0] Feedback generation error:", error)
    } finally {
      setLoadingFeedback(false)
    }
  }

  const isCompleted = (habitId: string) => {
    return habitLogs.some((log) => log.habitId === habitId && log.date === todayStr && log.completed)
  }

  const getStreak = (habitId: string) => {
    return streaks.find((s) => s.habitId === habitId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <RepeatIcon className="w-8 h-8" /> Routines & Habits
          </h1>
        </div>
        <Button
          onClick={handleEnableNotifications}
          disabled={notificationsEnabled}
          variant={notificationsEnabled ? "secondary" : "default"}
          className="flex items-center gap-2"
        >
          <BellIcon className="w-4 h-4" />
          {notificationsEnabled ? "Notifications On" : "Enable Notifications"}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Widget title="Today's Habits">
          <div className="space-y-3">
            {habits.length === 0 ? (
              <p className="text-apex-gray text-center py-4">No habits yet. Add your first habit below!</p>
            ) : (
              habits.map((habit) => {
                const streak = getStreak(habit.id)
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className="flex items-center gap-3 p-3 bg-apex-darker rounded-md cursor-pointer hover:bg-gray-800 transition-colors"
                  >
                    {isCompleted(habit.id) ? (
                      <CheckSquareIcon className="text-apex-accent w-5 h-5" />
                    ) : (
                      <SquareIcon className="text-apex-gray w-5 h-5" />
                    )}
                    <div className="flex-grow">
                      <span className={isCompleted(habit.id) ? "line-through text-apex-gray" : "text-white"}>
                        {habit.name}
                      </span>
                      {streak && streak.currentStreak > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <TrophyIcon className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-apex-gray">
                            {streak.currentStreak} day streak (best: {streak.longestStreak})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="New habit..."
                className="flex-grow bg-apex-dark border border-gray-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-apex-primary text-white"
              />
              <button onClick={handleAddHabit} className="bg-apex-primary p-2 rounded-md">
                <PlusIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </Widget>
        <div className="space-y-6">
          <Widget title="AI Habit Architect">
            <button
              onClick={handleSuggestHabit}
              disabled={loadingSuggestion}
              className="w-full bg-apex-accent text-apex-darker font-semibold py-2 rounded-md mb-2 flex items-center justify-center gap-2"
            >
              {loadingSuggestion ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-apex-darker"></div>
                  Thinking...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" /> Suggest New Habit
                </>
              )}
            </button>
            {suggestedHabit && <p className="text-sm text-apex-gray p-2 bg-apex-darker rounded-md">{suggestedHabit}</p>}
          </Widget>
          <Widget title="Daily Performance Review">
            <button
              onClick={handleGenerateFeedback}
              disabled={loadingFeedback}
              className="w-full bg-apex-accent text-apex-darker font-semibold py-2 rounded-md mb-2 flex items-center justify-center gap-2"
            >
              {loadingFeedback ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-apex-darker"></div>
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" /> Get Feedback
                </>
              )}
            </button>
            {dailyFeedback && <p className="text-sm text-apex-gray p-2 bg-apex-darker rounded-md">{dailyFeedback}</p>}
          </Widget>
        </div>
      </div>
    </div>
  )
}
