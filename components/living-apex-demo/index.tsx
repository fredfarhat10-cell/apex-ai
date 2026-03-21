"use client"

import { useState, useEffect } from "react"
import { ScenarioChooser } from "./scenario-chooser"
import { DemoScene } from "./demo-scene"
import { StatsPanel } from "./stats-panel"
import { PrivacyZone } from "./privacy-zone"
import { SoundToggle } from "./sound-toggle"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, ArrowRight, X, Brain } from "lucide-react"
import { incrementConversations, trackScenarioCompletion } from "@/lib/apex-stats"
import { playSound } from "@/lib/sound-manager"

interface LivingApexDemoProps {
  onClose?: () => void
  onStartApex?: () => void
}

export function LivingApexDemo({ onClose, onStartApex }: LivingApexDemoProps) {
  const [stage, setStage] = useState<"chooser" | "demo" | "cta">("chooser")
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [showWakeUp, setShowWakeUp] = useState(true)

  useEffect(() => {
    playSound("notification")
    const timer = setTimeout(() => setShowWakeUp(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stage === "cta" && onClose) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [stage, onClose])

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId)
    setStage("demo")
    playSound("click")
  }

  const handleDemoComplete = () => {
    if (selectedScenario) {
      trackScenarioCompletion(selectedScenario)
      incrementConversations()
    }
    setStage("cta")
    playSound("success")
  }

  const handleBack = () => {
    setStage("chooser")
    setSelectedScenario(null)
    playSound("click")
  }

  if (showWakeUp) {
    return (
      <div className="min-h-screen bg-apex-darker flex items-center justify-center overflow-hidden">
        <div className="text-center animate-fadeIn">
          <div className="relative inline-block mb-6">
            <Brain className="w-24 h-24 text-apex-primary animate-pulse" />
            <div className="absolute inset-0 bg-apex-primary/20 rounded-full blur-2xl animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-apex-primary neon-text">Apex is waking up...</h2>
        </div>
      </div>
    )
  }

  return (
    <>
      {stage === "chooser" && (
        <div className="animate-fadeIn" style={{ animationDuration: "400ms" }}>
          <div className="fixed top-6 right-20 z-20">
            <SoundToggle />
          </div>
          <ScenarioChooser onSelect={handleScenarioSelect} onClose={onClose} />
        </div>
      )}

      {stage === "demo" && selectedScenario && (
        <div className="animate-fadeIn" style={{ animationDuration: "400ms" }}>
          <div className="fixed top-6 right-20 z-20">
            <SoundToggle />
          </div>
          <DemoScene scenarioId={selectedScenario} onBack={handleBack} onComplete={handleDemoComplete} />
        </div>
      )}

      {stage === "cta" && (
        <div
          className="min-h-screen bg-apex-darker flex items-center justify-center p-4 relative overflow-hidden animate-fadeIn"
          style={{ animationDuration: "600ms" }}
        >
          <div className="absolute inset-0 bg-gradient-radial from-apex-primary/20 via-apex-dark/50 to-apex-darker animate-pulseBg" />

          <div className="absolute top-6 right-20 z-20">
            <SoundToggle />
          </div>

          <div className="absolute top-6 right-6 z-20 animate-fadeIn">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-apex-gray hover:text-apex-primary"
              aria-label="Exit demo (or press ESC)"
            >
              <X size={24} />
            </Button>
            <span className="text-xs text-apex-gray/60 mt-1 block text-center">ESC</span>
          </div>

          <div className="relative z-10 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 text-center lg:text-left">
              <div className="inline-block mb-6 animate-spin-slow">
                <Sparkles className="w-20 h-20 text-apex-primary" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-apex-primary mb-4 neon-text-strong animate-fadeIn delay-600">
                Ready to Experience Your Own Apex?
              </h1>

              <p
                className="text-xl text-apex-gray mb-8 leading-relaxed animate-fadeIn"
                style={{ animationDelay: "800ms" }}
              >
                This was just a glimpse. Your personal Apex AI learns from you, adapts to your needs, and keeps
                everything private and secure.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fadeIn delay-1000">
                <Button
                  size="lg"
                  onClick={onStartApex}
                  className="bg-apex-primary text-apex-dark hover:bg-apex-primary/90 text-lg px-8 py-6 cta-hover-glow group"
                >
                  Start Your Apex Journey
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleBack}
                  className="border-apex-primary/40 text-apex-primary hover:bg-apex-primary/10 text-lg px-8 py-6 bg-transparent"
                >
                  Try Another Scenario
                </Button>
              </div>

              <div className="mt-12 animate-fadeIn" style={{ animationDelay: "1200ms" }}>
                <Card className="bg-apex-dark/50 backdrop-blur-lg border-apex-primary/20 p-6 glassmorphism">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div>
                      <h3 className="text-apex-primary font-bold mb-2">🔒 Private by Design</h3>
                      <p className="text-sm text-apex-gray">
                        Your data never leaves your device. Complete privacy guaranteed.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-apex-primary font-bold mb-2">🧠 Truly Adaptive</h3>
                      <p className="text-sm text-apex-gray">
                        Learns your preferences and adapts to your unique needs over time.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-apex-primary font-bold mb-2">♾️ Infinite Possibilities</h3>
                      <p className="text-sm text-apex-gray">
                        One AI for everything—fitness, creativity, productivity, and more.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-6 animate-fadeIn" style={{ animationDelay: "1400ms" }}>
              <StatsPanel />
              <PrivacyZone />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
