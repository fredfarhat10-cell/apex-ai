"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApexSpinner } from "@/components/apex-spinner"
import { TrendingUpIcon, TargetIcon, CalendarIcon, DollarSignIcon, AlertCircleIcon } from "@/components/icons"
import type { FinancialGoal, GoalProjection } from "@/lib/types/financial-goals"

export default function GoalAccelerator() {
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [projections, setProjections] = useState<Record<string, GoalProjection>>({})
  const [loading, setLoading] = useState(true)
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showScenarioModal, setShowScenarioModal] = useState(false)

  // New goal form state
  const [newGoal, setNewGoal] = useState({
    name: "",
    type: "custom" as const,
    targetAmount: 0,
    monthlyContribution: 0,
    targetDate: "",
    riskTolerance: "moderate" as const,
    priority: "medium" as const,
  })

  // Scenario form state
  const [scenario, setScenario] = useState({
    name: "",
    description: "",
    monthlyContribution: 0,
    targetDate: "",
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/goals/list?userId=demo-user")
      const data = await response.json()

      if (data.success) {
        setGoals(data.goals)

        // Fetch projections for each goal
        for (const goal of data.goals) {
          fetchProjection(goal)
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjection = async (goal: FinancialGoal) => {
    try {
      const response = await fetch("/api/goals/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId: goal.id }),
      })

      const data = await response.json()

      if (data.success) {
        setProjections((prev) => ({
          ...prev,
          [goal.id]: data.projection,
        }))
      }
    } catch (error) {
      console.error("[v0] Error fetching projection:", error)
    }
  }

  const createGoal = async () => {
    try {
      const response = await fetch("/api/goals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          ...newGoal,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setShowCreateModal(false)
        fetchGoals()
        // Reset form
        setNewGoal({
          name: "",
          type: "custom",
          targetAmount: 0,
          monthlyContribution: 0,
          targetDate: "",
          riskTolerance: "moderate",
          priority: "medium",
        })
      }
    } catch (error) {
      console.error("[v0] Error creating goal:", error)
    }
  }

  const runScenario = async () => {
    if (!selectedGoal) return

    try {
      const response = await fetch("/api/goals/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: selectedGoal.id,
          name: scenario.name,
          description: scenario.description,
          adjustments: {
            monthlyContribution: scenario.monthlyContribution || undefined,
            targetDate: scenario.targetDate || undefined,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(
          `Scenario Result:\nFinal Amount: $${data.scenario.projectedOutcome.finalAmount.toFixed(2)}\nSuccess Probability: ${data.scenario.projectedOutcome.successProbability.toFixed(1)}%`,
        )
        setShowScenarioModal(false)
      }
    } catch (error) {
      console.error("[v0] Error running scenario:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ahead":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "on-track":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "behind":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "completed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0f] text-white flex items-center justify-center">
        <ApexSpinner />
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-[#0a0a0f] text-white overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TargetIcon size={32} className="text-cyan-400" />
              <h1 className="text-4xl font-bold gradient-text">Goal Accelerator</h1>
            </div>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">Create New Goal</Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0f1118] border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-cyan-400">Create Financial Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Goal Name</Label>
                    <Input
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                      placeholder="e.g., New Home Fund"
                      className="bg-[#14161e] border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label>Goal Type</Label>
                    <Select
                      value={newGoal.type}
                      onValueChange={(value: any) => setNewGoal({ ...newGoal, type: value })}
                    >
                      <SelectTrigger className="bg-[#14161e] border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#14161e] border-white/20 text-white">
                        <SelectItem value="retirement">Retirement</SelectItem>
                        <SelectItem value="home">Home Purchase</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="emergency">Emergency Fund</SelectItem>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Amount ($)</Label>
                    <Input
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number.parseFloat(e.target.value) })}
                      className="bg-[#14161e] border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label>Monthly Contribution ($)</Label>
                    <Input
                      type="number"
                      value={newGoal.monthlyContribution}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, monthlyContribution: Number.parseFloat(e.target.value) })
                      }
                      className="bg-[#14161e] border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label>Target Date</Label>
                    <Input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                      className="bg-[#14161e] border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label>Risk Tolerance</Label>
                    <Select
                      value={newGoal.riskTolerance}
                      onValueChange={(value: any) => setNewGoal({ ...newGoal, riskTolerance: value })}
                    >
                      <SelectTrigger className="bg-[#14161e] border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#14161e] border-white/20 text-white">
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createGoal} className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Create Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-gray-400 text-lg">
            AI-powered goal tracking with Monte Carlo projections and scenario analysis.
          </p>
        </div>

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <Card className="bg-[#0f1118] border border-white/10 p-12 text-center">
            <TargetIcon size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Goals Yet</h3>
            <p className="text-gray-500 mb-4">Create your first financial goal to start tracking your progress.</p>
            <Button onClick={() => setShowCreateModal(true)} className="bg-cyan-600 hover:bg-cyan-700">
              Create Your First Goal
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {goals.map((goal) => {
              const projection = projections[goal.id]
              const progress = (goal.currentAmount / goal.targetAmount) * 100

              return (
                <Card
                  key={goal.id}
                  className="bg-[#0f1118] border border-white/10 p-6 hover:border-cyan-400/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{goal.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(goal.status)}>{goal.status.toUpperCase()}</Badge>
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                          {goal.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <Dialog
                      open={showScenarioModal && selectedGoal?.id === goal.id}
                      onOpenChange={setShowScenarioModal}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setSelectedGoal(goal)}
                          variant="outline"
                          className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
                        >
                          Run Scenario
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0f1118] border-white/20 text-white">
                        <DialogHeader>
                          <DialogTitle className="text-cyan-400">Scenario Simulator</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Scenario Name</Label>
                            <Input
                              value={scenario.name}
                              onChange={(e) => setScenario({ ...scenario, name: e.target.value })}
                              placeholder="e.g., Increased Savings"
                              className="bg-[#14161e] border-white/20 text-white"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={scenario.description}
                              onChange={(e) => setScenario({ ...scenario, description: e.target.value })}
                              placeholder="What if I..."
                              className="bg-[#14161e] border-white/20 text-white"
                            />
                          </div>
                          <div>
                            <Label>Adjusted Monthly Contribution ($)</Label>
                            <Input
                              type="number"
                              value={scenario.monthlyContribution}
                              onChange={(e) =>
                                setScenario({ ...scenario, monthlyContribution: Number.parseFloat(e.target.value) })
                              }
                              placeholder={`Current: $${goal.monthlyContribution}`}
                              className="bg-[#14161e] border-white/20 text-white"
                            />
                          </div>
                          <div>
                            <Label>Adjusted Target Date</Label>
                            <Input
                              type="date"
                              value={scenario.targetDate}
                              onChange={(e) => setScenario({ ...scenario, targetDate: e.target.value })}
                              className="bg-[#14161e] border-white/20 text-white"
                            />
                          </div>
                          <Button onClick={runScenario} className="w-full bg-purple-600 hover:bg-purple-700">
                            Simulate Scenario
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progress</span>
                      <span className="text-sm font-semibold text-cyan-400">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-3 bg-[#14161e]" />
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#14161e] p-4 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSignIcon className="text-green-400" size={16} />
                        <span className="text-xs text-gray-400">Current Amount</span>
                      </div>
                      <p className="text-xl font-bold text-white">${goal.currentAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#14161e] p-4 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <TargetIcon className="text-blue-400" size={16} />
                        <span className="text-xs text-gray-400">Target Amount</span>
                      </div>
                      <p className="text-xl font-bold text-white">${goal.targetAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#14161e] p-4 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className="text-purple-400" size={16} />
                        <span className="text-xs text-gray-400">Target Date</span>
                      </div>
                      <p className="text-xl font-bold text-white">{new Date(goal.targetDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* AI Projection */}
                  {projection && (
                    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUpIcon className="text-cyan-400" />
                        <h4 className="text-lg font-semibold text-cyan-400">AI Projection</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-xs text-gray-400">Success Probability</span>
                          <p className="text-2xl font-bold text-white">{projection.probabilityOfSuccess.toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Projected Amount</span>
                          <p className="text-2xl font-bold text-white">
                            ${projection.projectedAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Recommended Monthly</span>
                          <p className="text-2xl font-bold text-white">
                            ${projection.monthlyContributionNeeded.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {projection.recommendedAdjustments.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircleIcon className="text-yellow-400" size={16} />
                            <span className="text-sm font-semibold text-yellow-400">Recommended Adjustments</span>
                          </div>
                          <ul className="space-y-1">
                            {projection.recommendedAdjustments.map((adjustment, idx) => (
                              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>{adjustment}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
