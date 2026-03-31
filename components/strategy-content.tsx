"use client"

import { useState } from "react"
import { useVault } from "@/lib/vault-context"
import Widget from "./widget"
import Spinner from "./spinner"
import { TargetIcon, ZapIcon } from "./icons"

function CheckCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

export default function StrategyContent() {
  const { strategicGoal, primePath, updateState, userProfile, symbiontFeed } = useVault()
  const [inputGoal, setInputGoal] = useState(strategicGoal)
  const [loading, setLoading] = useState(false)

  const handleGeneratePath = async () => {
    if (!inputGoal) return
    setLoading(true)
    updateState("strategicGoal", inputGoal)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a strategic action plan for this goal: "${inputGoal}". 
          
User context: ${userProfile?.name}, ${userProfile?.occupation}
Skills: ${userProfile?.skills?.join(", ")}

Provide exactly 4-5 concrete, actionable steps in JSON format:
[
  {"title": "Step name", "description": "Detailed action to take"},
  ...
]

Make it specific, realistic, and tailored to the user's background.`,
        }),
      })

      const data = await response.json()

      // Extract JSON from response
      const jsonMatch = data.text.match(/\[[\s\S]*\]/)
      const path = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : [
            { title: "Research & Planning", description: "Conduct thorough research and create a detailed plan" },
            { title: "Build Foundation", description: "Establish the core elements needed for success" },
            { title: "Execute & Iterate", description: "Take action and refine based on feedback" },
            { title: "Scale & Optimize", description: "Expand and improve your approach" },
          ]

      updateState("primePath", path)

      const newEvent = {
        id: Date.now().toString(),
        text: `Generated Prime Path for goal: "${inputGoal.slice(0, 40)}..."`,
        timestamp: new Date().toISOString(),
      }
      updateState("symbiontFeed", [newEvent, ...symbiontFeed])
    } catch (error) {
      console.error("[v0] Prime Path generation error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
        <TargetIcon size={32} className="text-apex-primary" /> Strategy Engine
      </h1>
      <p className="text-apex-gray">Define your major life goal and let Apex simulate the optimal path to success.</p>

      <Widget title="Define Your Goal">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={inputGoal}
            onChange={(e) => setInputGoal(e.target.value)}
            placeholder="e.g., Launch my side project by year-end"
            className="flex-grow bg-apex-darker border border-gray-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-apex-primary text-white"
          />
          <button
            onClick={handleGeneratePath}
            disabled={loading || !inputGoal}
            className="bg-apex-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors flex items-center justify-center gap-2 disabled:bg-opacity-50 whitespace-nowrap"
          >
            {loading ? (
              <Spinner />
            ) : (
              <>
                <ZapIcon size={18} /> Generate Prime Path
              </>
            )}
          </button>
        </div>
      </Widget>

      {primePath.length > 0 && (
        <Widget title="Your Prime Path" className="mt-6">
          <div className="space-y-4">
            {primePath.map((step, index) => (
              <div
                key={index}
                className="p-4 bg-apex-darker border border-gray-700 rounded-lg animate-in fade-in duration-300"
              >
                <h3 className="font-semibold text-lg text-apex-accent flex items-center gap-2">
                  <CheckCircleIcon /> Step {index + 1}: {step.title}
                </h3>
                <p className="text-apex-gray mt-1">{step.description}</p>
              </div>
            ))}
          </div>
        </Widget>
      )}
    </div>
  )
}
