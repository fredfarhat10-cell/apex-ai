"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { WeeklySyncReport } from "@/lib/types/weekly-sync"
import { AIFeedback } from "@/components/ai-feedback"
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Zap,
  Target,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react"

interface WeeklySyncSessionProps {
  userId: string
  onComplete?: () => void
}

export function WeeklySyncSession({ userId, onComplete }: WeeklySyncSessionProps) {
  const [phase, setPhase] = useState<
    "start" | "after-action" | "resource-audit" | "blueprint" | "execute" | "complete"
  >("start")
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<WeeklySyncReport | null>(null)

  const startSession = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/weekly-sync/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const { session } = await response.json()

      // Generate the full report
      const reportResponse = await fetch("/api/weekly-sync/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, sessionId: session.id }),
      })
      const { report: generatedReport } = await reportResponse.json()

      setReport(generatedReport)
      setPhase("after-action")
    } catch (error) {
      console.error("[v0] Error starting session:", error)
    } finally {
      setLoading(false)
    }
  }

  const executeBlueprint = async () => {
    if (!report) return

    setLoading(true)
    try {
      const response = await fetch("/api/weekly-sync/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sessionId: report.session.id,
          blueprint: report.weekBlueprint,
        }),
      })
      const { confirmation } = await response.json()

      setReport({
        ...report,
        executionConfirmation: confirmation,
      })
      setPhase("complete")
    } catch (error) {
      console.error("[v0] Error executing blueprint:", error)
    } finally {
      setLoading(false)
    }
  }

  if (phase === "start") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
        <div className="max-w-2xl text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Weekly Sync & Strategy Session
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Let's review the past week, audit your resources, and build the optimal blueprint for the week ahead. This
            guided session will help you maximize impact and minimize friction.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <Card className="p-4 text-left">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">After-Action Review</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Analyze wins, challenges, and key insights from the past week
              </p>
            </Card>
            <Card className="p-4 text-left">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold">Resource Audit</h3>
              </div>
              <p className="text-sm text-muted-foreground">Assess your time, money, and energy for the week ahead</p>
            </Card>
            <Card className="p-4 text-left">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Week Blueprint</h3>
              </div>
              <p className="text-sm text-muted-foreground">Design theme days and schedule for peak performance</p>
            </Card>
            <Card className="p-4 text-left">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                <h3 className="font-semibold">Execute Plan</h3>
              </div>
              <p className="text-sm text-muted-foreground">One-tap to populate calendar and task lists</p>
            </Card>
          </div>
          <Button
            size="lg"
            onClick={startSession}
            disabled={loading}
            className="mt-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            {loading ? "Starting Session..." : "Begin Weekly Sync"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Generating your weekly sync report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          {["after-action", "resource-audit", "blueprint", "execute"].map((p, i) => (
            <div key={p} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  phase === p
                    ? "bg-cyan-500 text-white"
                    : i < ["after-action", "resource-audit", "blueprint", "execute"].indexOf(phase)
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && <div className="w-12 h-0.5 bg-muted mx-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* Phase 1: After-Action Review */}
      {phase === "after-action" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Last Week's Debrief</h2>
            <p className="text-muted-foreground">Let's review the past seven days to see what we can learn.</p>
          </div>

          {/* Wins */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold">Wins</h3>
            </div>
            <div className="space-y-3">
              {report.afterActionReview.wins.map((win, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{win.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {win.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{win.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Challenges */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="w-6 h-6 text-orange-500" />
              <h3 className="text-xl font-semibold">Challenges</h3>
            </div>
            <div className="space-y-3">
              {report.afterActionReview.challenges.map((challenge, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{challenge.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {challenge.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Key Insight */}
          <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-cyan-500" />
              <h3 className="text-xl font-semibold">Key Insight</h3>
            </div>
            <p className="text-lg font-medium mb-2">{report.afterActionReview.keyInsight.title}</p>
            <p className="text-muted-foreground mb-3">{report.afterActionReview.keyInsight.description}</p>
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-sm font-medium text-cyan-500">Recommendation:</p>
              <p className="text-sm">{report.afterActionReview.keyInsight.recommendation}</p>
            </div>
          </Card>

          <Button onClick={() => setPhase("resource-audit")} className="w-full" size="lg">
            Continue to Resource Audit
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Phase 2: Resource Audit */}
      {phase === "resource-audit" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Resource Status</h2>
            <p className="text-muted-foreground">Here's your resource status for the week ahead.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Time Capital */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-semibold">Time Capital</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">{report.resourceAudit.timeCapital.flexibleHours}h</p>
                  <p className="text-sm text-muted-foreground">Flexible hours available</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Fixed commitments</span>
                    <span className="font-medium">{report.resourceAudit.timeCapital.fixedCommitments}h</span>
                  </div>
                  <Progress
                    value={
                      (report.resourceAudit.timeCapital.fixedCommitments /
                        report.resourceAudit.timeCapital.totalHours) *
                      100
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </Card>

            {/* Financial Capital */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold">Financial Capital</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">${report.resourceAudit.financialCapital.discretionaryFunds}</p>
                  <p className="text-sm text-muted-foreground">Discretionary budget</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Remaining</span>
                    <span className="font-medium">${report.resourceAudit.financialCapital.remainingFunds}</span>
                  </div>
                  <Progress
                    value={
                      (report.resourceAudit.financialCapital.remainingFunds /
                        report.resourceAudit.financialCapital.discretionaryFunds) *
                      100
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </Card>

            {/* Energy Capital */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-semibold">Energy Capital</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">{report.resourceAudit.energyCapital.currentLevel}%</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {report.resourceAudit.energyCapital.recoveryStatus} recovery
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm">Weekly forecast</p>
                  <div className="flex gap-1">
                    {report.resourceAudit.energyCapital.weeklyForecast.map((day, i) => (
                      <div key={i} className="flex-1">
                        <div
                          className="h-12 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded"
                          style={{ height: `${(day.predictedEnergy / 100) * 48}px` }}
                        />
                        <p className="text-xs text-center mt-1">{day.day.slice(0, 1)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Button onClick={() => setPhase("blueprint")} className="w-full" size="lg">
            Continue to Week Blueprint
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Phase 3: Week Blueprint */}
      {phase === "blueprint" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">This Week's Blueprint</h2>
            <p className="text-muted-foreground">A strategic schedule designed for peak performance.</p>
          </div>

          {/* Theme Days */}
          <div className="space-y-4">
            {report.weekBlueprint.themeDays.map((day, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{day.day}</h3>
                      <Badge className="capitalize">{day.theme.replace("-", " ")}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{day.focus}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{day.energyLevel}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {day.scheduledBlocks.map((block, j) => (
                    <div key={j} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                      <span className="text-sm font-medium text-muted-foreground">
                        {block.startTime} - {block.endTime}
                      </span>
                      <span className="text-sm flex-1">{block.activity}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {block.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Strategic Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Strategic Actions</h3>
            <div className="space-y-3">
              {report.weekBlueprint.strategicActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/10">
                  <Target className="w-5 h-5 text-cyan-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{action.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {action.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Suggested: {action.suggestedDay} • {action.estimatedTime} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="p-6 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
            <p className="text-lg font-medium mb-2">
              This blueprint is designed for maximum impact and minimal friction.
            </p>
            <p className="text-muted-foreground">
              It balances your professional ambitions with your personal well-being. Ready to lock it in?
            </p>
          </div>

          <Button
            onClick={() => setPhase("execute")}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            size="lg"
          >
            Lock In This Plan
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Phase 4: Execute */}
      {phase === "execute" && (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="animate-spin w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full" />
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">Executing Your Week Blueprint</h3>
            <p className="text-muted-foreground">
              Populating your calendar, adding tasks, and configuring notifications...
            </p>
          </div>
          <Button onClick={executeBlueprint} disabled={loading} size="lg">
            {loading ? "Executing..." : "Execute Plan"}
          </Button>
        </div>
      )}

      {/* Phase 5: Complete */}
      {phase === "complete" && report.executionConfirmation && (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Your Week is Scheduled</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{report.executionConfirmation.summary}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6 text-center">
              <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">{report.executionConfirmation.calendarEventsCreated}</p>
              <p className="text-sm text-muted-foreground">Calendar events</p>
            </Card>
            <Card className="p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">{report.executionConfirmation.tasksAdded}</p>
              <p className="text-sm text-muted-foreground">Tasks added</p>
            </Card>
            <Card className="p-6 text-center">
              <Target className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">{report.executionConfirmation.notificationRulesSet}</p>
              <p className="text-sm text-muted-foreground">Notification rules</p>
            </Card>
            <Card className="p-6 text-center">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">{report.executionConfirmation.focusModesConfigured}</p>
              <p className="text-sm text-muted-foreground">Focus modes</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
            <div className="space-y-2">
              {report.executionConfirmation.nextSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-semibold">
                    {i + 1}
                  </div>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>
          </Card>

          <AIFeedback
            outputId={report.session.id}
            outputType="weekly_sync"
            onFeedback={(feedback) => {
              console.log("[v0] Weekly sync feedback:", feedback)
            }}
          />

          <Button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            size="lg"
          >
            Let's Get to Work
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
