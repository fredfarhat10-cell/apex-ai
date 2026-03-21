"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ShieldCheckIcon, EyeOffIcon, LockIcon, FileTextIcon } from "./icons"
import { PrivacyStatusIndicator } from "./privacy-status-indicator"
import { PrivacyAuditTrail } from "./privacy-audit-trail"
import { PrivacyFAQ } from "./privacy-faq"
import { PrivacyTechnicalDocs } from "./privacy-technical-docs"
import { PrivacyDataFlow } from "./privacy-data-flow"
import PrivacyVerification from "./privacy-verification"
import { SecurityDiagnostics } from "./security-diagnostics"

export default function PrivacyCenterContent() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShieldCheckIcon size={32} className="text-green-400" />
            Privacy Center
          </h1>
          <p className="text-apex-gray">Complete transparency into your data privacy and security</p>
        </div>
      </div>

      {/* Privacy Status Banner */}
      <PrivacyStatusIndicator />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-apex-dark border border-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="dataflow">Data Flow</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Privacy Verification */}
            <Card className="bg-apex-dark/50 border-gray-800 p-6">
              <PrivacyVerification />
            </Card>

            {/* Security Diagnostics */}
            <Card className="bg-apex-dark/50 border-gray-800 p-6">
              <SecurityDiagnostics />
            </Card>
          </div>

          {/* Key Privacy Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-apex-dark/50 border-green-500/20 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <LockIcon className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Zero-Knowledge</h3>
              </div>
              <p className="text-sm text-apex-gray leading-relaxed">
                Your data is encrypted with AES-256-GCM before storage. We literally cannot access your information even
                if we wanted to.
              </p>
            </Card>

            <Card className="bg-apex-dark/50 border-cyan-500/20 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center">
                  <EyeOffIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">No Tracking</h3>
              </div>
              <p className="text-sm text-apex-gray leading-relaxed">
                Zero analytics, no cookies, no fingerprinting. Your activity is completely private and never monitored.
              </p>
            </Card>

            <Card className="bg-apex-dark/50 border-purple-500/20 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <FileTextIcon className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Open Source</h3>
              </div>
              <p className="text-sm text-apex-gray leading-relaxed">
                All encryption code is open source and auditable. Verify our security claims yourself on GitHub.
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="mt-6">
          <PrivacyAuditTrail />
        </TabsContent>

        {/* Data Flow Tab */}
        <TabsContent value="dataflow" className="mt-6">
          <PrivacyDataFlow />
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="mt-6">
          <PrivacyFAQ />
        </TabsContent>

        {/* Technical Documentation Tab */}
        <TabsContent value="technical" className="mt-6">
          <PrivacyTechnicalDocs />
        </TabsContent>
      </Tabs>
    </div>
  )
}
