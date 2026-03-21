"use client"

import { WellnessBriefing } from "./widgets/wellness-briefing"
import { FinancialVelocity } from "./widgets/financial-velocity"
import { ActionInboxWidget } from "./widgets/action-inbox-widget"
import { CauseEffectWidget } from "./widgets/cause-effect-widget"
import CalendarWidget from "./calendar-widget"
import ProactiveInsightsPanel from "./proactive-insights-panel"
import ApexScratchpad from "./apex-scratchpad"
import { Card, CardContent } from "./ui/card"
import { useVault } from "@/lib/vault-context"

export default function UnifiedDashboard() {
  const { userProfile, habits, habitLogs, trendAnalysis } = useVault()

  const todayStr = new Date().toISOString().split("T")[0]
  const completedToday = (habitLogs || []).filter((log) => log.date === todayStr && log.completed).length
  const totalHabits = (habits || []).length

  return (
    <div className="h-screen w-full bg-[#0a0a0f] text-white overflow-y-auto font-mono p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Command Center
          </h1>
          <p className="text-gray-400">Your unified life management dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WellnessBriefing />
              <FinancialVelocity />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActionInboxWidget />
              <CauseEffectWidget />
            </div>

            <ApexScratchpad />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10 hover:border-orange-500/30 transition-colors">
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-400 mb-2">Habits Today</p>
                  <p className="text-3xl font-bold text-white">
                    {completedToday} / {totalHabits}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {totalHabits > 0 ? `${Math.round((completedToday / totalHabits) * 100)}% complete` : "No habits"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10 hover:border-orange-500/30 transition-colors">
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-400 mb-2">Active Insights</p>
                  <p className="text-3xl font-bold text-white">{trendAnalysis?.recommendations?.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-2">AI-generated recommendations</p>
                </CardContent>
              </Card>

              <Card className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10 hover:border-orange-500/30 transition-colors">
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-400 mb-2">Aura State</p>
                  <p className="text-3xl font-bold text-orange-400">{userProfile?.aiPersona || "Neutral"}</p>
                  <p className="text-xs text-gray-500 mt-2">Current energy level</p>
                </CardContent>
              </Card>
            </div>

            <CalendarWidget />
          </div>

          <div className="space-y-6">
            <ProactiveInsightsPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
