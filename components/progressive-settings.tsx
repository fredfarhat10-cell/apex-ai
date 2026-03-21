"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "./icons"

interface ProgressiveSettingsProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function ProgressiveSettings({ children, title, description }: ProgressiveSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-apex-dark/50 hover:bg-apex-dark transition-colors"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${title}`}
      >
        <div className="text-left">
          <h3 className="font-semibold text-white">{title}</h3>
          {description && <p className="text-sm text-apex-gray mt-1">{description}</p>}
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-apex-gray" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-apex-gray" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 bg-apex-darker/50 border-t border-gray-800 animate-slide-down">{children}</div>
      )}
    </div>
  )
}
