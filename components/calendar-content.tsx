"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useVault } from "@/lib/vault-context"
import { motion, AnimatePresence } from "framer-motion"
import type { CalendarEvent } from "@/lib/types"
import {
  PlusIcon,
  CalendarIcon,
  ZapIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  AlertTriangleIcon,
} from "./icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { initiateOAuth, fetchGoogleCalendarEvents, fetchMicrosoftCalendarEvents } from "@/lib/calendar-oauth"

type ViewMode = "day" | "week" | "month"

interface TimeSlot {
  hour: number
  label: string
}

interface ConflictInfo {
  eventIds: string[]
  suggestedTime?: string
}

export default function CalendarContent() {
  const { calendarEvents, calendarIntegrations, activities, userProfile, updateState } = useVault()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("week")
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null)
  const [conflicts, setConflicts] = useState<Map<string, ConflictInfo>>(new Map())
  const [reminders, setReminders] = useState<Map<string, { threeDays: boolean; fiveHours: boolean }>>(new Map())
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)

  // Time slots for day/week view (6 AM to 10 PM)
  const timeSlots: TimeSlot[] = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 6
    return {
      hour,
      label: hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`,
    }
  })

  useEffect(() => {
    const conflictMap = new Map<string, ConflictInfo>()

    calendarEvents.forEach((event, index) => {
      const eventStart = new Date(event.startTime)
      const eventEnd = new Date(event.endTime)

      calendarEvents.forEach((otherEvent, otherIndex) => {
        if (index !== otherIndex) {
          const otherStart = new Date(otherEvent.startTime)
          const otherEnd = new Date(otherEvent.endTime)

          // Check for overlap
          if (
            (eventStart >= otherStart && eventStart < otherEnd) ||
            (eventEnd > otherStart && eventEnd <= otherEnd) ||
            (eventStart <= otherStart && eventEnd >= otherEnd)
          ) {
            const existingConflict = conflictMap.get(event.id)
            if (existingConflict) {
              existingConflict.eventIds.push(otherEvent.id)
            } else {
              // Suggest next available time slot
              const suggestedTime = new Date(eventEnd.getTime() + 30 * 60000)
              conflictMap.set(event.id, {
                eventIds: [otherEvent.id],
                suggestedTime: suggestedTime.toISOString(),
              })
            }
          }
        }
      })
    })

    setConflicts(conflictMap)
  }, [calendarEvents])

  useEffect(() => {
    const reminderMap = new Map<string, { threeDays: boolean; fiveHours: boolean }>()

    calendarEvents.forEach((event) => {
      const eventTime = new Date(event.startTime)
      const now = new Date()
      const threeDaysBefore = new Date(eventTime.getTime() - 3 * 24 * 60 * 60 * 1000)
      const fiveHoursBefore = new Date(eventTime.getTime() - 5 * 60 * 60 * 1000)

      reminderMap.set(event.id, {
        threeDays: now >= threeDaysBefore && now < eventTime,
        fiveHours: now >= fiveHoursBefore && now < eventTime,
      })
    })

    setReminders(reminderMap)
  }, [calendarEvents])

  const getWeekDays = () => {
    const start = new Date(selectedDate)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      return day
    })
  }

  const weekDays = getWeekDays()

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return calendarEvents.filter((event) => event.startTime.startsWith(dateStr))
  }

  const getEventsForTimeSlot = (date: Date, hour: number) => {
    const events = getEventsForDay(date)
    return events.filter((event) => {
      const eventHour = new Date(event.startTime).getHours()
      return eventHour === hour
    })
  }

  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)
    const startMinutes = start.getHours() * 60 + start.getMinutes()
    const endMinutes = end.getHours() * 60 + end.getMinutes()
    const duration = endMinutes - startMinutes

    // Calculate position from 6 AM (360 minutes)
    const topOffset = ((startMinutes - 360) / 60) * 64 // 64px per hour
    const height = (duration / 60) * 64

    return {
      top: `${topOffset}px`,
      height: `${Math.max(height, 32)}px`,
    }
  }

  const handlePrevious = () => {
    const newDate = new Date(selectedDate)
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() - 1)
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setSelectedDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(selectedDate)
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + 1)
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setSelectedDate(newDate)
  }

  const handleToday = () => {
    setSelectedDate(new Date())
  }

  const handleDragStart = (event: CalendarEvent) => {
    setDraggedEvent(event)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (date: Date, hour: number) => {
    if (!draggedEvent) return

    const newStart = new Date(date)
    newStart.setHours(hour, 0, 0, 0)

    const originalStart = new Date(draggedEvent.startTime)
    const originalEnd = new Date(draggedEvent.endTime)
    const duration = originalEnd.getTime() - originalStart.getTime()

    const newEnd = new Date(newStart.getTime() + duration)

    const updatedEvent = {
      ...draggedEvent,
      startTime: newStart.toISOString(),
      endTime: newEnd.toISOString(),
    }

    const updatedEvents = calendarEvents.map((e) => (e.id === draggedEvent.id ? updatedEvent : e))
    updateState("calendarEvents", updatedEvents)
    setDraggedEvent(null)
  }

  const formatDateRange = () => {
    if (viewMode === "day") {
      return selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    } else if (viewMode === "week") {
      const start = weekDays[0]
      const end = weekDays[6]
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    } else {
      return selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    }
  }

  const getProductivityStats = () => {
    const today = new Date()
    const todayEvents = calendarEvents.filter((e) => {
      const eventDate = new Date(e.startTime)
      return eventDate.toDateString() === today.toDateString()
    })

    const totalMinutes = todayEvents.reduce((acc, event) => {
      const start = new Date(event.startTime)
      const end = new Date(event.endTime)
      return acc + (end.getTime() - start.getTime()) / 60000
    }, 0)

    const scheduledPercentage = Math.min(Math.round((totalMinutes / (16 * 60)) * 100), 100)

    return {
      totalEvents: todayEvents.length,
      scheduledPercentage,
      conflicts: Array.from(conflicts.values()).filter((c) => todayEvents.some((e) => c.eventIds.includes(e.id)))
        .length,
    }
  }

  const stats = getProductivityStats()

  const handleConnectCalendar = async (integrationId: string) => {
    const integration = calendarIntegrations.find((int) => int.id === integrationId)
    if (!integration) return

    // If already connected, just toggle off
    if (integration.connected) {
      const updated = calendarIntegrations.map((int) =>
        int.id === integrationId ? { ...int, connected: false, lastSync: undefined } : int,
      )
      updateState("calendarIntegrations", updated)

      // Remove events from this source
      const filteredEvents = calendarEvents.filter(
        (e: any) => e.source !== integration.name.toLowerCase().split(" ")[0],
      )
      updateState("calendarEvents", filteredEvents)
      return
    }

    setConnectingProvider(integrationId)

    try {
      // Map integration names to provider IDs
      const providerMap: Record<string, string> = {
        "Google Calendar": "google",
        "Microsoft Outlook": "microsoft",
        "Apple Calendar": "apple",
      }

      const providerId = providerMap[integration.name]
      if (!providerId) {
        throw new Error("Provider not supported")
      }

      // Initiate OAuth flow
      const { accessToken, refreshToken } = await initiateOAuth(providerId)

      // Store tokens securely in localStorage
      localStorage.setItem(`${providerId}_access_token`, accessToken)
      if (refreshToken) {
        localStorage.setItem(`${providerId}_refresh_token`, refreshToken)
      }

      // Fetch calendar events
      let events: any[] = []
      if (providerId === "google") {
        events = await fetchGoogleCalendarEvents(accessToken)
      } else if (providerId === "microsoft") {
        events = await fetchMicrosoftCalendarEvents(accessToken)
      }

      // Update integration status
      const updated = calendarIntegrations.map((int) =>
        int.id === integrationId ? { ...int, connected: true, lastSync: new Date().toISOString() } : int,
      )
      updateState("calendarIntegrations", updated)

      // Add fetched events to calendar
      const mergedEvents = [...calendarEvents, ...events]
      updateState("calendarEvents", mergedEvents)

      console.log(`[v0] Successfully connected ${integration.name} and synced ${events.length} events`)
    } catch (error) {
      console.error("[v0] OAuth error:", error)
      alert(`Failed to connect ${integration.name}. Please try again.`)
    } finally {
      setConnectingProvider(null)
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0f1e]">
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Calendar</h1>
            <p className="text-sm text-gray-400 mt-1">AI-Powered Schedule Management</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* View mode toggles */}
          <div className="flex items-center gap-1 bg-[#1a1f35] rounded-lg p-1">
            <button
              onClick={() => setViewMode("day")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "day" ? "bg-[#4A90E2] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "week" ? "bg-[#4A90E2] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "month" ? "bg-[#4A90E2] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Month
            </button>
          </div>

          <Button onClick={handleToday} variant="outline" className="bg-[#1a1f35] border-gray-700 text-white">
            Today
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-800">
        <Card className="bg-[#1a1f35] border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Today's Events</p>
              <p className="text-2xl font-semibold text-white mt-1">{stats.totalEvents}</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-[#4A90E2]" />
          </div>
        </Card>

        <Card className="bg-[#1a1f35] border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Day Scheduled</p>
              <p className="text-2xl font-semibold text-white mt-1">{stats.scheduledPercentage}%</p>
            </div>
            <ClockIcon className="w-8 h-8 text-emerald-500" />
          </div>
        </Card>

        <Card className="bg-[#1a1f35] border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Conflicts</p>
              <p className="text-2xl font-semibold text-white mt-1">{stats.conflicts}</p>
            </div>
            <AlertTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-gray-800 p-4 bg-[#0f1420]">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <ZapIcon className="w-4 h-4 text-[#4A90E2]" />
              Connected Calendars
            </h3>
            <div className="space-y-2">
              {calendarIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    integration.connected
                      ? "bg-emerald-500/10 border border-emerald-500/30"
                      : "bg-[#1a1f35] border border-gray-700 hover:border-gray-600"
                  } ${connectingProvider === integration.id ? "opacity-50 cursor-wait" : ""}`}
                  onClick={() => handleConnectCalendar(integration.id)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${integration.connected ? "bg-emerald-500 animate-pulse" : "bg-gray-600"}`}
                    />
                    <span className="text-sm text-white">{integration.name}</span>
                  </div>
                  {connectingProvider === integration.id ? (
                    <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Connecting...
                    </Badge>
                  ) : integration.connected ? (
                    <Badge
                      variant="outline"
                      className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    >
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-gray-700 text-gray-400 border-gray-600">
                      Connect
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              Click to authenticate with your calendar provider. Your events will sync automatically.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Upcoming Reminders</h3>
            <div className="space-y-2">
              {calendarEvents
                .filter((event) => {
                  const reminder = reminders.get(event.id)
                  return reminder && (reminder.threeDays || reminder.fiveHours)
                })
                .slice(0, 5)
                .map((event) => {
                  const reminder = reminders.get(event.id)
                  return (
                    <div key={event.id} className="p-2 rounded-lg bg-[#1a1f35] border border-gray-700">
                      <p className="text-xs font-medium text-white truncate">{event.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{reminder?.fiveHours ? "In 5 hours" : "In 3 days"}</p>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Date navigation */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <button onClick={handlePrevious} className="p-2 rounded-lg hover:bg-[#1a1f35] transition-colors">
                <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
              </button>
              <h2 className="text-lg font-semibold text-white min-w-[300px] text-center">{formatDateRange()}</h2>
              <button onClick={handleNext} className="p-2 rounded-lg hover:bg-[#1a1f35] transition-colors">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <Button onClick={() => setShowAddEvent(true)} className="bg-[#4A90E2] hover:bg-[#357ABD]">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>

          {viewMode === "week" && (
            <div className="flex-1 overflow-auto">
              <div className="min-w-[800px]">
                {/* Day headers */}
                <div className="grid grid-cols-8 border-b border-gray-800 sticky top-0 bg-[#0a0f1e] z-10">
                  <div className="p-4 border-r border-gray-800"></div>
                  {weekDays.map((day, index) => {
                    const isToday = day.toDateString() === new Date().toDateString()
                    return (
                      <div
                        key={index}
                        className={`p-4 text-center border-r border-gray-800 ${isToday ? "bg-[#4A90E2]/10" : ""}`}
                      >
                        <div className="text-xs text-gray-400 uppercase">
                          {day.toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                        <div className={`text-lg font-semibold mt-1 ${isToday ? "text-[#4A90E2]" : "text-white"}`}>
                          {day.getDate()}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Time grid */}
                <div className="relative">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.hour}
                      className="grid grid-cols-8 border-b border-gray-800"
                      style={{ height: "64px" }}
                    >
                      <div className="p-2 border-r border-gray-800 text-xs text-gray-400 text-right pr-4">
                        {slot.label}
                      </div>
                      {weekDays.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="border-r border-gray-800 relative hover:bg-[#1a1f35]/50 transition-colors"
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(day, slot.hour)}
                        >
                          {getEventsForTimeSlot(day, slot.hour).map((event) => {
                            const hasConflict = conflicts.has(event.id)
                            const style = getEventStyle(event)

                            return (
                              <motion.div
                                key={event.id}
                                draggable
                                onDragStart={() => handleDragStart(event)}
                                onClick={() => setSelectedEvent(event)}
                                className={`absolute left-1 right-1 rounded-md p-2 cursor-move overflow-hidden ${
                                  hasConflict ? "border-2 border-red-500 bg-red-500/20" : ""
                                }`}
                                style={{
                                  ...style,
                                  backgroundColor: hasConflict ? undefined : event.color,
                                }}
                                whileHover={{ scale: 1.02 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                <div className="text-xs font-semibold text-white truncate">{event.title}</div>
                                <div className="text-xs text-white/80 truncate">
                                  {new Date(event.startTime).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </div>
                                {hasConflict && (
                                  <div className="absolute top-1 right-1">
                                    <AlertTriangleIcon className="w-3 h-3 text-red-400" />
                                  </div>
                                )}
                              </motion.div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {viewMode === "day" && (
            <div className="flex-1 overflow-auto">
              <div className="max-w-4xl mx-auto">
                {timeSlots.map((slot) => (
                  <div key={slot.hour} className="flex border-b border-gray-800" style={{ height: "64px" }}>
                    <div className="w-24 p-2 text-xs text-gray-400 text-right pr-4">{slot.label}</div>
                    <div
                      className="flex-1 relative hover:bg-[#1a1f35]/50 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(selectedDate, slot.hour)}
                    >
                      {getEventsForTimeSlot(selectedDate, slot.hour).map((event) => {
                        const hasConflict = conflicts.has(event.id)
                        const style = getEventStyle(event)

                        return (
                          <motion.div
                            key={event.id}
                            draggable
                            onDragStart={() => handleDragStart(event)}
                            onClick={() => setSelectedEvent(event)}
                            className={`absolute left-2 right-2 rounded-md p-3 cursor-move ${
                              hasConflict ? "border-2 border-red-500 bg-red-500/20" : ""
                            }`}
                            style={{
                              ...style,
                              backgroundColor: hasConflict ? undefined : event.color,
                            }}
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="text-sm font-semibold text-white">{event.title}</div>
                            <div className="text-xs text-white/80 mt-1">
                              {new Date(event.startTime).toLocaleString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </div>
                            {hasConflict && (
                              <Badge variant="destructive" className="mt-2 text-xs">
                                Conflict Detected
                              </Badge>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Month view placeholder */}
          {viewMode === "month" && (
            <div className="flex-1 p-8">
              <div className="text-center text-gray-400">
                <p>Month view coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1f35] rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">{selectedEvent.title}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Time</p>
                  <p className="text-white">
                    {new Date(selectedEvent.startTime).toLocaleString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Category</p>
                  <Badge className="mt-1" style={{ backgroundColor: selectedEvent.color }}>
                    {selectedEvent.category}
                  </Badge>
                </div>
                {conflicts.has(selectedEvent.id) && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangleIcon className="w-4 h-4 text-red-400" />
                      <p className="text-sm font-semibold text-red-400">Scheduling Conflict</p>
                    </div>
                    <p className="text-xs text-gray-300">
                      This event overlaps with another event. Consider moving it to{" "}
                      {new Date(conflicts.get(selectedEvent.id)!.suggestedTime!).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={() => {
                    const updatedEvents = calendarEvents.filter((e) => e.id !== selectedEvent.id)
                    updateState("calendarEvents", updatedEvents)
                    setSelectedEvent(null)
                  }}
                  variant="destructive"
                  className="flex-1"
                >
                  Delete
                </Button>
                <Button onClick={() => setSelectedEvent(null)} variant="outline" className="flex-1">
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
