"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface GradientTextProps {
  children: ReactNode
  className?: string
  from?: string
  to?: string
}

export default function GradientText({ children, className, from = "#22d3ee", to = "#a78bfa" }: GradientTextProps) {
  return (
    <span
      className={cn("font-bold", className)}
      style={{
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  )
}
