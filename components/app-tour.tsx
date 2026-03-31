"use client"

import { useState, useEffect } from "react"
import { useVault } from "@/lib/vault-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react"
import { dashboardTourSteps, type TourStep } from "@/lib/tour-steps"

interface AppTourProps {
  steps: TourStep[]
  onComplete: () => void
  onSkip: () => void
}

export function AppTour({ steps, onComplete, onSkip }: AppTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const step = steps[currentStep]
    const element = document.querySelector(step.target)

    if (element) {
      const rect = element.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop

      // Calculate position based on placement
      let top = rect.top + scrollTop
      let left = rect.left

      switch (step.placement) {
        case "bottom":
          top = rect.bottom + scrollTop + 10
          left = rect.left + rect.width / 2 - 200
          break
        case "top":
          top = rect.top + scrollTop - 200
          left = rect.left + rect.width / 2 - 200
          break
        case "left":
          top = rect.top + scrollTop + rect.height / 2 - 100
          left = rect.left - 420
          break
        case "right":
          top = rect.top + scrollTop + rect.height / 2 - 100
          left = rect.right + 10
          break
        default:
          top = rect.bottom + scrollTop + 10
          left = rect.left
      }

      setPosition({ top, left })

      // Highlight the target element
      element.classList.add("tour-highlight")
      return () => {
        element.classList.remove("tour-highlight")
      }
    }
  }, [currentStep, steps])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = steps[currentStep]

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" />
      <Card
        className="fixed z-50 w-96 bg-apex-dark border-apex-primary shadow-2xl animate-in fade-in slide-in-from-bottom-4"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="text-apex-accent" size={20} />
              <h3 className="font-bold text-white">{step.title}</h3>
            </div>
            <button onClick={onSkip} className="text-apex-gray hover:text-white">
              <X size={20} />
            </button>
          </div>

          <p className="text-apex-gray text-sm leading-relaxed">{step.content}</p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <span className="text-xs text-apex-gray">
              {currentStep + 1} of {steps.length}
            </span>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button onClick={handlePrevious} variant="outline" size="sm" className="bg-transparent">
                  <ChevronLeft size={16} />
                  Previous
                </Button>
              )}
              <Button onClick={handleNext} size="sm" className="bg-apex-primary">
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight size={16} />
                  </>
                ) : (
                  "Finish"
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}

export function TourManager() {
  const { isTourActive, endTour } = useVault()
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    if (isTourActive) {
      // Small delay to ensure DOM is ready
      setTimeout(() => setShowTour(true), 500)
    }
  }, [isTourActive])

  if (!showTour) return null

  return (
    <AppTour
      steps={dashboardTourSteps}
      onComplete={() => {
        setShowTour(false)
        endTour()
      }}
      onSkip={() => {
        setShowTour(false)
        endTour()
      }}
    />
  )
}
