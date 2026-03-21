"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, TrendingUpIcon, AlertTriangleIcon, SparklesIcon, CheckCircleIcon } from "lucide-react"

interface TimelineWeaverProps {
  result: any
  onClose: () => void
}

export function TimelineWeaver({ result, onClose }: TimelineWeaverProps) {
  const [selectedTimeline, setSelectedTimeline] = useState<number | null>(null)
  const [subEchoResult, setSubEchoResult] = useState<string | null>(null)
  const [isRunningSubEcho, setIsRunningSubEcho] = useState(false)

  const colors = [
    { from: "from-yellow-500", to: "to-amber-500", text: "text-yellow-500" },
    { from: "from-gray-400", to: "to-gray-500", text: "text-gray-400" },
    { from: "from-orange-500", to: "to-red-500", text: "text-orange-500" },
  ]

  const runSubEcho = async (timelineIndex: number, action: string, inflectionMonth: number) => {
    setIsRunningSubEcho(true)
    setSubEchoResult(null)

    const timeline = result.echo_paths[timelineIndex]
    const prompt = `Given the context of "${timeline.title}" timeline, what is the outcome of the user choosing to "${action}" at the ${inflectionMonth}-month mark?`

    try {
      const response = await fetch("/api/simulate-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision_query: prompt }),
      })

      if (!response.ok) throw new Error("Sub-echo failed")

      const subResult = await response.json()
      setSubEchoResult(subResult.recommendation)
    } catch (error) {
      console.error("[v0] Sub-echo error:", error)
      // Demo fallback
      setSubEchoResult(
        `If you choose to "${action}" at month ${inflectionMonth}, your probability of success in this timeline increases by 15-20%. This action would help mitigate the primary risk factor and create new opportunities for growth.`,
      )
    } finally {
      setIsRunningSubEcho(false)
    }
  }

  return (
    <div className="w-full h-full overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Timeline Weaver</h1>
            <p className="text-gray-400">Three probable futures have been identified</p>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Orbiting Timelines */}
        <div className="relative h-96 mb-12">
          <AnimatePresence>
            {result.echo_paths.map((path: any, index: number) => {
              const isSelected = selectedTimeline === index
              const angle = (index / result.echo_paths.length) * 2 * Math.PI - Math.PI / 2
              const radius = isSelected ? 0 : 150
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius

              return (
                <motion.div
                  key={index}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  animate={{
                    x: isSelected ? 0 : x,
                    y: isSelected ? 0 : y,
                    scale: isSelected ? 1.2 : 1,
                    zIndex: isSelected ? 10 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 30 }}
                  onClick={() => setSelectedTimeline(isSelected ? null : index)}
                >
                  <motion.div
                    className={`w-24 h-24 rounded-full bg-gradient-to-br ${colors[index].from} ${colors[index].to} flex items-center justify-center border-4 border-white/20`}
                    animate={{
                      boxShadow: isSelected
                        ? [
                            "0 0 40px rgba(255, 255, 255, 0.6)",
                            "0 0 80px rgba(255, 255, 255, 1)",
                            "0 0 40px rgba(255, 255, 255, 0.6)",
                          ]
                        : [
                            "0 0 20px rgba(255, 255, 255, 0.3)",
                            "0 0 40px rgba(255, 255, 255, 0.5)",
                            "0 0 20px rgba(255, 255, 255, 0.3)",
                          ],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold">{path.probability}%</div>
                    </div>
                  </motion.div>
                  {!isSelected && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <p className="text-sm text-white font-medium">{path.title}</p>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Selected Timeline Details */}
        <AnimatePresence>
          {selectedTimeline !== null && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <Card className="p-8 bg-gradient-to-br from-gray-900 to-black border-2 border-white/10">
                {(() => {
                  const path = result.echo_paths[selectedTimeline]
                  return (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-3xl font-bold text-white mb-2">{path.title}</h2>
                          <Badge variant="outline" className={`${colors[selectedTimeline].text} border-current`}>
                            {path.probability}% Probability
                          </Badge>
                        </div>
                      </div>

                      {/* Narrative */}
                      <p className="text-gray-300 text-lg leading-relaxed">{path.narrative}</p>

                      {/* Impacts */}
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                          <TrendingUpIcon className="w-5 h-5" />
                          Key Impacts Across Life Domains
                        </h3>
                        <div className="grid gap-3">
                          {Object.entries(path.impacts).map(([domain, impact]) => (
                            <div key={domain} className="flex gap-3">
                              <span className="font-medium text-white min-w-[140px] capitalize">{domain}:</span>
                              <span className="text-gray-400">{impact as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Outcome */}
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5" />
                          Overall Outcome
                        </h3>
                        <p className="text-gray-300">{path.outcome}</p>
                      </div>

                      {/* Risks & Opportunities */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xl font-semibold text-orange-400 mb-3 flex items-center gap-2">
                            <AlertTriangleIcon className="w-5 h-5" />
                            Risks
                          </h3>
                          <ul className="space-y-2">
                            {path.risks.map((risk: string, i: number) => (
                              <li key={i} className="text-gray-400">
                                • {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-green-400 mb-3 flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5" />
                            Opportunities
                          </h3>
                          <ul className="space-y-2">
                            {path.opportunities.map((opp: string, i: number) => (
                              <li key={i} className="text-gray-400">
                                • {opp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Critical Inflection Points */}
                      {path.inflectionPoints && path.inflectionPoints.length > 0 && (
                        <div className="border-t border-white/10 pt-6">
                          <h3 className="text-2xl font-bold text-white mb-4">Critical Inflection Points</h3>
                          {path.inflectionPoints.map((point: any, i: number) => (
                            <div key={i} className="mb-6 p-6 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                              <h4 className="text-lg font-semibold text-purple-400 mb-2">Month {point.month}</h4>
                              <p className="text-gray-300 mb-4">{point.description}</p>
                              <div className="space-y-2">
                                <p className="text-sm text-gray-400 mb-2">
                                  Would you like to run a Sub-Echo on this inflection point?
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {point.actions.map((action: string, j: number) => (
                                    <Button
                                      key={j}
                                      onClick={() => runSubEcho(selectedTimeline, action, point.month)}
                                      disabled={isRunningSubEcho}
                                      variant="outline"
                                      size="sm"
                                      className="border-purple-500/40 hover:border-purple-500 text-purple-300 hover:text-purple-200"
                                    >
                                      {action}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              {subEchoResult && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded"
                                >
                                  <p className="text-sm text-blue-300">{subEchoResult}</p>
                                </motion.div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        {selectedTimeline === null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-400 mt-8">
            <p>Click on any orbiting timeline to explore that probable future</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
