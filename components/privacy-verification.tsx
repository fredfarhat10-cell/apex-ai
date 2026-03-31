"use client"

import { ShieldCheckIcon, CodeIcon, LockIcon, EyeOffIcon } from "./icons"

export default function PrivacyVerification() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full border-2 border-green-500/30 mb-3">
          <ShieldCheckIcon className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-apex-light mb-2">Zero-Knowledge Certified</h2>
        <p className="text-apex-gray text-sm">Your data never leaves your browser</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-apex-darker rounded-lg border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <CodeIcon className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-apex-light">Open Source</h3>
          </div>
          <p className="text-xs text-apex-gray leading-relaxed">
            All encryption code is open source and auditable. View our vault implementation on GitHub to verify
            security.
          </p>
        </div>

        <div className="p-4 bg-apex-darker rounded-lg border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <LockIcon className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-apex-light">AES-256-GCM</h3>
          </div>
          <p className="text-xs text-apex-gray leading-relaxed">
            Military-grade encryption with PBKDF2 key derivation. Your master password is never stored or transmitted.
          </p>
        </div>

        <div className="p-4 bg-apex-darker rounded-lg border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <EyeOffIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-apex-light">No Tracking</h3>
          </div>
          <p className="text-xs text-apex-gray leading-relaxed">
            Zero analytics, no cookies, no fingerprinting. We literally cannot see your data or activity.
          </p>
        </div>

        <div className="p-4 bg-apex-darker rounded-lg border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-apex-light">Local AI</h3>
          </div>
          <p className="text-xs text-apex-gray leading-relaxed">
            All AI processing happens in your browser. API calls use your own keys, never ours.
          </p>
        </div>
      </div>

      <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
        <p className="text-sm text-green-400 font-semibold mb-2">Privacy Guarantee</p>
        <p className="text-xs text-apex-gray leading-relaxed">
          Apex is designed to be impossible for us to access your data. Even if we wanted to (we don't), we
          couldn't—your vault is encrypted with a key only you know, and all processing happens locally in your browser.
        </p>
      </div>
    </div>
  )
}
