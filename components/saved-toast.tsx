"use client"

import { useEffect } from "react"
import { CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SavedToastProps {
  message?: string
  duration?: number
}

export function SavedToast({ message = "Changes saved successfully", duration = 3000 }: SavedToastProps) {
  const { toast } = useToast()

  useEffect(() => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400 checkmark-animate" />
          <span>Saved!</span>
        </div>
      ),
      description: message,
      duration,
    })
  }, [message, duration, toast])

  return null
}

export function showSavedToast(message?: string) {
  const { toast } = useToast()

  toast({
    title: (
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-400" />
        <span>Saved!</span>
      </div>
    ),
    description: message || "Changes saved successfully",
    duration: 3000,
  })
}
