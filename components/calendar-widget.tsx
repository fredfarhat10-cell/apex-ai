"use client"

import { motion } from "framer-motion"
import { useVault } from "@/lib/vault-context"
import { CalendarIcon, ClockIcon } from "./icons"

export default function CalendarWidget() {
  const { calendarEvents } = useVault()

  const getUpcomingEvents = () => {
    const now = new Date()
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    return calendarEvents
      .filter((event) => {
        const eventStart = new Date(event.startTime)
        return eventStart >= now && eventStart <= next24Hours
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 3)
  }

  const upcomingEvents = getUpcomingEvents()

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Work: "rgba(0, 255, 255, 0.3)",
      Personal: "rgba(168, 85, 247, 0.3)",
      Health: "rgba(34, 197, 94, 0.3)",
      Social: "rgba(251, 146, 60, 0.3)",
    }
    return colors[category] || "rgba(100, 100, 100, 0.3)"
  }

  const getCategoryBorderColor = (category: string) => {
    const colors: Record<string, string> = {
      Work: "rgba(0, 255, 255, 0.6)",
      Personal: "rgba(168, 85, 247, 0.6)",
      Health: "rgba(34, 197, 94, 0.6)",
      Social: "rgba(251, 146, 60, 0.6)",
    }
    return colors[category] || "rgba(100, 100, 100, 0.6)"
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const getTimeUntil = (dateString: string) => {
    const now = new Date()
    const eventTime = new Date(dateString)
    const diffMs = eventTime.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `in ${diffHours}h ${diffMinutes}m`
    }
    return `in ${diffMinutes}m`
  }

  return (
    <div className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm uppercase tracking-widest text-gray-400 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#00FFFF]" />
          Next 24 Hours
        </h3>
        <span className="text-xs text-gray-500">{upcomingEvents.length} events</span>
      </div>

      {upcomingEvents.length > 0 ? (
        <div className="space-y-3">
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-lg backdrop-blur-sm border"
              style={{
                backgroundColor: getCategoryColor(event.category),
                borderColor: getCategoryBorderColor(event.category),
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{event.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <ClockIcon className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-300">{formatTime(event.startTime)}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400">{getTimeUntil(event.startTime)}</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-black/20 text-gray-300">{event.category}</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No events in the next 24 hours</p>
          <p className="text-xs text-gray-600 mt-1">Your schedule is clear</p>
        </div>
      )}
    </div>
  )
}
