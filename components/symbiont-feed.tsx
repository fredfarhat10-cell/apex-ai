"use client"

import { useEffect, useRef } from "react"
import type { SymbiontEvent } from "@/lib/types"
import { ActivityIcon } from "./icons"

interface SymbiontFeedProps {
  events: SymbiontEvent[]
  maxItems?: number
}

export default function SymbiontFeed({ events, maxItems = 10 }: SymbiontFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to top when new events arrive
    if (feedRef.current) {
      feedRef.current.scrollTop = 0
    }
  }, [events])

  const displayEvents = events.slice(0, maxItems)

  if (displayEvents.length === 0) {
    return (
      <div className="text-center py-8 text-apex-gray">
        <ActivityIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Your activity feed will appear here</p>
      </div>
    )
  }

  return (
    <div ref={feedRef} className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
      {displayEvents.map((event, index) => (
        <div
          key={event.id}
          className="group relative bg-apex-darker/50 backdrop-blur-sm border border-gray-800/50 rounded-lg p-4 hover:border-apex-primary/50 transition-all animate-slide-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Pulse indicator */}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-apex-primary rounded-full animate-pulse"></div>

          {/* Event content */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-apex-primary/10 rounded-full flex items-center justify-center group-hover:bg-apex-primary/20 transition-colors">
              <ActivityIcon className="w-4 h-4 text-apex-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-apex-light leading-relaxed">{event.text}</p>
              <p className="text-xs text-apex-gray mt-1">
                {new Date(event.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-apex-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
      ))}
    </div>
  )
}
