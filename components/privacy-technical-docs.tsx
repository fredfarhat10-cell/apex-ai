"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PrivacyTechnicalDocs() {
  return (
    <div className="space-y-6">
      <Card className="bg-apex-dark/50 border-gray-800 p-6">
        <h3 className="text-xl font-bold text-white mb-2">Technical Documentation</h3>
        <p className="text-sm text-apex-gray mb-6">
          Detailed technical specifications for security researchers and developers
        </p>

        <Tabs defaultValue="encryption" className="w-full">
          <TabsList className="bg-apex-darker border border-gray-700">
            <TabsTrigger value="encryption">Encryption</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="threat-model">Threat Model</TabsTrigger>
          </TabsList>

          <TabsContent value="encryption" className="space-y-4 mt-4">
            <div className="p-4 bg-apex-darker rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Encryption Specifications</h4>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-cyan-400 font-medium mb-1">Algorithm</p>
                  <p className="text-apex-gray">AES-GCM-256 (Advanced Encryption Standard, Galois/Counter Mode)</p>
                </div>

                <div>
                  <p className="text-cyan-400 font-medium mb-1">Key Derivation</p>
                  <p className="text-apex-gray">PBKDF2 (Password-Based Key Derivation Function 2)</p>
                  <ul className="list-disc list-inside ml-4 mt-1 text-apex-gray">
                    <li>Iterations: 100,000</li>
                    <li>Hash: SHA-256</li>
                    <li>Salt: 16 bytes (random, per-encryption)</li>
                    <li>Key Length: 256 bits</li>
                  </ul>
                </div>

                <div>
                  <p className="text-cyan-400 font-medium mb-1">Initialization Vector (IV)</p>
                  <p className="text-apex-gray">12 bytes, randomly generated per encryption operation</p>
                </div>

                <div>
                  <p className="text-cyan-400 font-medium mb-1">Data Format</p>
                  <p className="text-apex-gray font-mono text-xs bg-black/30 p-2 rounded mt-1">
                    Base64([salt (16 bytes)] + [iv (12 bytes)] + [encrypted_data])
                  </p>
                </div>

                <div>
                  <p className="text-cyan-400 font-medium mb-1">Implementation</p>
                  <p className="text-apex-gray">Web Crypto API (SubtleCrypto interface)</p>
                  <p className="text-xs text-apex-gray mt-1">
                    Source: <code className="bg-black/30 px-1 rounded">lib/encryption.ts</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-sm text-green-300">
                <strong>Security Note:</strong> AES-256-GCM provides both confidentiality and authenticity. The GCM mode
                includes built-in authentication, preventing tampering attacks.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4 mt-4">
            <div className="p-4 bg-apex-darker rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Storage Architecture</h4>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-purple-400 font-medium mb-1">Primary Storage</p>
                  <p className="text-apex-gray">IndexedDB (via idb wrapper library)</p>
                  <ul className="list-disc list-inside ml-4 mt-1 text-apex-gray">
                    <li>Database: "ApexVault"</li>
                    <li>Object Store: "vault"</li>
                    <li>Persistence: Survives browser refresh and OS restart</li>
                    <li>Quota: ~50MB+ (browser dependent)</li>
                  </ul>
                </div>

                <div>
                  <p className="text-purple-400 font-medium mb-1">Fallback Storage</p>
                  <p className="text-apex-gray">localStorage (legacy support)</p>
                  <ul className="list-disc list-inside ml-4 mt-1 text-apex-gray">
                    <li>Key: "apex-vault-v2"</li>
                    <li>Auto-migration to IndexedDB on first load</li>
                    <li>Quota: ~5-10MB (browser dependent)</li>
                  </ul>
                </div>

                <div>
                  <p className="text-purple-400 font-medium mb-1">Metadata Storage</p>
                  <p className="text-apex-gray">Unencrypted metadata in localStorage</p>
                  <ul className="list-disc list-inside ml-4 mt-1 text-apex-gray">
                    <li>Key: "apex-vault-metadata"</li>
                    <li>Contains: version, createdAt, lastModified, encryptionAlgorithm</li>
                    <li>No sensitive data</li>
                  </ul>
                </div>

                <div>
                  <p className="text-purple-400 font-medium mb-1">Session Storage</p>
                  <p className="text-apex-gray">Master password stored in memory only (not persisted)</p>
                  <ul className="list-disc list-inside ml-4 mt-1 text-apex-gray">
                    <li>Cleared on logout</li>
                    <li>Cleared on browser close</li>
                    <li>Never written to disk</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-sm text-yellow-300">
                <strong>Persistence Note:</strong> IndexedDB provides durable storage but can be cleared by the user or
                browser. Always maintain encrypted backups.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="architecture" className="space-y-4 mt-4">
            <div className="p-4 bg-apex-darker rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">System Architecture</h4>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-blue-400 font-medium mb-1">Client-Side Only</p>
                  <p className="text-apex-gray">100% browser-based application with zero server dependencies</p>
                </div>

                <div>
                  <p className="text-blue-400 font-medium mb-1">Data Flow</p>
                  <ol className="list-decimal list-inside ml-4 mt-1 text-apex-gray space-y-1">
                    <li>User enters data in UI</li>
                    <li>Data stored in React state (memory)</li>
                    <li>Auto-save triggers after 600ms debounce</li>
                    <li>Data serialized to JSON</li>
                    <li>JSON encrypted with user's password</li>
                    <li>Encrypted blob saved to IndexedDB</li>
                    <li>No network requests made</li>
                  </ol>
                </div>

                <div>
                  <p className="text-blue-400 font-medium mb-1">Key Components</p>
                  <ul className="list-disc list-inside ml-4 mt-1 text-apex-gray">
                    <li>
                      <code className="bg-black/30 px-1 rounded">lib/encryption.ts</code> - Crypto operations
                    </li>
                    <li>
                      <code className="bg-black/30 px-1 rounded">lib/indexeddb-persistence.ts</code> - Storage layer
                    </li>
                    <li>
                      <code className="bg-black/30 px-1 rounded">lib/vault-context.tsx</code> - State management
                    </li>
                    <li>
                      <code className="bg-black/30 px-1 rounded">lib/vault-storage.ts</code> - Legacy storage
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="text-blue-400 font-medium mb-1">Security Boundaries</p>
                  <p className="text-apex-gray">All security operations occur within the browser sandbox</p>
                  <ul className="list-disc list-inside ml-4 mt-1 text-apex-gray">
                    <li>No server-side processing</li>
                    <li>No external API calls for core functionality</li>
                    <li>No telemetry or analytics</li>
                    <li>No third-party tracking scripts</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="threat-model" className="space-y-4 mt-4">
            <div className="p-4 bg-apex-darker rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Threat Model & Protections</h4>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-green-400 font-medium mb-2">✓ Protected Against</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <div>
                        <p className="text-white font-medium">Server-side data breaches</p>
                        <p className="text-apex-gray text-xs">No data on servers = nothing to breach</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <div>
                        <p className="text-white font-medium">Network interception (MITM)</p>
                        <p className="text-apex-gray text-xs">No sensitive data transmitted over network</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <div>
                        <p className="text-white font-medium">Unauthorized access to storage</p>
                        <p className="text-apex-gray text-xs">Data encrypted at rest with strong encryption</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <div>
                        <p className="text-white font-medium">Tracking and profiling</p>
                        <p className="text-apex-gray text-xs">Zero analytics or tracking mechanisms</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="text-red-400 font-medium mb-2">✗ Not Protected Against</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <div>
                        <p className="text-white font-medium">Keyloggers / Malware</p>
                        <p className="text-apex-gray text-xs">
                          Can capture password during entry or data while vault is unlocked
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <div>
                        <p className="text-white font-medium">Physical device access</p>
                        <p className="text-apex-gray text-xs">If vault is unlocked, data is accessible in memory</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <div>
                        <p className="text-white font-medium">Weak passwords</p>
                        <p className="text-apex-gray text-xs">Brute force attacks possible with weak passwords</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <div>
                        <p className="text-white font-medium">Browser vulnerabilities</p>
                        <p className="text-apex-gray text-xs">Security depends on browser's crypto implementation</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
                  <p className="text-blue-300 text-xs">
                    <strong>Best Practices:</strong> Use a strong master password (12+ characters), lock vault when not
                    in use, keep browser updated, export regular backups, and use antivirus software.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
