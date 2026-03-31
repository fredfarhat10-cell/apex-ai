"use client"

import { useEffect, useState } from "react"
import { ActivityIcon, ClockIcon, MousePointerClickIcon } from "./icons"

interface AnalyticsData {
  sessionTime: number
  featureUsage: { [key: string]: number }
  lastVisit: string
  totalSessions: number
}

export default function LocalAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [sessionStart] = useState(Date.now())

  useEffect(() => {
    const loadAnalytics = () => {
      const stored = localStorage.getItem("apex_analytics")
      if (stored) {
        const data = JSON.parse(stored)
        setAnalytics(data)
      } else {
        const initial: AnalyticsData = {
          sessionTime: 0,
          featureUsage: {},
          lastVisit: new Date().toISOString(),
          totalSessions: 1,
        }
        setAnalytics(initial)
        localStorage.setItem("apex_analytics", JSON.stringify(initial))
      }
    }

    loadAnalytics()

    // Update session time every minute
    const interval = setInterval(() => {
      const stored = localStorage.getItem("apex_analytics")
      if (stored) {
        const data: AnalyticsData = JSON.parse(stored)
        const sessionDuration = Math.floor((Date.now() - sessionStart) / 1000 / 60)
        data.sessionTime += 1
        data.lastVisit = new Date().toISOString()
        localStorage.setItem("apex_analytics", JSON.stringify(data))
        setAnalytics(data)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [sessionStart])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (!analytics) return null

  return (
    <div className="bg-apex-dark border border-gray-800 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-white flex items-center gap-2">
        <ActivityIcon className="w-5 h-5" />
        Your Usage Stats
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-apex-darker rounded-md p-3">
          <div className="flex items-center gap-2 text-apex-gray mb-1">
            <ClockIcon className="w-4 h-4" />
            <span className="text-xs">Total Time</span>
          </div>
          <p className="text-lg font-semibold text-white">{formatTime(analytics.sessionTime)}</p>
        </div>
        <div className="bg-apex-darker rounded-md p-3">
          <div className="flex items-center gap-2 text-apex-gray mb-1">
            <MousePointerClickIcon className="w-4 h-4" />
            <span className="text-xs">Sessions</span>
          </div>
          <p className="text-lg font-semibold text-white">{analytics.totalSessions}</p>
        </div>
      </div>
      <p className="text-xs text-apex-gray">All stats are stored locally and never shared.</p>
    </div>
  )
}
