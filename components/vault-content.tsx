"use client"

import type React from "react"

import { useVault } from "@/lib/vault-context"
import { useState } from "react"
import Widget from "./widget"
import { LockIcon } from "./icons"
import { DataManager } from "./data-manager"
import { ProgressiveSettings } from "./progressive-settings"
import AnalyticsDashboard from "./analytics-dashboard"
import FeedbackForm from "./feedback-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Upload, Database } from "lucide-react"
import { exportVault, importVault } from "@/lib/indexeddb-persistence"
import { useToast } from "@/hooks/use-toast"

export default function VaultContent() {
  const { userProfile, logout } = useVault()
  const [activeTab, setActiveTab] = useState("profile")
  const { toast } = useToast()

  const handleExport = async () => {
    try {
      const result = await exportVault()

      if (!result.success || !result.blob) {
        toast({
          title: "Export Failed",
          description: result.error || "Failed to export vault",
          variant: "destructive",
        })
        return
      }

      const url = URL.createObjectURL(result.blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `apex-vault-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: "Your encrypted vault has been downloaded",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await importVault(file)

      if (!result.success) {
        toast({
          title: "Import Failed",
          description: result.error || "Failed to import vault",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Import Successful",
        description: "Your vault has been imported. Please refresh the page.",
      })

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
        <LockIcon size={32} className="text-apex-primary" /> Vault Settings
      </h1>
      <p className="text-apex-gray">Manage your encrypted vault and profile settings.</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-apex-dark border border-gray-800">
          <TabsTrigger value="profile">Profile & Security</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Widget title="Profile Information">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-apex-gray">Name</p>
                  <p className="text-white font-medium">{userProfile?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-apex-gray">Occupation</p>
                  <p className="text-white font-medium">{userProfile?.occupation}</p>
                </div>
                <div>
                  <p className="text-sm text-apex-gray">Skills</p>
                  <p className="text-white font-medium">{userProfile?.skills.join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm text-apex-gray">Interests</p>
                  <p className="text-white font-medium">{userProfile?.interests.join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm text-apex-gray">AI Persona</p>
                  <p className="text-white font-medium">{userProfile?.aiPersona}</p>
                </div>
              </div>
            </Widget>

            <Widget title="Security">
              <div className="space-y-4">
                <p className="text-sm text-apex-gray">
                  Your data is encrypted locally using AES-256-GCM encryption. Your master password never leaves your
                  device.
                </p>

                <div className="space-y-3 pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-sm text-apex-gray mb-2">
                    <Database className="h-4 w-4" />
                    <span className="font-medium">Backup & Restore</span>
                  </div>

                  <Button
                    onClick={handleExport}
                    variant="outline"
                    className="w-full gap-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                  >
                    <Download className="h-4 w-4" />
                    Export Encrypted Backup
                  </Button>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="import-vault"
                    />
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 pointer-events-none bg-transparent"
                    >
                      <Upload className="h-4 w-4" />
                      Import Backup
                    </Button>
                  </div>

                  <p className="text-xs text-apex-gray">
                    Your backup file is encrypted and can only be restored with your master password.
                  </p>
                </div>

                <button
                  onClick={logout}
                  className="w-full bg-red-500/20 text-red-400 border border-red-500/50 font-semibold py-2 rounded-md hover:bg-red-500/30 transition-colors mt-4"
                  aria-label="Logout and lock vault"
                >
                  Logout & Lock Vault
                </button>
              </div>
            </Widget>

            <div className="lg:col-span-2 space-y-4">
              <DataManager />

              <ProgressiveSettings
                title="Advanced Settings"
                description="Configure advanced vault and encryption options"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white block mb-2">Auto-lock timeout (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      defaultValue={15}
                      className="w-full bg-apex-darker border border-gray-700 rounded-lg p-2 text-white"
                      aria-label="Auto-lock timeout in minutes"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-700"
                        aria-label="Enable auto-save"
                      />
                      <span>Enable auto-save (every 1.5 seconds)</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-700" aria-label="Enable biometric unlock" />
                      <span>Enable biometric unlock (if supported)</span>
                    </label>
                  </div>
                </div>
              </ProgressiveSettings>

              <ProgressiveSettings title="Keyboard Shortcuts" description="View and customize keyboard shortcuts">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-apex-gray">Command Bar</span>
                    <kbd className="px-2 py-1 bg-apex-darker rounded border border-gray-700 font-mono text-xs">
                      ⌘K / Ctrl+K
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-apex-gray">Global Chat</span>
                    <kbd className="px-2 py-1 bg-apex-darker rounded border border-gray-700 font-mono text-xs">
                      ⌘/ / Ctrl+/
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-apex-gray">Navigate to Dashboard</span>
                    <kbd className="px-2 py-1 bg-apex-darker rounded border border-gray-700 font-mono text-xs">
                      Alt+1
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-apex-gray">Navigate to Strategy</span>
                    <kbd className="px-2 py-1 bg-apex-darker rounded border border-gray-700 font-mono text-xs">
                      Alt+2
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-apex-gray">View all shortcuts</span>
                    <kbd className="px-2 py-1 bg-apex-darker rounded border border-gray-700 font-mono text-xs">?</kbd>
                  </div>
                </div>
              </ProgressiveSettings>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <div className="max-w-2xl mx-auto">
            <FeedbackForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
