"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Database, Trash2, Lock } from "lucide-react"
import { clearApexStats } from "@/lib/apex-stats"
import { useState } from "react"

export function PrivacyZone() {
  const [cleared, setCleared] = useState(false)

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all your local data? This cannot be undone.")) {
      clearApexStats()
      setCleared(true)
      setTimeout(() => setCleared(false), 3000)
    }
  }

  return (
    <Card className="bg-apex-dark/40 backdrop-blur-xl border-apex-primary/30 p-6 glassmorphism">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-apex-primary/20 rounded-lg">
          <Shield className="text-apex-primary" size={24} />
        </div>
        <div>
          <h3 className="text-apex-primary font-bold text-lg">Privacy & Trust</h3>
          <p className="text-xs text-apex-gray">Your data, your control</p>
        </div>
      </div>

      {/* Local Memory Map Visual */}
      <div className="mb-6 p-4 bg-apex-darker/50 rounded-lg border border-apex-primary/20">
        <div className="flex items-center justify-center gap-4 mb-3">
          <Database className="text-apex-primary" size={32} />
          <div className="text-2xl text-apex-gray">→</div>
          <Lock className="text-apex-primary" size={32} />
        </div>
        <p className="text-center text-sm text-apex-gray">
          All data stored locally on <strong className="text-apex-primary">your device</strong>
        </p>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-apex-primary rounded-full mt-1.5" />
          <div>
            <p className="text-sm font-medium text-white">No Server Memory</p>
            <p className="text-xs text-apex-gray">Nothing leaves your device. Ever.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-apex-primary rounded-full mt-1.5" />
          <div>
            <p className="text-sm font-medium text-white">Local IndexedDB Control</p>
            <p className="text-xs text-apex-gray">You own and control all your data.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-apex-primary rounded-full mt-1.5" />
          <div>
            <p className="text-sm font-medium text-white">Wipe Anytime</p>
            <p className="text-xs text-apex-gray">Clear everything with one click below.</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-apex-primary/10 rounded-lg border border-apex-primary/20 mb-4">
        <p className="text-sm text-apex-gray italic text-center">
          "Apex is designed to forget — unless you want it to remember."
        </p>
      </div>

      <Button
        variant="outline"
        className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10 bg-transparent"
        onClick={handleClearData}
      >
        <Trash2 size={16} className="mr-2" />
        {cleared ? "Data Cleared!" : "Clear All Local Data"}
      </Button>
    </Card>
  )
}
