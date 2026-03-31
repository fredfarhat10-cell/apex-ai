"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIFeedbackProps {
  outputId: string
  outputType: "travel_plan" | "weekly_sync" | "alpha_brief" | "career_review" | "daily_path"
  onFeedback?: (feedback: "positive" | "negative") => void
}

export function AIFeedback({ outputId, outputType, onFeedback }: AIFeedbackProps) {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFeedback = async (type: "positive" | "negative") => {
    setLoading(true)
    setFeedback(type)

    try {
      // Send feedback to backend for memory processing
      const response = await fetch("/api/memory/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outputId,
          outputType,
          feedback: type,
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        onFeedback?.(type)
      }
    } catch (error) {
      console.error("[v0] Failed to submit feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
      <span className="text-sm text-muted-foreground">Was this helpful?</span>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={feedback === "positive" ? "default" : "outline"}
          onClick={() => handleFeedback("positive")}
          disabled={loading || feedback !== null}
          className={cn("transition-all", feedback === "positive" && "bg-green-500 hover:bg-green-600")}
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={feedback === "negative" ? "default" : "outline"}
          onClick={() => handleFeedback("negative")}
          disabled={loading || feedback !== null}
          className={cn("transition-all", feedback === "negative" && "bg-red-500 hover:bg-red-600")}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </div>
      {feedback && (
        <span className="text-xs text-muted-foreground ml-2">Thanks for your feedback! Apex is learning...</span>
      )}
    </div>
  )
}
