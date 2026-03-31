"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarAI, type SchedulingSuggestion } from "@/lib/calendar-ai"
import type { CalendarEvent } from "@/lib/types"
import { SparklesIcon, ChevronDownIcon, ChevronUpIcon } from "./icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CalendarAIAssistantProps {
  events: CalendarEvent[]
  onApplySuggestion?: (suggestion: SchedulingSuggestion) => void
}

export default function CalendarAIAssistant({ events, onApplySuggestion }: CalendarAIAssistantProps) {
  const [suggestions, setSuggestions] = useState<SchedulingSuggestion[]>([])
  const [isExpanded, setIsExpanded] = useState(true)
  const [showInsights, setShowInsights] = useState(false)

  useEffect(() => {
    // Generate AI suggestions
    const optimalTimeSuggestions = CalendarAI.analyzeOptimalTimes(events)
    const focusBlockSuggestions = CalendarAI.suggestFocusBlocks(events)

    // Generate meeting prep suggestions
    const meetingPrepSuggestions = events
      .map((event) => CalendarAI.generateMeetingPrep(event, events))
      .filter((s): s is SchedulingSuggestion => s !== null)

    const allSuggestions = [...optimalTimeSuggestions, ...focusBlockSuggestions, ...meetingPrepSuggestions]

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    allSuggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    setSuggestions(allSuggestions.slice(0, 5)) // Show top 5
  }, [events])

  const patterns = CalendarAI.analyzeProductivityPatterns(events)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/50"
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
      case "low":
        return "bg-blue-500/20 text-blue-300 border-blue-500/50"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "optimal_time":
        return "⏰"
      case "conflict":
        return "⚠️"
      case "buffer":
        return "🔄"
      case "optimization":
        return "📊"
      case "preparation":
        return "📝"
      default:
        return "💡"
    }
  }

  return (
    <div className="bg-[rgba(20,20,25,0.5)] backdrop-blur-sm border border-[rgba(0,255,255,0.3)] rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="p-4 bg-gradient-to-r from-[rgba(0,255,255,0.1)] to-[rgba(0,200,200,0.1)] cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-[#00FFFF]" />
            <h3 className="text-sm font-semibold text-white">AI Scheduling Assistant</h3>
            {suggestions.length > 0 && (
              <Badge className="bg-[#00FFFF]/20 text-[#00FFFF] border-[#00FFFF]/50 text-xs">
                {suggestions.length} insights
              </Badge>
            )}
          </div>
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 space-y-4">
              {/* Suggestions */}
              {suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-[#0A0A0F] border border-[#222] hover:border-[#00FFFF]/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getTypeIcon(suggestion.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-white truncate">{suggestion.title}</h4>
                            <Badge className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">{suggestion.description}</p>
                          {suggestion.action && (
                            <Button
                              size="sm"
                              onClick={() => onApplySuggestion?.(suggestion)}
                              className="mt-2 bg-[#00FFFF]/20 text-[#00FFFF] hover:bg-[#00FFFF]/30 text-xs"
                            >
                              Apply
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400">No suggestions at the moment.</p>
                  <p className="text-xs text-gray-500 mt-1">Your calendar looks well-optimized!</p>
                </div>
              )}

              {/* Productivity Insights Toggle */}
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="w-full p-3 rounded-lg bg-[#0A0A0F] border border-[#222] hover:border-[#00FFFF]/50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Productivity Insights</span>
                  {showInsights ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Productivity Insights */}
              <AnimatePresence>
                {showInsights && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="p-3 rounded-lg bg-[#0A0A0F] border border-[#222]">
                      <p className="text-xs text-gray-400 mb-1">Busiest Day</p>
                      <p className="text-lg font-semibold text-white">{patterns.busiestDay}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0A0A0F] border border-[#222]">
                      <p className="text-xs text-gray-400 mb-1">Peak Hour</p>
                      <p className="text-lg font-semibold text-white">
                        {patterns.busiestHour === 12
                          ? "12 PM"
                          : patterns.busiestHour > 12
                            ? `${patterns.busiestHour - 12} PM`
                            : `${patterns.busiestHour} AM`}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0A0A0F] border border-[#222]">
                      <p className="text-xs text-gray-400 mb-1">Avg Events/Day</p>
                      <p className="text-lg font-semibold text-white">{patterns.averageEventsPerDay.toFixed(1)}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0A0A0F] border border-[#222]">
                      <p className="text-xs text-gray-400 mb-2">Category Breakdown</p>
                      <div className="space-y-2">
                        {Object.entries(patterns.categoryBreakdown).map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-xs text-white">{category}</span>
                            <span className="text-xs font-semibold text-[#00FFFF]">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
