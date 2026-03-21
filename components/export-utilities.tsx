"use client"

import { useVault } from "@/lib/vault-context"
import { DownloadIcon, CalendarIcon, FileTextIcon } from "./icons"
import { useState } from "react"

export default function ExportUtilities() {
  const { habits, strategicGoal, primePath, expenses } = useVault()
  const [exporting, setExporting] = useState(false)

  const exportToICS = () => {
    const icsContent = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Apex AI Assistant//EN", "CALSCALE:GREGORIAN"]

    // Add strategic goal as an event
    if (strategicGoal) {
      const today = new Date()
      const goalDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())
      icsContent.push(
        "BEGIN:VEVENT",
        `UID:goal-${Date.now()}@apex`,
        `DTSTAMP:${formatICSDate(today)}`,
        `DTSTART:${formatICSDate(goalDate)}`,
        `SUMMARY:Strategic Goal: ${strategicGoal}`,
        `DESCRIPTION:Review progress on strategic goal`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
      )
    }

    // Add habits as recurring events
    habits.forEach((habit, index) => {
      const startDate = new Date()
      icsContent.push(
        "BEGIN:VEVENT",
        `UID:habit-${habit.id}@apex`,
        `DTSTAMP:${formatICSDate(startDate)}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `SUMMARY:Daily Habit: ${habit.name}`,
        `DESCRIPTION:Complete your daily habit: ${habit.name}`,
        "RRULE:FREQ=DAILY",
        "STATUS:CONFIRMED",
        "END:VEVENT",
      )
    })

    icsContent.push("END:VCALENDAR")

    const blob = new Blob([icsContent.join("\r\n")], { type: "text/calendar" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "apex-calendar.ics"
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  const exportSimulationReport = async () => {
    setExporting(true)
    try {
      const report = [
        "APEX AI ASSISTANT - LIFE SIMULATION REPORT",
        "=".repeat(50),
        "",
        `Generated: ${new Date().toLocaleString()}`,
        "",
        "STRATEGIC GOAL",
        "-".repeat(50),
        strategicGoal || "No strategic goal set",
        "",
        "PRIME PATH STEPS",
        "-".repeat(50),
        ...primePath.map((step, i) => `${i + 1}. ${step.title}\n   ${step.description}`),
        "",
        "FINANCIAL OVERVIEW",
        "-".repeat(50),
        `Total Expenses: $${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}`,
        `Number of Transactions: ${expenses.length}`,
        "",
        "HABITS TRACKING",
        "-".repeat(50),
        ...habits.map((h) => `- ${h.name} (${h.goal})`),
        "",
        "=".repeat(50),
        "This report was generated locally and privately.",
        "No data was sent to external servers.",
      ]

      const blob = new Blob([report.join("\n")], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `apex-report-${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="bg-apex-dark border border-gray-800 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-white flex items-center gap-2">
        <DownloadIcon className="w-5 h-5" />
        Export & Share
      </h3>
      <div className="space-y-2">
        <button
          onClick={exportToICS}
          className="w-full flex items-center justify-center gap-2 bg-apex-primary text-white py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          <CalendarIcon className="w-4 h-4" />
          Export to Calendar (.ics)
        </button>
        <button
          onClick={exportSimulationReport}
          disabled={exporting}
          className="w-full flex items-center justify-center gap-2 bg-apex-accent text-apex-darker py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {exporting ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-apex-darker"></div>
              Generating...
            </>
          ) : (
            <>
              <FileTextIcon className="w-4 h-4" />
              Download Report
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-apex-gray">All exports are generated locally. No data leaves your device.</p>
    </div>
  )
}
