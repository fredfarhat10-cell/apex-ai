"use client"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import type { ReactNode } from "react"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  glowOnHover?: boolean
  float?: boolean
}

export default function AnimatedCard({ children, className, glowOnHover = true, float = false }: AnimatedCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300 ease-out",
        glowOnHover && "hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:-translate-y-1",
        float && "animate-float",
        "backdrop-blur-sm bg-card/80 border-border/50",
        className,
      )}
    >
      {children}
    </Card>
  )
}
