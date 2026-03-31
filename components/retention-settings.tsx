"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Bell, BellOff, Clock, Zap } from "lucide-react"
import {
  getNudgePreferences,
  updateNudgePreferences,
  habitTemplates,
  type NudgePreferences,
} from "@/lib/retention-hooks"
import { useVault } from "@/lib/vault-context"

export function RetentionSettings() {
  const [preferences, setPreferences] = useState<NudgePreferences>({ enabled: true, maxPerDay: 3 })
  const { addHabit } = useVault()

  useEffect(() => {
    setPreferences(getNudgePreferences())
  }, [])

  const handleToggle = (enabled: boolean) => {
    updateNudgePreferences({ enabled })
    setPreferences({ ...preferences, enabled })
  }

  const handleMaxPerDayChange = (value: string) => {
    const maxPerDay = Number.parseInt(value) || 3
    updateNudgePreferences({ maxPerDay })
    setPreferences({ ...preferences, maxPerDay })
  }

  const handleQuietHoursChange = (field: "start" | "end", value: string) => {
    const update = field === "start" ? { quietHoursStart: value } : { quietHoursEnd: value }
    updateNudgePreferences(update)
    setPreferences({ ...preferences, ...update })
  }

  const handleAddTemplate = (templateId: string) => {
    const template = habitTemplates.find((t) => t.id === templateId)
    if (template && addHabit) {
      addHabit({
        id: `habit_${Date.now()}`,
        name: template.name,
        goal: template.description,
        createdAt: new Date().toISOString(),
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Retention & Engagement</h2>
          <p className="text-gray-400 text-sm">Stay motivated with smart reminders and habit templates</p>
        </div>
        <Zap className="w-8 h-8 text-yellow-400" />
      </div>

      {/* Nudge Settings */}
      <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl border-purple-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Smart Nudges</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {preferences.enabled ? (
                <Bell className="w-5 h-5 text-green-400" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="text-white font-medium">Enable Smart Nudges</p>
                <p className="text-gray-400 text-sm">Get contextual reminders to stay on track</p>
              </div>
            </div>
            <Switch checked={preferences.enabled} onCheckedChange={handleToggle} />
          </div>

          {preferences.enabled && (
            <>
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Max Nudges Per Day</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={preferences.maxPerDay}
                  onChange={(e) => handleMaxPerDayChange(e.target.value)}
                  className="bg-black/50 border-purple-500/30 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Quiet Hours Start
                  </label>
                  <Input
                    type="time"
                    value={preferences.quietHoursStart || "22:00"}
                    onChange={(e) => handleQuietHoursChange("start", e.target.value)}
                    className="bg-black/50 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-2 block flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Quiet Hours End
                  </label>
                  <Input
                    type="time"
                    value={preferences.quietHoursEnd || "08:00"}
                    onChange={(e) => handleQuietHoursChange("end", e.target.value)}
                    className="bg-black/50 border-purple-500/30 text-white"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Habit Templates */}
      <Card className="bg-gradient-to-br from-slate-900/40 to-gray-900/40 backdrop-blur-xl border-gray-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Habit Templates</h3>
        <p className="text-gray-400 text-sm mb-4">Quick-start your routine with proven habit templates</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {habitTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-black/30 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{template.icon}</span>
                  <h4 className="text-white font-semibold">{template.name}</h4>
                </div>
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{template.frequency}</span>
              </div>
              <p className="text-gray-400 text-sm mb-3">{template.description}</p>
              <Button
                size="sm"
                onClick={() => handleAddTemplate(template.id)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Add to Routines
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
