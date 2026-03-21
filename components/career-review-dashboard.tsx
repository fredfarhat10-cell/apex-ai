"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Briefcase, TrendingUp, Users, Target, Calendar, CheckCircle2 } from "lucide-react"
import type { QuarterlyCareerReview } from "@/lib/types/career"

export function CareerReviewDashboard() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [review, setReview] = useState<QuarterlyCareerReview | null>(null)

  const generateReview = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/career/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: "User", // Get from user context
          career_quest: "Become a Senior Software Engineer at a FAANG company",
        }),
      })

      const data = await response.json()
      if (data.success) {
        setReview(data.review)
      }
    } catch (error) {
      console.error("Error generating career review:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Career Strategy Center</h2>
          <p className="text-muted-foreground">Quarterly reviews and strategic career planning powered by AI</p>
        </div>
        <Button onClick={generateReview} disabled={isGenerating} size="lg" className="gap-2">
          <Briefcase className="h-5 w-5" />
          {isGenerating ? "Generating Review..." : "Generate Quarterly Review"}
        </Button>
      </div>

      {review && (
        <>
          {/* Professional Capital Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skills Capital</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {review.professionalCapital.skills.technical.length + review.professionalCapital.skills.soft.length}
                </div>
                <p className="text-xs text-muted-foreground">Total verified skills</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network Capital</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{review.professionalCapital.network.totalConnections}</div>
                <p className="text-xs text-muted-foreground">Professional connections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productivity</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{review.professionalCapital.productivity.completionRate}%</div>
                <p className="text-xs text-muted-foreground">Task completion rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Skill Gaps */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Skill Gaps</CardTitle>
              <CardDescription>Skills to develop for your career quest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {review.skillGaps.map((gap, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{gap.skill}</span>
                      <Badge variant={getPriorityColor(gap.priority)}>{gap.priority}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {gap.currentLevel} → {gap.requiredLevel}
                    </span>
                  </div>
                  <Progress value={33} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Networking Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Networking Opportunities</CardTitle>
              <CardDescription>Strategic connections to accelerate your career</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {review.networkingOpportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{opportunity.title}</h4>
                      <Badge variant="outline">{opportunity.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                    <p className="text-sm font-medium text-primary">Action: {opportunity.actionRequired}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Plan */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                90-Day Action Plan
              </CardTitle>
              <CardDescription>Your strategic roadmap for the next quarter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skill Development Quest */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">
                  Skill Development Quest: {review.actionPlan.skillDevelopmentQuest.title}
                </h4>
                <p className="text-muted-foreground">{review.actionPlan.skillDevelopmentQuest.description}</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Milestones:</p>
                  {review.actionPlan.skillDevelopmentQuest.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      {milestone}
                    </div>
                  ))}
                </div>
                <Badge variant="secondary">{review.actionPlan.skillDevelopmentQuest.estimatedDuration}</Badge>
              </div>

              {/* Networking Action */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Networking Action: {review.actionPlan.networkingAction.title}</h4>
                <p className="text-muted-foreground">{review.actionPlan.networkingAction.description}</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Steps:</p>
                  {review.actionPlan.networkingAction.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource Requirements */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Time Commitment</p>
                  <p className="text-2xl font-bold">{review.timeCommitment}</p>
                </div>
                {review.budgetRequired && (
                  <div>
                    <p className="text-sm font-medium">Budget Required</p>
                    <p className="text-2xl font-bold">${review.budgetRequired}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
