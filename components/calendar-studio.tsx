"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useVault } from "@/lib/vault-context"
import { motion, AnimatePresence } from "framer-motion"
import type { CalendarEvent } from "@/lib/types"
import { CalendarAI } from "@/lib/calendar-ai"
import CalendarAIAssistant from "@/components/calendar-ai-assistant"
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, BellIcon, XIcon } from "./icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type ViewMode = "day" | "week" | "month"

interface TimeSlot {
  hour: number
  label: string
}

export default function CalendarStudio() {
  const { calendarEvents, reminders, updateState, userProfile } = useVault()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("week")
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    category: "Work",
    priority: "normal" as "critical" | "high" | "normal" | "leisure",
  })
  const [showConflictWarning, setShowConflictWarning] = useState(false)
  const [conflictDetails, setConflictDetails] = useState<any>(null)

  // Time slots for day/week view (6 AM to 10 PM)
  const timeSlots: TimeSlot[] = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 6
    return {
      hour,
      label: hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`,
    }
  })

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

  const getPriorityColor = (priority: "critical" | "high" | "normal" | "leisure") => {
    const colors = {
      critical: "#EF4444", // Red
      high: "#E5E7EB", // White/Light Grey
      normal: "#22C55E", // Green
      leisure: "#3B82F6", // Blue
    }
    return colors[priority]
  }

  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)
    const startMinutes = start.getHours() * 60 + start.getMinutes()
    const endMinutes = end.getHours() * 60 + end.getMinutes()
    const duration = endMinutes - startMinutes

    const topOffset = ((startMinutes - 360) / 60) * 64
    const height = (duration / 60) * 64

    const priorityColor = getPriorityColor(event.priority)

    return {
      top: `${topOffset}px`,
      height: `${Math.max(height, 32)}px`,
      background: "rgba(20, 20, 25, 0.5)",
      backdropFilter: "blur(10px)",
      borderLeft: `3px solid ${priorityColor}`,
      boxShadow: `inset 0 0 20px ${priorityColor}20`,
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

    const conflict = CalendarAI.detectConflicts(calendarEvents, updatedEvent)
    if (conflict.hasConflict) {
      setConflictDetails(conflict)
      setShowConflictWarning(true)
      setDraggedEvent(null)
      return
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

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) return

    const autoCategory = CalendarAI.autoCategorize(newEvent.title, newEvent.description)

    const event: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      category: newEvent.category === "Work" ? autoCategory : newEvent.category,
      priority: newEvent.priority,
    }

    const conflict = CalendarAI.detectConflicts(calendarEvents, event)
    if (conflict.hasConflict) {
      setConflictDetails(conflict)
      setShowConflictWarning(true)
      return
    }

    updateState("calendarEvents", [...calendarEvents, event])
    setShowAddEvent(false)
    setNewEvent({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      category: "Work",
      priority: "normal",
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Work: "rgba(0, 255, 255, 0.2)",
      Personal: "rgba(168, 85, 247, 0.2)",
      Health: "rgba(34, 197, 94, 0.2)",
      Social: "rgba(251, 146, 60, 0.2)",
    }
    return colors[category] || "rgba(100, 100, 100, 0.2)"
  }

  const getCategoryBorderColor = (category: string) => {
    const colors: Record<string, string> = {
      Work: "rgba(0, 255, 255, 0.5)",
      Personal: "rgba(168, 85, 247, 0.5)",
      Health: "rgba(34, 197, 94, 0.5)",
      Social: "rgba(251, 146, 60, 0.5)",
    }
    return colors[category] || "rgba(100, 100, 100, 0.5)"
  }

  // Get current time indicator position
  const getCurrentTimePosition = () => {
    const now = new Date()
    const minutes = now.getHours() * 60 + now.getMinutes()
    const topOffset = ((minutes - 360) / 60) * 64 // 64px per hour, starting from 6 AM
    return topOffset
  }

  const [currentTimePosition, setCurrentTimePosition] = useState(getCurrentTimePosition())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimePosition(getCurrentTimePosition())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-full flex flex-col bg-[#0A0A0F]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#222]">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Calendar & Time Guild</h1>
            <p className="text-sm text-gray-400 mt-1">Your Strategic Time Command Center</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* View mode toggles */}
          <div className="flex items-center gap-1 bg-[#111116] rounded-lg p-1">
            <button
              onClick={() => setViewMode("day")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "day" ? "bg-[#00FFFF]/20 text-[#00FFFF]" : "text-gray-400 hover:text-white"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "week" ? "bg-[#00FFFF]/20 text-[#00FFFF]" : "text-gray-400 hover:text-white"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "month" ? "bg-[#00FFFF]/20 text-[#00FFFF]" : "text-gray-400 hover:text-white"
              }`}
            >
              Month
            </button>
          </div>

          <Button
            onClick={handleToday}
            variant="outline"
            className="bg-[#111116] border-[#222] text-white hover:bg-[#1a1a1f]"
          >
            Today
          </Button>

          <Button onClick={() => setShowAddEvent(true)} className="bg-[#00FFFF] text-black hover:bg-[#00CCCC]">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Mini calendar and reminders sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with AI Assistant */}
        <div className="w-80 border-r border-[#222] p-4 bg-[#0A0A0F] overflow-y-auto">
          <div className="mb-6">
            <CalendarAIAssistant events={calendarEvents} />
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <BellIcon className="w-4 h-4 text-[#00FFFF]" />
              Upcoming Reminders
            </h3>
            <div className="space-y-2">
              {reminders.slice(0, 5).map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-3 rounded-lg bg-[rgba(20,20,25,0.5)] backdrop-blur-sm border border-[rgba(0,255,255,0.3)]"
                >
                  <p className="text-xs font-medium text-white truncate">{reminder.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(reminder.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
              {reminders.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">No upcoming reminders</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[rgba(20,20,25,0.5)] backdrop-blur-sm border border-[rgba(0,255,255,0.3)]">
                <p className="text-xs text-gray-400">Events Today</p>
                <p className="text-2xl font-bold text-white mt-1">{getEventsForDay(new Date()).length}</p>
              </div>
              <div className="p-3 rounded-lg bg-[rgba(20,20,25,0.5)] backdrop-blur-sm border border-[rgba(168,85,247,0.3)]">
                <p className="text-xs text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-white mt-1">{calendarEvents.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main calendar view */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Date navigation */}
          <div className="flex items-center justify-between p-4 border-b border-[#222]">
            <div className="flex items-center gap-4">
              <button onClick={handlePrevious} className="p-2 rounded-lg hover:bg-[#111116] transition-colors">
                <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
              </button>
              <h2 className="text-lg font-semibold text-white min-w-[300px] text-center">{formatDateRange()}</h2>
              <button onClick={handleNext} className="p-2 rounded-lg hover:bg-[#111116] transition-colors">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Week view */}
          {viewMode === "week" && (
            <div className="flex-1 overflow-auto">
              <div className="min-w-[800px]">
                {/* Day headers */}
                <div className="grid grid-cols-8 border-b border-[#222] sticky top-0 bg-[#0A0A0F] z-10">
                  <div className="p-4 border-r border-[#222]"></div>
                  {weekDays.map((day, index) => {
                    const isToday = day.toDateString() === new Date().toDateString()
                    return (
                      <div
                        key={index}
                        className={`p-4 text-center border-r border-[#222] ${isToday ? "bg-[#00FFFF]/5" : ""}`}
                      >
                        <div className="text-xs text-gray-400 uppercase">
                          {day.toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                        <div className={`text-lg font-semibold mt-1 ${isToday ? "text-[#00FFFF]" : "text-white"}`}>
                          {day.getDate()}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Time grid */}
                <div className="relative">
                  {timeSlots.map((slot) => (
                    <div key={slot.hour} className="grid grid-cols-8 border-b border-[#222]" style={{ height: "64px" }}>
                      <div className="p-2 border-r border-[#222] text-xs text-gray-400 text-right pr-4">
                        {slot.label}
                      </div>
                      {weekDays.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="border-r border-[#222] relative hover:bg-[#111116]/50 transition-colors"
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(day, slot.hour)}
                        >
                          {getEventsForTimeSlot(day, slot.hour).map((event) => {
                            const style = getEventStyle(event)

                            return (
                              <motion.div
                                key={event.id}
                                draggable
                                onDragStart={() => handleDragStart(event)}
                                onClick={() => setSelectedEvent(event)}
                                className="absolute left-1 right-1 rounded-md p-2 cursor-move overflow-hidden"
                                style={style}
                                whileHover={{ scale: 1.02 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                <div className="text-xs font-semibold text-white truncate">{event.title}</div>
                                <div className="text-xs text-gray-300 truncate">
                                  {new Date(event.startTime).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <div className="text-xs text-gray-400 mt-1 capitalize">{event.priority}</div>
                              </motion.div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Current time indicator */}
                  {viewMode === "week" && currentTimePosition >= 0 && currentTimePosition <= 1088 && (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{ top: `${currentTimePosition}px` }}
                    >
                      <div className="flex items-center">
                        <div className="w-16 flex justify-end pr-2">
                          <div className="w-3 h-3 rounded-full bg-[#00FFFF] animate-pulse shadow-[0_0_10px_#00FFFF]" />
                        </div>
                        <div className="flex-1 h-[1px] bg-[#00FFFF] shadow-[0_0_10px_#00FFFF]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Day view */}
          {viewMode === "day" && (
            <div className="flex-1 overflow-auto">
              <div className="max-w-4xl mx-auto">
                {timeSlots.map((slot) => (
                  <div key={slot.hour} className="flex border-b border-[#222]" style={{ height: "64px" }}>
                    <div className="w-24 p-2 text-xs text-gray-400 text-right pr-4">{slot.label}</div>
                    <div
                      className="flex-1 relative hover:bg-[#111116]/50 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(selectedDate, slot.hour)}
                    >
                      {getEventsForTimeSlot(selectedDate, slot.hour).map((event) => {
                        const style = getEventStyle(event)

                        return (
                          <motion.div
                            key={event.id}
                            draggable
                            onDragStart={() => handleDragStart(event)}
                            onClick={() => setSelectedEvent(event)}
                            className="absolute left-2 right-2 rounded-md p-3 cursor-move backdrop-blur-sm"
                            style={style}
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="text-sm font-semibold text-white">{event.title}</div>
                            <div className="text-xs text-gray-300 mt-1">
                              {new Date(event.startTime).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </div>
                            <div className="text-xs text-gray-400 mt-1 capitalize">{event.priority}</div>
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
        {showConflictWarning && conflictDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowConflictWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111116] rounded-lg p-6 max-w-md w-full mx-4 border border-red-500/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">⚠️</div>
                <h3 className="text-xl font-semibold text-white">Scheduling Conflict Detected</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                This event conflicts with {conflictDetails.conflictingEvents.length} existing event(s):
              </p>
              <div className="space-y-2 mb-4">
                {conflictDetails.conflictingEvents.map((event: CalendarEvent) => (
                  <div key={event.id} className="p-3 rounded-lg bg-[#0A0A0F] border border-red-500/30">
                    <p className="text-sm font-semibold text-white">{event.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(event.startTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(event.endTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
              {conflictDetails.suggestions.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Suggestions:</p>
                  <ul className="space-y-1">
                    {conflictDetails.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="text-xs text-[#00FFFF]">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button
                onClick={() => setShowConflictWarning(false)}
                className="w-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event detail modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111116] rounded-lg p-6 max-w-md w-full mx-4 border border-[#222]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 rounded-lg hover:bg-[#1a1a1f] transition-colors"
                >
                  <XIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
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
                  <Badge
                    className="mt-1"
                    style={{
                      backgroundColor: getCategoryColor(selectedEvent.category),
                      borderColor: getCategoryBorderColor(selectedEvent.category),
                      color: "white",
                    }}
                  >
                    {selectedEvent.category}
                  </Badge>
                </div>
                {selectedEvent.description && (
                  <div>
                    <p className="text-sm text-gray-400">Description</p>
                    <p className="text-white text-sm mt-1">{selectedEvent.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Priority</p>
                  <Badge
                    className="mt-1"
                    style={{
                      backgroundColor: getPriorityColor(selectedEvent.priority),
                      color: "white",
                    }}
                  >
                    {selectedEvent.priority}
                  </Badge>
                </div>
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
                <Button
                  onClick={() => setSelectedEvent(null)}
                  variant="outline"
                  className="flex-1 bg-[#1a1a1f] border-[#222] text-white"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add event modal */}
      <AnimatePresence>
        {showAddEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowAddEvent(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111116] rounded-lg p-6 max-w-md w-full mx-4 border border-[#222]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Add New Event</h3>
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="p-1 rounded-lg hover:bg-[#1a1a1f] transition-colors"
                >
                  <XIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Title</label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                    className="bg-[#0A0A0F] border-[#222] text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Description</label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event description (optional)"
                    className="bg-[#0A0A0F] border-[#222] text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Start Time</label>
                    <Input
                      type="datetime-local"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="bg-[#0A0A0F] border-[#222] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">End Time</label>
                    <Input
                      type="datetime-local"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className="bg-[#0A0A0F] border-[#222] text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full bg-[#0A0A0F] border border-[#222] text-white rounded-md px-3 py-2"
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                    <option value="Social">Social</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Priority</label>
                  <select
                    value={newEvent.priority}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        priority: e.target.value as "critical" | "high" | "normal" | "leisure",
                      })
                    }
                    className="w-full bg-[#0A0A0F] border border-[#222] text-white rounded-md px-3 py-2"
                  >
                    <option value="critical">Critical (Red) - Urgent, high-stakes events</option>
                    <option value="high">High (White) - Important business meetings</option>
                    <option value="normal">Normal (Green) - Standard tasks and meetings</option>
                    <option value="leisure">Leisure (Blue) - Rest, workouts, personal time</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Priority determines reminder frequency and visual coding</p>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleAddEvent} className="flex-1 bg-[#00FFFF] text-black hover:bg-[#00CCCC]">
                  Add Event
                </Button>
                <Button
                  onClick={() => setShowAddEvent(false)}
                  variant="outline"
                  className="flex-1 bg-[#1a1a1f] border-[#222] text-white"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
