"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, Lock, Sparkles, ChevronRight, Cpu, Server, EyeOff } from "lucide-react"

interface VaultSecurityIntroProps {
  onContinue: () => void
}

export default function VaultSecurityIntro({ onContinue }: VaultSecurityIntroProps) {
  const [avatarFormed, setAvatarFormed] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const avatarTimer = setTimeout(() => setAvatarFormed(true), 500)
    const contentTimer = setTimeout(() => setShowContent(true), 1200)
    return () => {
      clearTimeout(avatarTimer)
      clearTimeout(contentTimer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-apex-darker relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-radial from-apex-primary/10 via-transparent to-transparent"></div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-apex-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          {/* Holographic Avatar Formation */}
          <div className="relative inline-block mb-8">
            <div
              className={`relative w-32 h-32 mx-auto transition-all duration-1000 ${
                avatarFormed ? "scale-100 opacity-100" : "scale-50 opacity-0"
              }`}
            >
              {/* Outer rings */}
              <div className="absolute inset-0 -m-8">
                <div className="absolute inset-0 rounded-full border border-apex-primary/30 animate-pulse-ring" />
                <div
                  className="absolute inset-0 rounded-full border border-apex-accent/20 animate-pulse-ring"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>

              {/* Avatar silhouette forming from particles */}
              <div className="relative w-full h-full">
                {/* Data particles converging */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 bg-apex-primary rounded-full transition-all duration-1000 ${
                      avatarFormed ? "opacity-0" : "opacity-100"
                    }`}
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: avatarFormed
                        ? "translate(-50%, -50%)"
                        : `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-60px)`,
                      transitionDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}

                {/* Formed avatar */}
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br from-apex-primary via-apex-secondary to-apex-accent transition-all duration-1000 ${
                    avatarFormed ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  }`}
                >
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 opacity-80 animate-pulseBg" />
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white to-cyan-200 opacity-60 blur-md" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-16 h-16 text-white/90" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div
            className={`transition-all duration-700 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              The AI that knows you —<br />
              <span className="gradient-text">not your data.</span>
            </h1>
            <p className="text-xl text-apex-gray max-w-3xl mx-auto leading-relaxed">
              Apex AI learns your habits, adapts to your goals, and grows with your journey — all without sending your
              information to the cloud.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 transition-all duration-700 delay-200 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <button
              onClick={onContinue}
              className="group relative px-8 py-4 bg-gradient-to-r from-apex-primary to-apex-accent text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center gap-2"
            >
              <span>Try Apex Secure Mode</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                const section = document.getElementById("how-privacy-works")
                section?.scrollIntoView({ behavior: "smooth" })
              }}
              className="px-8 py-4 bg-transparent border-2 border-apex-primary/50 text-apex-primary font-semibold rounded-lg hover:bg-apex-primary/10 transition-all duration-300"
            >
              See How Privacy Works
            </button>
          </div>
        </div>

        {/* Split Info Panel */}
        <div
          id="how-privacy-works"
          className={`grid md:grid-cols-2 gap-8 mb-16 transition-all duration-700 delay-300 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Left: Illustration */}
          <div className="flex items-center justify-center p-8 bg-apex-dark/50 backdrop-blur-sm rounded-2xl border border-apex-primary/20">
            <div className="relative">
              {/* Device illustration */}
              <div className="relative w-48 h-64 bg-gradient-to-br from-apex-dark to-apex-darker rounded-2xl border-2 border-apex-primary/50 shadow-2xl shadow-apex-primary/20">
                {/* Screen */}
                <div className="absolute inset-4 bg-gradient-to-br from-apex-primary/20 to-apex-accent/20 rounded-lg overflow-hidden">
                  {/* Neural pattern */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu className="w-20 h-20 text-apex-primary animate-pulse" />
                  </div>
                  {/* Data flow lines */}
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-px bg-gradient-to-r from-transparent via-apex-primary to-transparent animate-pulse"
                      style={{
                        top: `${20 + i * 15}%`,
                        left: 0,
                        right: 0,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* "No cloud" indicator */}
              <div className="absolute -right-4 -top-4 bg-red-500/20 border-2 border-red-500 rounded-full p-3 animate-pulse">
                <Server className="w-8 h-8 text-red-500 line-through" />
              </div>

              {/* "Local processing" indicator */}
              <div className="absolute -left-4 -bottom-4 bg-green-500/20 border-2 border-green-500 rounded-full p-3 animate-pulse">
                <ShieldCheck className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Right: Copy */}
          <div className="flex flex-col justify-center space-y-6 p-8 bg-apex-dark/50 backdrop-blur-sm rounded-2xl border border-apex-primary/20">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Apex stores and processes everything safely within your space.
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-apex-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-apex-primary" />
                  </div>
                  <p className="text-apex-gray">
                    <span className="text-white font-semibold">No external servers.</span> All AI processing happens
                    locally in your browser.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-apex-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-apex-primary" />
                  </div>
                  <p className="text-apex-gray">
                    <span className="text-white font-semibold">No tracking.</span> We don't collect analytics or usage
                    data.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-apex-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-apex-primary" />
                  </div>
                  <p className="text-apex-gray">
                    <span className="text-white font-semibold">No exposure.</span> Your data is encrypted with keys only
                    you control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Tiles */}
        <div
          className={`grid md:grid-cols-3 gap-6 mb-16 transition-all duration-700 delay-500 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Private Memory Engine */}
          <div className="group p-6 bg-apex-dark/50 backdrop-blur-sm rounded-2xl border border-apex-primary/20 hover:border-apex-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <div className="w-12 h-12 rounded-full bg-apex-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6 text-apex-primary" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Private Memory Engine</h4>
            <p className="text-apex-gray text-sm leading-relaxed">
              Learns and remembers without leaking data. Your conversations, preferences, and insights stay encrypted
              and local.
            </p>
          </div>

          {/* Adaptive Intelligence */}
          <div className="group p-6 bg-apex-dark/50 backdrop-blur-sm rounded-2xl border border-apex-primary/20 hover:border-apex-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <div className="w-12 h-12 rounded-full bg-apex-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6 text-apex-primary" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Adaptive Intelligence</h4>
            <p className="text-apex-gray text-sm leading-relaxed">
              Grows smarter with your daily routine. Apex evolves its understanding of your goals without external
              dependencies.
            </p>
          </div>

          {/* True Connection */}
          <div className="group p-6 bg-apex-dark/50 backdrop-blur-sm rounded-2xl border border-apex-primary/20 hover:border-apex-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <div className="w-12 h-12 rounded-full bg-apex-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-apex-primary" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">True Connection</h4>
            <p className="text-apex-gray text-sm leading-relaxed">
              Builds understanding, not databases. Every interaction strengthens your bond without creating a data
              trail.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`text-center transition-all duration-700 delay-700 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-apex-gray italic text-lg mb-8">Because your story belongs to you.</p>

          <div className="flex items-center justify-center gap-6 text-sm text-apex-gray">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>AES-256-GCM</span>
            </div>
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-green-400" />
              <span>Zero-Knowledge</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-400" />
              <span>Local-First</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
