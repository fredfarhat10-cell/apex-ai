"use client"

import { Card } from "@/components/ui/card"
import GoogleAccountConnector from "./google-account-connector"
import { Briefcase, TrendingUp, Users, FileText } from "lucide-react"

export default function CareerGuild() {
  return (
    <div className="h-screen w-full bg-[#0a0a0f] text-white overflow-y-auto font-mono p-8 animate-fadeIn">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Career & Business Guild</h1>
          <p className="text-gray-400 text-lg">Your AI-powered career advancement and business intelligence center</p>
        </div>

        {/* Google Account Connection */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">Email Integration</h2>
          <GoogleAccountConnector />
        </div>

        {/* Career Features Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">Career Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#0f1118] border border-white/10 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Job Tracker</h3>
                  <p className="text-sm text-gray-400">
                    Automatically track job applications from your Gmail and get AI-powered follow-up reminders.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Coming soon</p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#0f1118] border border-white/10 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Career Insights</h3>
                  <p className="text-sm text-gray-400">
                    Get quarterly career reviews with market trends and personalized advancement strategies.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Coming soon</p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#0f1118] border border-white/10 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Network Manager</h3>
                  <p className="text-sm text-gray-400">
                    Track professional connections and get reminders to nurture important relationships.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Coming soon</p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#0f1118] border border-white/10 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Resume Optimizer</h3>
                  <p className="text-sm text-gray-400">
                    AI-powered resume analysis and optimization for specific job opportunities.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Coming soon</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
