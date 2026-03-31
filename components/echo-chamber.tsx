"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GitBranchIcon } from "lucide-react"
import { LifeModelVisualizer } from "@/components/life-model-visualizer"
import { TimelineWeaver } from "@/components/timeline-weaver"

interface EchoChamberProps {
  isActive: boolean
  decisionQuery: string
  onClose: () => void
}

export function EchoChamber({ isActive, decisionQuery, onClose }: EchoChamberProps) {
  const [phase, setPhase] = useState<"initializing" | "gathering" | "simulating" | "results">("initializing")
  const [simulationResult, setSimulationResult] = useState<any>(null)

  useEffect(() => {
    if (isActive) {
      // Start the simulation sequence
      startSimulationSequence()
    }
  }, [isActive])

  const startSimulationSequence = async () => {
    // Phase 1: Initializing (2 seconds)
    setPhase("initializing")
    speak(
      "Initializing the Echo Chamber. I am now accessing your complete Life Model to simulate the probable futures branching from this decision. This will take a moment. Stand by.",
    )

    await delay(2000)

    // Phase 2: Gathering data (5 seconds)
    setPhase("gathering")
    await delay(5000)

    // Phase 3: Simulating (3 seconds)
    setPhase("simulating")
    speak("Weaving timelines. Calculating probability matrices. Stand by for results.")

    // Call the API
    try {
      const response = await fetch("/api/simulate-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision_query: decisionQuery }),
      })

      if (!response.ok) throw new Error("Simulation failed")

      const result = await response.json()
      setSimulationResult(result)
      setPhase("results")
      speak(
        "Simulation complete. Three probable timelines have been identified. Explore each path to understand your potential futures.",
      )
    } catch (error) {
      console.error("[v0] Simulation error:", error)
      // Fallback to demo data
      setSimulationResult(generateDemoSimulation(decisionQuery))
      setPhase("results")
    }
  }

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const generateDemoSimulation = (query: string) => {
    return {
      decision: query,
      context_summary:
        "Based on your current financial status, career trajectory, wellness patterns, and personal goals.",
      echo_paths: [
        {
          title: "The Ambitious Leap",
          probability: 45,
          narrative:
            "You take the bold step forward. The first six months are challenging as you adapt to new demands and responsibilities. Your income increases significantly, but so does your stress level. By month 12, you've found your rhythm and are thriving in the new environment.",
          impacts: {
            financial: "+60% income increase, 3 years ahead on financial independence goal",
            career: "Accelerated growth, new skills acquired, expanded professional network",
            wellness: "Initial stress spike (+40%), sleep quality drops (-25%), but stabilizes after 6 months",
            relationships: "Distance from current support network, but new meaningful connections formed",
            time: "-15 flexible hours per week, more structured schedule",
          },
          outcome: "High growth trajectory with initial sacrifice, leading to long-term success",
          risks: ["Burnout in first 6 months", "Relationship strain", "Health impacts from stress"],
          opportunities: ["Career acceleration", "Financial freedom", "New network", "Personal growth"],
          inflectionPoints: [
            {
              month: 6,
              description:
                "Your financial runway will be nearly gone, and your stress levels will be at their peak. Your probability of success in this timeline is entirely dependent on your actions during this period.",
              actions: ["Seek mentorship", "Take a one-week recovery break", "Start looking for part-time work"],
            },
          ],
        },
        {
          title: "The Balanced Evolution",
          probability: 35,
          narrative:
            "You negotiate a middle path that allows for growth without dramatic upheaval. Using this opportunity as leverage, you secure a promotion at your current position with increased responsibilities and compensation.",
          impacts: {
            financial: "+25% income increase, steady progress toward goals",
            career: "Solid advancement, proven leadership, maintained relationships",
            wellness: "Stable patterns maintained, consistent sleep and exercise",
            relationships: "All current connections preserved and strengthened",
            time: "Slight increase in work hours (+5/week), still flexible",
          },
          outcome: "Sustainable growth that prioritizes stability and well-being",
          risks: ["Slower career progression", "Potential regret about 'what if'", "Less dramatic income growth"],
          opportunities: ["Work-life balance", "Relationship depth", "Health maintenance", "Steady growth"],
          inflectionPoints: [
            {
              month: 3,
              description:
                "You'll receive a counter-offer from your current employer. The decision you make here will determine whether you stay on this balanced path or pivot to a different timeline.",
              actions: [
                "Accept the counter-offer",
                "Negotiate for more flexibility",
                "Decline and explore other options",
              ],
            },
          ],
        },
        {
          title: "The Strategic Pivot",
          probability: 20,
          narrative:
            "You decline the offer but use the experience to clarify your true priorities. This leads to an unexpected pivot - you realize you want more autonomy and flexibility. Within 3 months, you've started a side project that aligns with your passions.",
          impacts: {
            financial: "Initial stability, then +40% income from side project by year 2",
            career: "Entrepreneurial path, building something of your own",
            wellness: "Improved due to autonomy and passion alignment",
            relationships: "More time for meaningful connections, flexible schedule",
            time: "Initial time investment in side project, then increased flexibility",
          },
          outcome: "Unconventional path leading to autonomy and fulfillment",
          risks: ["Income uncertainty", "Startup challenges", "Longer path to financial goals"],
          opportunities: ["Autonomy", "Passion alignment", "Unlimited upside", "Flexibility"],
          inflectionPoints: [
            {
              month: 9,
              description:
                "Your side project will reach a critical juncture where you must decide whether to go all-in or keep it as a side hustle. This decision will determine the ultimate success of this path.",
              actions: ["Go all-in on the side project", "Keep it as a side hustle", "Seek investment or partnership"],
            },
          ],
        },
      ],
      strategic_guidance: {
        most_likely_path: "The Ambitious Leap (45% probability)",
        key_decision_points: [
          "Month 3: Critical adaptation period",
          "Month 6: Evaluate work-life balance",
          "Month 12: Assess overall satisfaction",
        ],
        preparatory_actions: [
          "Build a 6-month emergency fund",
          "Establish a wellness routine",
          "Create a support system",
        ],
        success_metrics: [
          "Stress levels return to baseline by month 6",
          "Sleep quality maintained above 7 hours/night",
        ],
      },
      recommendation: "Based on your data, I recommend The Ambitious Leap with strong preparation.",
      confidence_level: "High (85%)",
    }
  }

  if (!isActive) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black"
      >
        {/* Starfield Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          {phase === "initializing" && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <motion.div
                className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(168, 85, 247, 0.4)",
                    "0 0 60px rgba(168, 85, 247, 0.8)",
                    "0 0 20px rgba(168, 85, 247, 0.4)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <GitBranchIcon className="w-16 h-16 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-4">Initializing Echo Chamber</h2>
              <p className="text-gray-400 max-w-md">
                Accessing your complete Life Model to simulate probable futures...
              </p>
            </motion.div>
          )}

          {phase === "gathering" && <LifeModelVisualizer />}

          {phase === "simulating" && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <motion.div
                className="w-32 h-32 mx-auto mb-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <GitBranchIcon className="w-32 h-32 text-purple-500" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-4">Weaving Timelines</h2>
              <p className="text-gray-400 max-w-md">Calculating probability matrices across all life domains...</p>
            </motion.div>
          )}

          {phase === "results" && simulationResult && <TimelineWeaver result={simulationResult} onClose={onClose} />}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
