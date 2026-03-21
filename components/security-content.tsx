"use client"

import { useState } from "react"
import { VaultTestUtility } from "./vault-test-utility"
import { SecurityDiagnostics } from "./security-diagnostics"
import AITestSuite from "./ai-test-suite"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldCheckIcon, TestTubeIcon } from "./icons"

export default function SecurityContent() {
  const [activeTab, setActiveTab] = useState("diagnostics")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Center</h1>
          <p className="text-apex-gray">Test vault encryption, verify security, and ensure zero data leaks</p>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-apex-dark/50 border-apex-primary/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Encryption</h3>
          </div>
          <p className="text-sm text-apex-gray mb-1">AES-GCM-256</p>
          <p className="text-xs text-apex-gray/70">PBKDF2 with 100,000 iterations</p>
        </Card>

        <Card className="bg-apex-dark/50 border-apex-primary/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Zero-Knowledge</h3>
          </div>
          <p className="text-sm text-apex-gray mb-1">Client-side only</p>
          <p className="text-xs text-apex-gray/70">No server access to your data</p>
        </Card>

        <Card className="bg-apex-dark/50 border-apex-primary/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <TestTubeIcon className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Testing</h3>
          </div>
          <p className="text-sm text-apex-gray mb-1">Comprehensive suite</p>
          <p className="text-xs text-apex-gray/70">Verify encryption integrity</p>
        </Card>
      </div>

      {/* Security Tools */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-apex-dark/50">
          <TabsTrigger value="diagnostics">Security Diagnostics</TabsTrigger>
          <TabsTrigger value="testing">Vault Testing</TabsTrigger>
          <TabsTrigger value="ai-testing">AI Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics" className="mt-6">
          <SecurityDiagnostics />
        </TabsContent>

        <TabsContent value="testing" className="mt-6">
          <VaultTestUtility />
        </TabsContent>

        <TabsContent value="ai-testing" className="mt-6">
          <AITestSuite />
        </TabsContent>
      </Tabs>

      {/* Security Best Practices */}
      <Card className="bg-apex-dark/50 border-apex-primary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security Best Practices</h3>
        <ul className="space-y-2 text-sm text-apex-gray">
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span>Use a strong master password (12+ characters, mixed case, numbers, symbols)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span>Never share your master password with anyone</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span>Regularly export your vault as a backup</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span>Check security diagnostics regularly for any issues</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400 mt-1">⚠</span>
            <span>If you lose your master password, your data cannot be recovered</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
