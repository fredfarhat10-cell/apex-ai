"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, AlertTriangle, TrendingUp, Brain, Check, X, Clock } from "lucide-react"
import type { UnspokenDesire, PreCognitionEvent, AutonomousAction } from "@/lib/types/precognition"
import { useVault } from "@/lib/vault-context"

export default function PreCognitionFeed() {
  const vault = useVault()
  const [desires, setDesires] = useState<UnspokenDesire[]>([])
  const [events, setEvents] = useState<PreCognitionEvent[]>([])
  const [pendingActions, setPendingActions] = useState<AutonomousAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    detectPreCognition()
    const interval = setInterval(detectPreCognition, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const detectPreCognition = async () => {
    try {
      const response = await fetch("/api/precognition/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-123",
          userContext: vault,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setDesires(data.desires)
        setEvents(data.events)
      }
    } catch (error) {
      console.error("[v0] Failed to detect pre-cognition:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveAction = async (desire: UnspokenDesire) => {
    try {
      const response = await fetch("/api/precognition/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-123",
          desire,
        }),
      })

      const data = await response.json()
      if (data.success) {
        if (data.requiresApproval) {
          setPendingActions((prev) => [...prev, data.action])
        } else {
          // Action executed immediately
          setDesires((prev) => prev.filter((d) => d.id !== desire.id))
        }
      }
    } catch (error) {
      console.error("[v0] Failed to execute action:", error)
    }
  }

  const handleRejectAction = (desireId: string) => {
    setDesires((prev) => prev.filter((d) => d.id !== desireId))
  }

  const getPriorityColor = (priority: PreCognitionEvent["priority"]) => {
    switch (priority) {
      case "critical":
        return "text-red-500 border-red-500/20 bg-red-500/10"
      case "high":
        return "text-orange-500 border-orange-500/20 bg-orange-500/10"
      case "medium":
        return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10"
      case "low":
        return "text-blue-500 border-blue-500/20 bg-blue-500/10"
    }
  }

  const getEventIcon = (eventType: PreCognitionEvent["eventType"]) => {
    switch (eventType) {
      case "opportunity-window":
        return <TrendingUp className="w-5 h-5" />
      case "risk-spike":
        return <AlertTriangle className="w-5 h-5" />
      case "pattern-break":
        return <Zap className="w-5 h-5" />
      case "unspoken-desire":
        return <Brain className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-[#D4AF37] animate-pulse" />
          <p className="text-sm text-muted-foreground">Scanning for pre-cognition signals...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Unspoken Desires */}
      {desires.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#D4AF37]" />
            Unspoken Desires Detected
          </h3>

          {desires.map((desire) => (
            <Card key={desire.id} className="p-6 border-[#D4AF37]/20 bg-[#D4AF37]/5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">
                      {desire.desireType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(desire.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white mb-1">{desire.inferredIntent}</p>
                  <p className="text-sm text-muted-foreground">{desire.suggestedAction}</p>
                </div>
              </div>

              {desire.autonomousActionPlan && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Autonomous Action Available</span>
                  </div>

                  <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                    <p className="text-sm font-medium text-white mb-2">{desire.autonomousActionPlan.action}</p>
                    <div className="space-y-1">
                      {desire.autonomousActionPlan.steps.slice(0, 3).map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="text-[#D4AF37] mt-0.5">{idx + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Cost: ${desire.autonomousActionPlan.estimatedCost}</span>
                        <span>•</span>
                        <span>{desire.autonomousActionPlan.reversible ? "Reversible" : "Irreversible"}</span>
                      </div>
                      {desire.autonomousActionPlan.requiresApproval && (
                        <Badge variant="outline" className="text-xs">
                          Requires Approval
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => handleApproveAction(desire)}
                  size="sm"
                  className="bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-black gap-2"
                >
                  <Check className="w-4 h-4" />
                  Approve Action
                </Button>
                <Button onClick={() => handleRejectAction(desire.id)} size="sm" variant="outline" className="gap-2">
                  <X className="w-4 h-4" />
                  Dismiss
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pre-Cognition Events */}
      {events.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#D4AF37]" />
            Pre-Cognition Events
          </h3>

          {events.map((event) => (
            <Card key={event.id} className={`p-4 border ${getPriorityColor(event.priority)}`}>
              <div className="flex items-start gap-3">
                <div className={getPriorityColor(event.priority).split(" ")[0]}>{getEventIcon(event.eventType)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white">{event.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {event.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                  {event.context.recommendation && (
                    <p className="text-xs text-[#D4AF37]">→ {event.context.recommendation}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Pending Autonomous Actions</h3>

          {pendingActions.map((action) => (
            <Card key={action.id} className="p-4 border-[#D4AF37]/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-white">{action.description}</p>
                  <p className="text-xs text-muted-foreground">Status: {action.status}</p>
                </div>
                <Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">
                  {action.actionType}
                </Badge>
              </div>

              <div className="space-y-2">
                {action.executionPlan.steps.map((step) => (
                  <div key={step.order} className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        step.status === "completed"
                          ? "bg-green-500"
                          : step.status === "in-progress"
                            ? "bg-yellow-500 animate-pulse"
                            : "bg-gray-500"
                      }`}
                    />
                    <span className="text-muted-foreground">{step.action}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {desires.length === 0 && events.length === 0 && pendingActions.length === 0 && (
        <Card className="p-8 text-center">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No pre-cognition signals detected</p>
          <p className="text-xs text-muted-foreground mt-1">Continue using Apex AI to build behavioral patterns</p>
        </Card>
      )}
    </div>
  )
}
