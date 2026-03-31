"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dna, TrendingUp, Zap, Target, Heart, Users, Brain, Shield, Compass } from "lucide-react"
import type { LifeGenome, ParallelLife, GenomeMutation } from "@/lib/types/genome-mutation"
import { useVault } from "@/lib/vault-context"

const archetypeIcons = {
  Optimizer: Target,
  Explorer: Compass,
  Builder: Zap,
  Healer: Heart,
  Connector: Users,
  Scholar: Brain,
  Maverick: TrendingUp,
  Guardian: Shield,
}

const archetypeColors = {
  Optimizer: "text-blue-500",
  Explorer: "text-purple-500",
  Builder: "text-orange-500",
  Healer: "text-green-500",
  Connector: "text-pink-500",
  Scholar: "text-indigo-500",
  Maverick: "text-red-500",
  Guardian: "text-yellow-500",
}

export default function GenomeRibbon() {
  const vault = useVault()
  const [genome, setGenome] = useState<LifeGenome | null>(null)
  const [mutation, setMutation] = useState<GenomeMutation | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPath, setSelectedPath] = useState<ParallelLife | null>(null)

  useEffect(() => {
    analyzeGenome()
  }, [])

  const analyzeGenome = async () => {
    try {
      const response = await fetch("/api/genome/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-123",
          userContext: vault,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setGenome(data.genome)
        await proposeMutation(data.genome)
      }
    } catch (error) {
      console.error("[v0] Failed to analyze genome:", error)
    } finally {
      setLoading(false)
    }
  }

  const proposeMutation = async (currentGenome: LifeGenome) => {
    try {
      const response = await fetch("/api/genome/mutate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-123",
          currentGenome,
          userContext: vault,
          recentDecisions: [],
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMutation(data.mutation)
        setSelectedPath(data.mutation.currentPath)
      }
    } catch (error) {
      console.error("[v0] Failed to propose mutation:", error)
    }
  }

  if (loading || !genome) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Dna className="w-5 h-5 text-[#D4AF37] animate-pulse" />
          <p className="text-sm text-muted-foreground">Analyzing life genome...</p>
        </div>
      </Card>
    )
  }

  const Icon = archetypeIcons[genome.currentArchetype]
  const colorClass = archetypeColors[genome.currentArchetype]

  return (
    <div className="space-y-6">
      {/* Current Genome */}
      <Card className="p-6 bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border-[#D4AF37]/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
              <Icon className={`w-6 h-6 ${colorClass}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Your Life Genome</h3>
              <p className="text-sm text-muted-foreground">Current Archetype: {genome.currentArchetype}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">
            Active
          </Badge>
        </div>

        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dominant Traits</h4>
          <div className="flex flex-wrap gap-2">
            {genome.dominantTraits.map((trait) => (
              <Badge key={trait} variant="secondary" className="text-xs">
                {trait}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Archetype Distribution
          </h4>
          {Object.entries(genome.archetypeDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([archetype, percentage]) => {
              const ArchIcon = archetypeIcons[archetype as keyof typeof archetypeIcons]
              return (
                <div key={archetype} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ArchIcon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{archetype}</span>
                    </div>
                    <span className="font-medium text-white">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-1" />
                </div>
              )
            })}
        </div>
      </Card>

      {/* Parallel Lives */}
      {mutation && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Dna className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-lg font-semibold text-white">Parallel Life Simulations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {mutation.alternativePaths.slice(0, 4).map((path) => {
              const PathIcon = archetypeIcons[path.archetype]
              const isRecommended = path.id === mutation.recommendedPath
              const isSelected = selectedPath?.id === path.id

              return (
                <button
                  key={path.id}
                  onClick={() => setSelectedPath(path)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? "border-[#D4AF37] bg-[#D4AF37]/10"
                      : "border-border hover:border-[#D4AF37]/50 bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <PathIcon className="w-5 h-5 text-[#D4AF37]" />
                      <h4 className="font-semibold text-white">{path.archetype}</h4>
                    </div>
                    {isRecommended && (
                      <Badge variant="default" className="text-xs bg-[#D4AF37] text-black">
                        Recommended
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Career Satisfaction</span>
                      <span className="font-medium text-white">{path.projectedOutcomes.career.satisfaction}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Financial Freedom</span>
                      <span className="font-medium text-white">{path.projectedOutcomes.financial.freedom}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purpose</span>
                      <span className="font-medium text-white">{path.projectedOutcomes.fulfillment.purpose}%</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Probability: {Math.round(path.probability * 100)}% · {path.timeHorizon}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedPath && (
            <Card className="p-6 bg-muted/30 border-[#D4AF37]/20">
              <h4 className="text-sm font-semibold text-white mb-4">{selectedPath.archetype} Path Details</h4>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Career Role</p>
                  <p className="text-sm font-medium text-white">{selectedPath.projectedOutcomes.career.role}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Projected Income</p>
                  <p className="text-sm font-medium text-white">
                    ${(selectedPath.projectedOutcomes.career.income / 1000).toFixed(0)}k
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Net Worth (5yr)</p>
                  <p className="text-sm font-medium text-white">
                    ${(selectedPath.projectedOutcomes.financial.netWorth / 1000).toFixed(0)}k
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Health Score</p>
                  <p className="text-sm font-medium text-white">{selectedPath.projectedOutcomes.wellness.health}/100</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Longevity</p>
                  <p className="text-sm font-medium text-white">
                    {selectedPath.projectedOutcomes.wellness.longevity} years
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Legacy Impact</p>
                  <p className="text-sm font-medium text-white">
                    {selectedPath.projectedOutcomes.fulfillment.legacy}/100
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Milestones</h5>
                {selectedPath.keyMilestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <span className="text-[#D4AF37] font-mono text-xs mt-0.5">Year {milestone.year}</span>
                    <div className="flex-1">
                      <p className="text-white font-medium">{milestone.event}</p>
                      <p className="text-xs text-muted-foreground">{milestone.impact}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPath.id === mutation.recommendedPath && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-start gap-3 p-4 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/20">
                    <Zap className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#D4AF37] mb-1">Recommended Path</p>
                      <p className="text-sm text-muted-foreground">{mutation.reasoning}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-black">
                    Initiate Genome Mutation
                  </Button>
                </div>
              )}
            </Card>
          )}
        </Card>
      )}
    </div>
  )
}
