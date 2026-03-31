"use client"

import { Card } from "@/components/ui/card"
import { LockIcon, DatabaseIcon, CpuIcon, ShieldCheckIcon } from "./icons"

export function PrivacyDataFlow() {
  return (
    <div className="space-y-6">
      <Card className="bg-apex-dark/50 border-gray-800 p-6">
        <h3 className="text-xl font-bold text-white mb-4">How Your Data Flows</h3>
        <p className="text-sm text-apex-gray mb-6">
          Visual representation of how Apex processes and stores your data entirely on your device
        </p>

        {/* Data Flow Diagram */}
        <div className="relative">
          {/* Step 1: Input */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-blue-500/40">
              <span className="text-2xl font-bold text-blue-400">1</span>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-1">You Enter Data</h4>
              <p className="text-sm text-apex-gray">Goals, habits, financial info, or any personal information</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="ml-8 mb-4 border-l-2 border-dashed border-gray-700 h-8" />

          {/* Step 2: Processing */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center border-2 border-purple-500/40">
              <CpuIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-1">Local Processing</h4>
              <p className="text-sm text-apex-gray">
                All AI analysis and computations happen in your browser using JavaScript
              </p>
              <div className="mt-2 p-2 bg-purple-500/10 rounded border border-purple-500/20">
                <p className="text-xs text-purple-300">
                  <strong>Zero Server Calls:</strong> No data leaves your device during processing
                </p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="ml-8 mb-4 border-l-2 border-dashed border-gray-700 h-8" />

          {/* Step 3: Encryption */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/40">
              <LockIcon className="w-8 h-8 text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-1">Client-Side Encryption</h4>
              <p className="text-sm text-apex-gray">Data encrypted with AES-256-GCM using your master password</p>
              <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                <p className="text-xs text-green-300">
                  <strong>Key Derivation:</strong> PBKDF2 with 100,000 iterations - your password never stored
                </p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="ml-8 mb-4 border-l-2 border-dashed border-gray-700 h-8" />

          {/* Step 4: Storage */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center border-2 border-cyan-500/40">
              <DatabaseIcon className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-1">Local Storage Only</h4>
              <p className="text-sm text-apex-gray">Encrypted data saved to IndexedDB on your device</p>
              <div className="mt-2 p-2 bg-cyan-500/10 rounded border border-cyan-500/20">
                <p className="text-xs text-cyan-300">
                  <strong>Persistence:</strong> Survives browser refresh, but never synced to cloud
                </p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="ml-8 mb-4 border-l-2 border-dashed border-gray-700 h-8" />

          {/* Step 5: Protection */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-500/40">
              <ShieldCheckIcon className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-1">Zero-Knowledge Guarantee</h4>
              <p className="text-sm text-apex-gray">Even we cannot access your data - it's mathematically impossible</p>
              <div className="mt-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                <p className="text-xs text-yellow-300">
                  <strong>Privacy by Design:</strong> No backdoors, no master keys, no exceptions
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* What Never Happens */}
      <Card className="bg-red-500/5 border-red-500/20 p-6">
        <h3 className="text-lg font-bold text-red-400 mb-4">What NEVER Happens</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">✗</span>
            <div>
              <p className="text-sm font-medium text-white">No Cloud Upload</p>
              <p className="text-xs text-apex-gray">Your data never touches our servers or any cloud storage</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">✗</span>
            <div>
              <p className="text-sm font-medium text-white">No Analytics Tracking</p>
              <p className="text-xs text-apex-gray">We don't track your usage, behavior, or any activity</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">✗</span>
            <div>
              <p className="text-sm font-medium text-white">No Third-Party Access</p>
              <p className="text-xs text-apex-gray">No external services can access your encrypted vault</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">✗</span>
            <div>
              <p className="text-sm font-medium text-white">No Password Recovery</p>
              <p className="text-xs text-apex-gray">We can't reset your password because we never see it</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
