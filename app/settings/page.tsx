"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, Laptop, QrCode, Shield, Lock, Cloud, CheckCircle2, Info } from "lucide-react"

export default function SettingsPage() {
  const [connectedDevices] = useState<Array<{ id: string; name: string; type: string; lastSync: string }>>([])

  return (
    <div className="min-h-screen bg-apex-darker p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-apex-gray">Manage your Apex AI preferences and security settings</p>
        </div>

        <Tabs defaultValue="sync" className="w-full">
          <TabsList className="bg-apex-dark border-gray-800">
            <TabsTrigger value="sync">Multi-Device Sync</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Multi-Device Sync Tab */}
          <TabsContent value="sync" className="space-y-6">
            {/* Coming Soon Banner */}
            <Card className="bg-gradient-to-r from-apex-primary/20 to-purple-500/20 border-apex-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-apex-primary/20 rounded-lg">
                    <Cloud className="w-6 h-6 text-apex-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Coming Soon: End-to-End Encrypted Multi-Device Sync
                    </h3>
                    <p className="text-apex-gray mb-4">
                      Securely sync your Apex vault across all your devices with zero-knowledge encryption. Your data
                      remains private, always. We're building the holy grail of secure, user-centric software.
                    </p>
                    <Badge variant="outline" className="bg-apex-primary/10 text-apex-primary border-apex-primary/20">
                      In Development
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="bg-apex-dark/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">How Multi-Device Sync Works</CardTitle>
                <CardDescription>
                  Understanding our zero-knowledge, end-to-end encrypted sync architecture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-apex-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-apex-primary font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Client-Side Encryption
                    </h4>
                    <p className="text-apex-gray text-sm">
                      Your data is encrypted on your device using your master password before it ever leaves. The
                      encryption key never touches our servers.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-apex-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-apex-primary font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
                      <Cloud className="w-4 h-4" />
                      Encrypted Cloud Storage
                    </h4>
                    <p className="text-apex-gray text-sm">
                      The server stores only encrypted blobs. We have zero ability to decrypt your data. It's
                      mathematically impossible for us to see your information.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-apex-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-apex-primary font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      Device Authorization
                    </h4>
                    <p className="text-apex-gray text-sm">
                      Add new devices by scanning a QR code from an existing device. Keys are transferred peer-to-peer,
                      never through our servers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connected Devices (Disabled) */}
            <Card className="bg-apex-dark/50 border-gray-800 opacity-60">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Connected Devices
                </CardTitle>
                <CardDescription>Manage devices that can access your encrypted vault</CardDescription>
              </CardHeader>
              <CardContent>
                {connectedDevices.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-apex-darker rounded-full mb-4">
                      <Laptop className="w-8 h-8 text-apex-gray" />
                    </div>
                    <p className="text-apex-gray mb-4">No devices connected yet</p>
                    <Button disabled variant="outline" className="bg-transparent">
                      <QrCode className="w-4 h-4 mr-2" />
                      Add New Device
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Security Guarantee */}
            <Card className="bg-apex-dark/50 border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold mb-2">Zero-Knowledge Guarantee</h4>
                    <p className="text-apex-gray text-sm mb-3">
                      Even with multi-device sync enabled, Apex AI maintains its core promise: we never have access to
                      your unencrypted data. Your master password is the only key, and it never leaves your devices.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>End-to-end encrypted</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-500 mt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Zero server-side decryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-500 mt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Peer-to-peer device authorization</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-apex-dark/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Security Settings</CardTitle>
                <CardDescription>Manage your encryption and authentication preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-apex-darker rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Encryption Algorithm</h4>
                    <p className="text-sm text-apex-gray">AES-256-GCM with Argon2id key derivation</p>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-apex-darker rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Biometric Authentication</h4>
                    <p className="text-sm text-apex-gray">Use fingerprint or face recognition</p>
                  </div>
                  <Button disabled variant="outline" size="sm" className="bg-transparent">
                    Coming Soon
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-apex-darker rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Auto-Lock Timeout</h4>
                    <p className="text-sm text-apex-gray">Automatically lock vault after inactivity</p>
                  </div>
                  <Button disabled variant="outline" size="sm" className="bg-transparent">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-apex-dark/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Privacy Settings</CardTitle>
                <CardDescription>Control how your data is stored and processed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-apex-primary/10 border border-apex-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-apex-primary mt-0.5" />
                    <div>
                      <h4 className="text-white font-medium mb-1">Local-First Architecture</h4>
                      <p className="text-sm text-apex-gray">
                        All your data is stored locally on your device. No cloud storage, no server access, no data
                        collection. Your information never leaves your device unless you explicitly enable multi-device
                        sync.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-apex-darker rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Analytics</h4>
                    <p className="text-sm text-apex-gray">Anonymous usage statistics</p>
                  </div>
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                    Disabled
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-apex-darker rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Crash Reports</h4>
                    <p className="text-sm text-apex-gray">Help improve Apex by sending error reports</p>
                  </div>
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                    Disabled
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
