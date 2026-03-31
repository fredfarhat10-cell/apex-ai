"use client"

import { useEffect, useState } from "react"
import { Loader2, Sparkles } from "lucide-react"

interface StudioCreationLoaderProps {
  interests: string[]
}

export function StudioCreationLoader({ interests }: StudioCreationLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const steps = [
    "Analyzing your aesthetic preferences...",
    "Curating visual inspiration...",
    "Building your personalized Studios...",
    "Adding finishing touches...",
  ]

  useEffect(() => {
    // Progress through steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }, 3000)

    // Smooth progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 100))
    }, 120)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center z-50">
      <div className="max-w-md w-full px-6 text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Creating Your Personal Space</h2>

        <p className="text-muted-foreground mb-2">{steps[currentStep]}</p>

        <div className="w-full bg-secondary rounded-full h-2 mb-6 overflow-hidden">
          <div className="bg-primary h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>

        {interests.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Building Studios for:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {interests.map((interest, index) => (
                <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
