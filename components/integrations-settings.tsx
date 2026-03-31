"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Circle, Activity, Watch, Navigation, Calendar, DollarSign, Bell, Volume2 } from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  category: "fitness" | "productivity" | "finance"
}

export default function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "strava",
      name: "Strava",
      description: "Sync your runs, rides, and workouts",
      icon: <Activity className="w-6 h-6" />,
      connected: false,
      category: "fitness",
    },
    {
      id: "whoop",
      name: "Whoop",
      description: "Track recovery, strain, and sleep data",
      icon: <Watch className="w-6 h-6" />,
      connected: false,
      category: "fitness",
    },
    {
      id: "garmin",
      name: "Garmin",
      description: "Import training data and metrics",
      icon: <Navigation className="w-6 h-6" />,
      connected: false,
      category: "fitness",
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Schedule workouts and meetings",
      icon: <Calendar className="w-6 h-6" />,
      connected: false,
      category: "productivity",
    },
    {
      id: "plaid",
      name: "Brokerage Account (Plaid)",
      description: "Connect your investment accounts",
      icon: <DollarSign className="w-6 h-6" />,
      connected: false,
      category: "finance",
    },
  ])

  const [notifications, setNotifications] = useState({
    dailyBriefing: true,
    workoutReminders: true,
    portfolioAlerts: false,
    weeklyReports: true,
  })

  const [aiSettings, setAiSettings] = useState({
    voiceTone: "professional",
    proactiveInsights: true,
  })

  const handleConnect = (integrationId: string) => {
    // TODO: Trigger OAuth flow for the selected integration
    // Each integration will have its own OAuth endpoint:
    // - Strava: https://www.strava.com/oauth/authorize
    // - Whoop: https://api.prod.whoop.com/oauth/authorize
    // - Garmin: https://connect.garmin.com/oauthConfirm
    // - Google Calendar: https://accounts.google.com/o/oauth2/v2/auth
    // - Plaid: Use Plaid Link SDK for secure bank connection

    console.log(`[v0] Initiating OAuth flow for ${integrationId}`)

    setIntegrations(integrations.map((int) => (int.id === integrationId ? { ...int, connected: !int.connected } : int)))

    alert(
      `${integrationId} ${integrations.find((i) => i.id === integrationId)?.connected ? "disconnected" : "connected"}!`,
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Integrations & Settings</h1>
          <p className="text-[#888888] text-lg">Connect your apps and customize your AI experience</p>
        </div>

        {/* Integrations Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8">Connected Apps</h2>

          <div className="space-y-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="bg-[#111111] border-[#222222] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00]">
                      {integration.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                        {integration.connected ? (
                          <CheckCircle2 className="w-5 h-5 text-[#FF6B00]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#444444]" />
                        )}
                      </div>
                      <p className="text-sm text-[#888888] mt-1">{integration.description}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleConnect(integration.id)}
                    variant={integration.connected ? "outline" : "default"}
                    className={
                      integration.connected
                        ? "border-[#222222] text-white hover:bg-[#1A1A1A]"
                        : "bg-[#FF6B00] hover:bg-[#FF8533] text-white"
                    }
                  >
                    {integration.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#6E56CF]" />
            Notifications
          </h2>

          <Card className="bg-[#0A0A0A] border-gray-800 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Daily Briefing</Label>
                  <p className="text-sm text-gray-400">Get a morning summary of your day</p>
                </div>
                <Switch
                  checked={notifications.dailyBriefing}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, dailyBriefing: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Workout Reminders</Label>
                  <p className="text-sm text-gray-400">Notifications for scheduled training</p>
                </div>
                <Switch
                  checked={notifications.workoutReminders}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, workoutReminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Portfolio Alerts</Label>
                  <p className="text-sm text-gray-400">Important market movements</p>
                </div>
                <Switch
                  checked={notifications.portfolioAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, portfolioAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Weekly Reports</Label>
                  <p className="text-sm text-gray-400">Performance summaries every Sunday</p>
                </div>
                <Switch
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* AI Voice & Tone Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-[#6E56CF]" />
            AI Voice & Tone
          </h2>

          <Card className="bg-[#0A0A0A] border-gray-800 p-6">
            <div className="space-y-6">
              <div>
                <Label className="text-white font-medium mb-3 block">Communication Style</Label>
                <div className="grid grid-cols-3 gap-3">
                  {["professional", "friendly", "concise"].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setAiSettings({ ...aiSettings, voiceTone: tone })}
                      className={`px-4 py-3 rounded-lg border transition-all capitalize ${
                        aiSettings.voiceTone === tone
                          ? "border-[#6E56CF] bg-[#6E56CF]/10 text-[#6E56CF]"
                          : "border-gray-800 text-gray-400 hover:border-gray-700"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Proactive Insights</Label>
                  <p className="text-sm text-gray-400">Let AI suggest actions before you ask</p>
                </div>
                <Switch
                  checked={aiSettings.proactiveInsights}
                  onCheckedChange={(checked) => setAiSettings({ ...aiSettings, proactiveInsights: checked })}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
