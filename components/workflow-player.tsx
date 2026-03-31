"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react"

export interface WorkflowStep {
  id: string
  title: string
  description: string
  status: "pending" | "active" | "complete" | "error"
}

interface WorkflowPlayerProps {
  workflowName: string
  steps: WorkflowStep[]
  onComplete?: () => void
}

export default function WorkflowPlayer({ workflowName, steps, onComplete }: WorkflowPlayerProps) {
  const [currentSteps, setCurrentSteps] = useState<WorkflowStep[]>(steps)

  useEffect(() => {
    setCurrentSteps(steps)
  }, [steps])

  useEffect(() => {
    const allComplete = currentSteps.every((step) => step.status === "complete")
    if (allComplete && onComplete) {
      onComplete()
    }
  }, [currentSteps, onComplete])

  const getStatusIcon = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-6 h-6 text-green-400" />
      case "active":
        return <Loader2 className="w-6 h-6 text-[#FF6B00] animate-spin" />
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-400" />
      default:
        return <Circle className="w-6 h-6 text-gray-600" />
    }
  }

  const getStatusColor = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "complete":
        return "border-green-400/50 bg-green-400/10"
      case "active":
        return "border-[#FF6B00]/50 bg-[#FF6B00]/10"
      case "error":
        return "border-red-400/50 bg-red-400/10"
      default:
        return "border-gray-700 bg-white/5"
    }
  }

  return (
    <div className="glass-effect p-8 rounded-2xl border border-gray-700">
      <div className="mb-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">{workflowName}</h2>
        <p className="text-gray-400">Multi-step workflow in progress</p>
      </div>

      <div className="space-y-4">
        {currentSteps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connecting line */}
            {index < currentSteps.length - 1 && <div className="absolute left-3 top-12 w-0.5 h-8 bg-gray-700" />}

            {/* Step card */}
            <div className={`p-4 rounded-xl border transition-all ${getStatusColor(step.status)}`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getStatusIcon(step.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-500">Step {index + 1}</span>
                    {step.status === "active" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00]">
                        In Progress
                      </span>
                    )}
                    {step.status === "complete" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/20 text-green-400">Complete</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Overall Progress</span>
          <span className="text-sm font-medium text-white">
            {currentSteps.filter((s) => s.status === "complete").length} / {currentSteps.length}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8533] transition-all duration-500"
            style={{
              width: `${(currentSteps.filter((s) => s.status === "complete").length / currentSteps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
