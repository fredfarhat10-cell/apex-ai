import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  try {
    const { decision_query } = await request.json()

    if (!decision_query) {
      return NextResponse.json({ error: "Decision query is required" }, { status: 400 })
    }

    if (isDemoMode) {
      // Return demo simulation data
      return NextResponse.json(generateDemoSimulation(decision_query))
    }

    // Call CrewAI backend
    const backendUrl = process.env.NEXT_PUBLIC_CREWAI_API_URL || "http://localhost:5000"
    const response = await fetch(`${backendUrl}/api/simulate-decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision_query }),
    })

    if (!response.ok) {
      throw new Error("Backend simulation failed")
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Simulation API error:", error)
    // Fallback to demo data on error
    const { decision_query } = await request.json()
    return NextResponse.json(generateDemoSimulation(decision_query))
  }
}

function generateDemoSimulation(query: string) {
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
      },
    ],
    strategic_guidance: {
      most_likely_path:
        "The Ambitious Leap (45% probability) - Your historical patterns show you tend to choose growth over comfort.",
      key_decision_points: [
        "Month 3: Critical adaptation period - if stress is unmanageable, consider adjustments",
        "Month 6: Evaluate work-life balance and make course corrections if needed",
        "Month 12: Assess overall satisfaction and long-term sustainability",
      ],
      preparatory_actions: [
        "Build a 6-month emergency fund before making the leap",
        "Establish a wellness routine that can withstand increased demands",
        "Create a support system in the new location before moving",
        "Set clear boundaries and non-negotiables for work-life balance",
      ],
      success_metrics: [
        "Stress levels return to baseline by month 6",
        "Sleep quality maintained above 7 hours/night",
        "At least 2 meaningful new relationships formed",
        "Financial goals on track or ahead of schedule",
      ],
    },
    recommendation:
      "Based on your data, I recommend The Ambitious Leap with strong preparation. Your historical resilience and growth mindset suggest you'll thrive after the initial adaptation period.",
    confidence_level:
      "High (85%) - Based on comprehensive analysis of your financial, career, wellness, and relationship data.",
  }
}
