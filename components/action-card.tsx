"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, FileDown, Link2, Bell, CheckCircle, X } from "lucide-react"

interface ActionCardProps {
  response: string
  onClose: () => void
}

export default function ActionCard({ response, onClose }: ActionCardProps) {
  const handleScheduleCalendar = () => {
    console.log("[v0] Scheduling in calendar...")
    // TODO: Integrate with calendar API
  }

  const handleExportPDF = () => {
    console.log("[v0] Exporting to PDF...")
    // TODO: Generate PDF export
  }

  const handleLinkStrava = () => {
    console.log("[v0] Linking with Strava...")
    // TODO: OAuth integration with Strava
  }

  const handleSetReminder = () => {
    console.log("[v0] Setting reminder...")
    // TODO: Create reminder notification
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <Card className="bg-[#111111] border-[#6E56CF]/30 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6E56CF] to-[#00FFC6] flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-[#E5E7EB] uppercase tracking-wider">Quick Actions</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#888888] hover:text-[#E5E7EB] -mt-2 -mr-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleScheduleCalendar}
            className="gap-2 bg-[#0A0A0A] border-[#222222] hover:border-[#6E56CF]/50 hover:bg-[#111111] text-[#E5E7EB] h-auto py-3 flex-col items-start"
          >
            <Calendar className="w-5 h-5 text-[#6E56CF]" />
            <span className="text-sm font-medium">Schedule in Calendar</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="gap-2 bg-[#0A0A0A] border-[#222222] hover:border-[#00FFC6]/50 hover:bg-[#111111] text-[#E5E7EB] h-auto py-3 flex-col items-start"
          >
            <FileDown className="w-5 h-5 text-[#00FFC6]" />
            <span className="text-sm font-medium">Export to PDF</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleLinkStrava}
            className="gap-2 bg-[#0A0A0A] border-[#222222] hover:border-[#6E56CF]/50 hover:bg-[#111111] text-[#E5E7EB] h-auto py-3 flex-col items-start"
          >
            <Link2 className="w-5 h-5 text-[#6E56CF]" />
            <span className="text-sm font-medium">Link with Strava</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleSetReminder}
            className="gap-2 bg-[#0A0A0A] border-[#222222] hover:border-[#00FFC6]/50 hover:bg-[#111111] text-[#E5E7EB] h-auto py-3 flex-col items-start"
          >
            <Bell className="w-5 h-5 text-[#00FFC6]" />
            <span className="text-sm font-medium">Set Reminder</span>
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
