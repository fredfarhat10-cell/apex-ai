"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2Icon, XCircleIcon, TestTubeIcon, PlayIcon } from "./icons"

interface TestScenario {
  id: string
  name: string
  description: string
  endpoint: string
  payload: any
  expectedFields: string[]
}

interface TestResult {
  scenarioId: string
  passed: boolean
  duration: number
  error?: string
  response?: any
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: "simulate-career-change",
    name: "Simulate Career Change",
    description: "Test life simulation for major career decision",
    endpoint: "/api/ai/simulate",
    payload: {
      decision: "What if I quit my job and become a freelance developer?",
      aura: 75,
      userContext: { name: "Test User", occupation: "Software Engineer", goal: "Financial independence" },
    },
    expectedFields: ["decision", "paths"],
  },
  {
    id: "simulate-city-move",
    name: "Simulate Moving Cities",
    description: "Test simulation for relocating to a new city",
    endpoint: "/api/ai/simulate",
    payload: {
      decision: "What if I move to San Francisco for better opportunities?",
      aura: 60,
      userContext: { name: "Test User", occupation: "Designer", goal: "Career growth" },
    },
    expectedFields: ["decision", "paths"],
  },
  {
    id: "insights-high-spending",
    name: "Insights: High Spending",
    description: "Generate insights for user with high expenses",
    endpoint: "/api/ai/insights",
    payload: {
      userProfile: { name: "Test User", occupation: "Engineer" },
      strategicGoal: "Save $10,000 this year",
      expenses: Array.from({ length: 20 }, (_, i) => ({
        id: `exp-${i}`,
        amount: 150 + Math.random() * 100,
        category: "Food",
        date: new Date().toISOString(),
      })),
      habits: [{ id: "h1", name: "Exercise", frequency: "daily" }],
      habitLogs: [],
      knowledgeItems: [],
      aura: "Focused",
    },
    expectedFields: ["insights"],
  },
  {
    id: "insights-habit-streak",
    name: "Insights: Habit Streak",
    description: "Generate insights for user with strong habit streaks",
    endpoint: "/api/ai/insights",
    payload: {
      userProfile: { name: "Test User", occupation: "Writer" },
      strategicGoal: "Write a book",
      expenses: [],
      habits: [{ id: "h1", name: "Write 500 words", frequency: "daily" }],
      habitLogs: Array.from({ length: 30 }, (_, i) => ({
        id: `log-${i}`,
        habitId: "h1",
        date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
        completed: true,
      })),
      knowledgeItems: [],
      aura: "Creative",
    },
    expectedFields: ["insights"],
  },
  {
    id: "prime-path-fitness",
    name: "Prime Path: Fitness Goal",
    description: "Generate strategic path for fitness goal",
    endpoint: "/api/ai/prime-path",
    payload: {
      profile: { name: "Test User", occupation: "Developer", age: 28 },
      goal: "Run a marathon in 6 months",
      aura: "Energized",
      expenses: [],
      habits: [{ id: "h1", name: "Run 3 miles", frequency: "daily" }],
      habitLogs: [],
    },
    expectedFields: ["steps"],
  },
  {
    id: "prime-path-business",
    name: "Prime Path: Business Launch",
    description: "Generate strategic path for starting a business",
    endpoint: "/api/ai/prime-path",
    payload: {
      profile: { name: "Test User", occupation: "Entrepreneur", age: 32 },
      goal: "Launch SaaS product and reach $10k MRR",
      aura: "Focused",
      expenses: [],
      habits: [{ id: "h1", name: "Code for 2 hours", frequency: "daily" }],
      habitLogs: [],
    },
    expectedFields: ["steps"],
  },
  {
    id: "financial-analysis",
    name: "Financial Analysis",
    description: "Generate financial insights and recommendations",
    endpoint: "/api/ai/generate-text",
    payload: {
      prompt:
        "Analyze spending patterns: $500 on dining, $200 on subscriptions, $1000 on rent. Provide recommendations.",
    },
    expectedFields: ["text"],
  },
  {
    id: "studio-tips-music",
    name: "Studio Tips: Music",
    description: "Get personalized tips for music studio",
    endpoint: "/api/ai/studio-tips",
    payload: {
      studioType: "music",
      userHobbies: ["guitar", "music production"],
      userLevel: "intermediate",
    },
    expectedFields: ["tips"],
  },
  {
    id: "activity-suggestions",
    name: "Activity Suggestions",
    description: "Get AI-suggested activities based on hobbies",
    endpoint: "/api/ai/activity-suggestions",
    payload: {
      hobbies: ["guitar", "art", "fitness"],
      currentActivities: [],
    },
    expectedFields: ["suggestions"],
  },
  {
    id: "calendar-suggestions",
    name: "Calendar Event Suggestions",
    description: "Get AI-suggested calendar events",
    endpoint: "/api/ai/calendar-suggestions",
    payload: {
      hobbies: ["guitar", "coding"],
      existingEvents: [],
    },
    expectedFields: ["suggestions"],
  },
]

