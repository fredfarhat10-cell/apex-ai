"use client"

import { useState, useEffect } from "react"
import { SparklesIcon } from "./icons"

interface AIStatusIndicatorProps {
  source?: "gemini" | "fallback"
  className?: string
}

export function AIStatusIndicator({ source, className = "" }: AIStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!source) return null

  const isAIActive = source === "gemini" && isOnline

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div className={`flex items-center gap-1 ${isAIActive ? "text-apex-primary" : "text-apex-gray"}`}>
        <SparklesIcon className={`w-3 h-3 ${isAIActive ? "animate-pulse" : ""}`} />
        <span>{isAIActive ? "AI Active" : "Offline Mode"}</span>
      </div>
      {!isOnline && <span className="text-yellow-400 text-xs">(No internet - using local fallbacks)</span>}
    </div>
  )
}
