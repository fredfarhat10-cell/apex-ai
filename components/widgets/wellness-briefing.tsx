"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Heart, Moon } from "lucide-react"
import type { BiometricData } from "@/lib/types/wellness"

export function WellnessBriefing() {
  const [data, setData] = useState<BiometricData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [provider, setProvider] = useState<string | null>(null)

  useEffect(() => {
    loadWellnessData()
  }, [])

  const loadWellnessData = () => {
    // Check which wellness provider is connected
    const integrations = localStorage.getItem("apex_integrations")
    if (!integrations) {
      setIsLoading(false)
      return
    }

    const parsed = JSON.parse(integrations)
    const wellnessIntegration = parsed.find((int: any) => int.type === "wellness" && int.status === "connected")

    if (!wellnessIntegration) {
      setIsLoading(false)
      return
    }

    setProvider(wellnessIntegration.provider)

    // Load synced data
    const syncedData = localStorage.getItem(`apex_${wellnessIntegration.provider}_data`)
    if (syncedData) {
      const parsed = JSON.parse(syncedData)
      // Get most recent day's data
      if (Array.isArray(parsed) && parsed.length > 0) {
        setData(parsed[0])
      }
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <Card className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10">
        <CardContent className="pt-6">
          <p className="text-gray-400 text-center">Loading wellness data...</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || !provider) {
    return (
      <Card className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10">
        <CardContent className="pt-6">
          <div className="text-center">
            <Activity className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No wellness data available</p>
            <p className="text-sm text-gray-500">Connect a wellness device in the Integration Hub</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const primaryScore = data.recovery || data.bodyBattery || 0
  const scoreColor = primaryScore >= 70 ? "text-green-400" : primaryScore >= 50 ? "text-yellow-400" : "text-red-400"

  return (
    <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Wellness Briefing</h3>
          <Badge variant="outline" className="text-xs capitalize">
            {provider}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Heart className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-sm text-gray-400">{provider === "whoop" ? "Recovery" : "Body Battery"}</span>
            </div>
            <p className={`text-4xl font-bold ${scoreColor}`}>{Math.round(primaryScore)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {primaryScore >= 70 ? "Optimal" : primaryScore >= 50 ? "Moderate" : "Low"}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Moon className="h-5 w-5 text-blue-400 mr-2" />
              <span className="text-sm text-gray-400">Sleep</span>
            </div>
            <p className="text-4xl font-bold text-blue-400">
              {data.sleepDuration ? data.sleepDuration.toFixed(1) : "N/A"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.sleepEfficiency ? `${Math.round(data.sleepEfficiency)}% efficiency` : "hours"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {data.hrv && (
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">HRV</p>
              <p className="text-lg font-semibold text-white">{Math.round(data.hrv)} ms</p>
            </div>
          )}

          {data.rhr && (
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Resting HR</p>
              <p className="text-lg font-semibold text-white">{Math.round(data.rhr)} bpm</p>
            </div>
          )}

          {data.strain && (
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Strain</p>
              <p className="text-lg font-semibold text-white">{data.strain.toFixed(1)}</p>
            </div>
          )}

          {data.steps && (
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Steps</p>
              <p className="text-lg font-semibold text-white">{data.steps.toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-400">
            {primaryScore >= 70
              ? "Your body is well-recovered. Great day for high-intensity work."
              : primaryScore >= 50
                ? "Moderate recovery. Balance activity with rest today."
                : "Low recovery detected. Prioritize rest and recovery activities."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