export default function AITestSuite() {
  const [results, setResults] = useState<TestResult[]>([])
  const [running, setRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)

  const runTest = async (scenario: TestScenario): Promise<TestResult> => {
    const startTime = Date.now()
    setCurrentTest(scenario.id)

    try {
      const response = await fetch(scenario.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenario.payload),
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      // Check if response has expected fields
      const hasExpectedFields = scenario.expectedFields.every((field) => field in data)

      if (!response.ok) {
        return {
          scenarioId: scenario.id,
          passed: false,
          duration,
          error: data.error || "Request failed",
          response: data,
        }
      }

      return {
        scenarioId: scenario.id,
        passed: hasExpectedFields,
        duration,
        response: data,
        error: hasExpectedFields ? undefined : "Missing expected fields",
      }
    } catch (error) {
      return {
        scenarioId: scenario.id,
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    } finally {
      setCurrentTest(null)
    }
  }

  const runAllTests = async () => {
    setRunning(true)
    setResults([])

    for (const scenario of TEST_SCENARIOS) {
      const result = await runTest(scenario)
      setResults((prev) => [...prev, result])
      // Add delay between tests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    setRunning(false)
  }

  const runSingleTest = async (scenario: TestScenario) => {
    setRunning(true)
    const result = await runTest(scenario)
    setResults((prev) => {
      const filtered = prev.filter((r) => r.scenarioId !== scenario.id)
      return [...filtered, result]
    })
    setRunning(false)
  }

  const passedTests = results.filter((r) => r.passed).length
  const totalTests = results.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TestTubeIcon className="w-6 h-6 text-apex-primary" />
            AI Integration Test Suite
          </h2>
          <p className="text-apex-gray">Test all AI endpoints with 10 comprehensive scenarios</p>
        </div>
        <Button
          onClick={runAllTests}
          disabled={running}
          className="bg-apex-primary hover:bg-apex-primary/80 text-white"
        >
          {running ? "Running Tests..." : "Run All Tests"}
        </Button>
      </div>

      {totalTests > 0 && (
        <Card className="p-4 bg-apex-darker border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-apex-light font-semibold">Test Results</span>
            <span className="text-apex-light">
              {passedTests} / {totalTests} passed
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(passedTests / totalTests) * 100}%` }}
            />
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {TEST_SCENARIOS.map((scenario) => {
          const result = results.find((r) => r.scenarioId === scenario.id)
          const isRunning = currentTest === scenario.id

          return (
            <Card key={scenario.id} className="p-4 bg-apex-darker border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{scenario.name}</h3>
                    {result && (
                      <span>
                        {result.passed ? (
                          <CheckCircle2Icon className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-red-500" />
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-apex-gray mt-1">{scenario.description}</p>
                  <p className="text-xs text-apex-gray mt-1">Endpoint: {scenario.endpoint}</p>

                  {result && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-apex-light">Duration: {result.duration}ms</p>
                      {result.error && <p className="text-xs text-red-400">Error: {result.error}</p>}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => runSingleTest(scenario)}
                  disabled={running}
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-gray-600 hover:border-apex-primary"
                >
                  {isRunning ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Running...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <PlayIcon className="w-4 h-4" />
                      Test
                    </span>
                  )}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
