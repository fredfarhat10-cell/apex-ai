"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IntegrationsModalProps {
  onClose: () => void
}

export default function IntegrationsModal({ onClose }: IntegrationsModalProps) {
  // TODO: Implement OAuth flows for each service
  const handleGoogleConnect = () => {
    // TODO: Trigger Google OAuth flow
    // This will redirect to Google's OAuth consent screen
    // After authorization, redirect back with access token
    console.log("[v0] Google OAuth flow would start here")
    alert("Google Workspace integration coming soon!")
  }

  const handleNotionConnect = () => {
    // TODO: Trigger Notion OAuth flow
    // Similar to Google, this will redirect to Notion's OAuth
    // After authorization, store the access token securely
    console.log("[v0] Notion OAuth flow would start here")
    alert("Notion integration coming soon!")
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect max-w-2xl w-full rounded-2xl border border-gray-700 p-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold gradient-text">Connect Your Apps</h2>
          <Button onClick={onClose} variant="ghost" size="icon" className="hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-gray-400 mb-8">
          Connect your favorite apps to unlock powerful AI-driven workflows. Your data stays secure with zero-knowledge
          encryption.
        </p>

        <div className="space-y-4">
          {/* Google Workspace */}
          <div className="p-6 rounded-xl bg-white/5 border border-gray-700 hover:border-[#FF6B00]/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-2xl font-bold">
                  G
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Google Workspace</h3>
                  <p className="text-sm text-gray-400">Connect Gmail, Drive, and Calendar</p>
                </div>
              </div>
              <Button onClick={handleGoogleConnect} className="bg-[#FF6B00] hover:bg-[#FF8533] text-white">
                Connect
              </Button>
            </div>
          </div>

          {/* Notion */}
          <div className="p-6 rounded-xl bg-white/5 border border-gray-700 hover:border-[#FF6B00]/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-2xl font-bold">
                  N
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Notion</h3>
                  <p className="text-sm text-gray-400">Sync your notes and databases</p>
                </div>
              </div>
              <Button onClick={handleNotionConnect} className="bg-[#FF6B00] hover:bg-[#FF8533] text-white">
                Connect
              </Button>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="p-6 rounded-xl bg-white/5 border border-gray-700 opacity-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-2xl">+</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">More integrations</h3>
                  <p className="text-sm text-gray-400">Slack, Trello, GitHub, and more coming soon</p>
                </div>
              </div>
              <Button disabled className="bg-gray-700 text-gray-400">
                Coming Soon
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <p className="text-sm text-green-400 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            All integrations use OAuth 2.0 and are encrypted end-to-end
          </p>
        </div>
      </div>
    </div>
  )
}
