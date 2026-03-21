"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingDown, TrendingUp, Zap, Target, Brain } from "lucide-react"
import type { RegretUnit, PreCognitionTrigger } from "@/lib/types/regret-engine"
import { useVault } from "@/lib/vault-context"

export default function RegretMinimizationDashboard() {
  const vault = useVault()
  const [regretUnits, setRegretUnits] = useState<RegretUnit[]>([])
  const [triggers, setTriggers] = useState<PreCognitionTrigger[]>([])
  const [loading, setLoading] = useState(true)
  const [totalRUSaved, setTotalRUSaved] = useState(0)
  const [totalRUSpent, setTotalRUSpent] = useState(0)

  useEffect(() => {
    fetchRegretData()
    fetchPreCognitionTriggers()
  }, [])

  const fetchRegretData = async () => {
    // For now, using mock data
    setRegretUnits([])
    setTotalRUSaved(1250)
    setTotalRUSpent(340)
    setLoading(false)
  }

  const fetchPreCognitionTriggers = async () => {
    try {
      const response = await fetch("/api/precognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-123",
          userContext: vault,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setTriggers(data.triggers)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch pre-cognition triggers:", error)
    }
  }

  const analyzeDecision = async (decision: string) => {
    try {
      const response = await fetch("/api/regret-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-123",
          decision,
          context: {
            domain: "career",
            urgency: "short-term",
            reversibility: "moderate",
          },
          userContext: vault,
          alternatives: [],
        }),
      })

      const data = await response.json()
      if (data.success) {
        setRegretUnits((prev) => [data.regretUnit, ...prev])
      }
    } catch (error) {
      console.error("[v0] Failed to analyze decision:", error)
    }
  }

  const netRU = totalRUSaved - totalRUSpent

  return (
    <div className="space-y-6">
      {/* Emotional P&L Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-green-500">RU Saved</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-white">{totalRUSaved}</p>
          <p className="text-xs text-muted-foreground mt-1">Regrets prevented</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-red-500">RU Spent</h3>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-white">{totalRUSpent}</p>
          <p className="text-xs text-muted-foreground mt-1">Regrets experienced</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-blue-500">Net RU</h3>
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">
            {netRU > 0 ? "+" : ""}
            {netRU}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Lifetime balance</p>
        </Card>
      </div>

      {/* Pre-Cognition Triggers */}
      {triggers.length > 0 && (
        <Card className="p-6 border-[#D4AF37]/20 bg-[#D4AF37]/5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-lg font-semibold text-[#D4AF37]">Pre-Cognition Triggers Detected</h3>
          </div>

          <div className="space-y-3">
            {triggers.map((trigger) => (
              <div key={trigger.id} className="p-4 bg-background/50 rounded-lg border border-[#D4AF37]/10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[#D4AF37]" />
                    <Badge variant="outline" className="text-xs">
                      {trigger.triggerType.replace("-", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(trigger.confidence * 100)}% confidence
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">RU Impact: {trigger.ruImpact}</span>
                </div>

                <p className="text-sm text-muted-foreground mb-2">{trigger.signal}</p>
                <p className="text-sm font-medium text-white">{trigger.suggestedAction}</p>

                {trigger.autonomousActionAvailable && (
                  <Button size="sm" className="mt-3 bg-[#D4AF37] hover:bg-[#D4AF37]/80">
                    Execute Autonomous Action
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Regret Analysis */}
      {regretUnits.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Regret Analysis</h3>

          <div className="space-y-4">
            {regretUnits.map((ru) => (
              <div key={ru.id} className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-medium text-white mb-1">{ru.decision}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={ru.ruScore > 70 ? "destructive" : ru.ruScore > 40 ? "default" : "secondary"}>
                        RU Score: {ru.ruScore}
                      </Badge>
                      <span>•</span>
                      <span>{ru.context.domain}</span>
                      <span>•</span>
                      <span>{ru.context.urgency}</span>
                    </div>
                  </div>
                  <AlertTriangle
                    className={`w-5 h-5 ${ru.ruScore > 70 ? "text-red-500" : ru.ruScore > 40 ? "text-yellow-500" : "text-green-500"}`}
                  />
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Opportunity Cost</span>
                    <span className="font-medium">{ru.ruBreakdown.opportunityCost}/100</span>
                  </div>
                  <Progress value={ru.ruBreakdown.opportunityCost} className="h-1" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Emotional Impact</span>
                    <span className="font-medium">{ru.ruBreakdown.emotionalImpact}/100</span>
                  </div>
                  <Progress value={ru.ruBreakdown.emotionalImpact} className="h-1" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Compounding Effect</span>
                    <span className="font-medium">{ru.ruBreakdown.compoundingEffect}/100</span>
                  </div>
                  <Progress value={ru.ruBreakdown.compoundingEffect} className="h-1" />
                </div>

                {ru.mitigationStrategies.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Mitigation Strategies:</p>
                    <ul className="space-y-1">
                      {ru.mitigationStrategies.slice(0, 2).map((strategy, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">›</span>
                          <span>{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Test Decision Analysis */}
      <Card className="p-6 border-dashed">
        <h3 className="text-lg font-semibold mb-4">Test Regret Analysis</h3>
        <div className="space-y-3">
          <Button
            onClick={() => analyzeDecision("Accept job offer at startup with 50% pay cut but equity")}
            variant="outline"
            className="w-full justify-start"
          >
            Analyze: "Accept job offer at startup with 50% pay cut but equity"
          </Button>
          <Button
            onClick={() => analyzeDecision("Skip gym today to finish work project")}
            variant="outline"
            className="w-full justify-start"
          >
            Analyze: "Skip gym today to finish work project"
          </Button>
          <Button
            onClick={() => analyzeDecision("Book expensive vacation during busy work season")}
            variant="outline"
            className="w-full justify-start"
          >
            Analyze: "Book expensive vacation during busy work season"
          </Button>
        </div>
      </Card>
    </div>
  )
}
