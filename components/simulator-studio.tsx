"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { GitBranchIcon, SparklesIcon } from "lucide-react"
import { EchoChamber } from "@/components/echo-chamber"

export default function SimulatorStudio() {
  const [decisionQuery, setDecisionQuery] = useState("")
  const [isEchoChamberActive, setIsEchoChamberActive] = useState(false)

  const runSimulation = () => {
    if (!decisionQuery.trim()) return
    setIsEchoChamberActive(true)
  }

  return (
    <>
      <div className="h-full overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <GitBranchIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-balance">Project Echo Prime</h1>
            <p className="text-muted-foreground">Immersive AI Life Simulator & Decision Engine</p>
          </div>
        </div>

        {/* Input Section */}
        <Card className="p-8 bg-gradient-to-br from-background to-muted/20 border-2">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Enter the Echo Chamber</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Describe a major life decision you're considering. Apex will transport you to the Echo Chamber where
                you'll witness your complete Life Model being analyzed and three probable timelines being woven before
                your eyes.
              </p>
            </div>

            <Textarea
              value={decisionQuery}
              onChange={(e) => setDecisionQuery(e.target.value)}
              placeholder="Example: I've been offered a Senior Director role in New York. It's a huge step up, but it means moving and longer hours. What would happen if I take it?"
              className="min-h-[120px] text-base resize-none"
            />

            <div className="flex justify-center">
              <Button
                onClick={runSimulation}
                disabled={!decisionQuery.trim()}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Enter Echo Chamber
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Echo Chamber */}
      <EchoChamber
        isActive={isEchoChamberActive}
        decisionQuery={decisionQuery}
        onClose={() => setIsEchoChamberActive(false)}
      />
    </>
  )
}
