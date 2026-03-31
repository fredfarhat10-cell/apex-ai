"use client"

import { useState, useEffect } from "react"
import { useVault } from "@/lib/vault-context"
import { ActivityIcon, ZapIcon } from "./icons"
import Widget from "./widget"

export default function SymbiontMode() {
  const [isActive, setIsActive] = useState(false)
  const [simulations, setSimulations] = useState<string[]>([])
  const { userProfile, expenses, habits, updateState } = useVault()

  useEffect(() => {
    if (!isActive) return

    // Run background simulations every 30 seconds
    const interval = setInterval(async () => {
      try {
        const context = {
          profile: userProfile,
          recentExpenses: expenses.slice(-5),
          activeHabits: habits.filter((h) => h.completed),
        }

        const res = await fetch("/api/ai/symbiont-simulation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context }),
        })

        const data = await res.json()
        if (data.insight) {
          setSimulations((prev) => [data.insight, ...prev].slice(0, 5))

          // Add to symbiont feed
          updateState({
            symbiontFeed: [
              {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                event: `Symbiont: ${data.insight}`,
                category: "ai-insight",
              },
              ...updateState.symbiontFeed,
            ],
          })
        }
      } catch (error) {
        console.error("[v0] Symbiont simulation error:", error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isActive, userProfile, expenses, habits, updateState])

  return (
    <Widget title="Symbiont Mode" icon={<ZapIcon className="w-5 h-5" />}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-apex-light">Background AI Simulations</p>
            <p className="text-xs text-apex-gray">Proactive insights while you work</p>
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
              isActive
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-apex-darker text-apex-gray border border-gray-700 hover:border-apex-primary"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </button>
        </div>

        {isActive && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-apex-gray">
              <ActivityIcon className="w-4 h-4 animate-pulse text-green-400" />
              <span>Running simulations in background...</span>
            </div>

            {simulations.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-xs font-semibold text-apex-gray">Recent Insights:</p>
                {simulations.map((sim, idx) => (
                  <div key={idx} className="p-2 bg-apex-darker rounded border border-gray-700 text-xs text-apex-light">
                    {sim}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isActive && (
          <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-apex-gray leading-relaxed">
              Enable Symbiont Mode to let Apex run background simulations and provide proactive insights based on your
              activity patterns. All processing happens locally.
            </p>
          </div>
        )}
      </div>
    </Widget>
  )
}
