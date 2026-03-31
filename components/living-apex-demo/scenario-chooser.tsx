"use client"

import { demoScenarios } from "@/lib/demo-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState, useEffect } from "react"

interface ScenarioChooserProps {
  onSelect: (scenarioId: string) => void
  onClose?: () => void
}

export function ScenarioChooser({ onSelect, onClose }: ScenarioChooserProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  return (
    <div className="min-h-screen bg-apex-darker flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-apex-primary rounded-full particle opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl animate-fadeIn">
        {/* Close button */}
        {onClose && (
          <div className="absolute -top-12 right-0 animate-fadeIn">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-apex-gray hover:text-apex-primary">
              <X size={24} />
            </Button>
          </div>
        )}

        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold text-apex-primary mb-4 neon-text">Experience Apex AI</h1>
          <p className="text-xl text-apex-gray">Choose a scenario to see how Apex adapts to your needs</p>
        </div>

        {/* Scenario cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoScenarios.map((scenario, index) => (
            <div
              key={scenario.id}
              className="animate-fadeIn transition-smooth hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => setHoveredCard(scenario.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card
                className={`relative overflow-hidden cursor-pointer group bg-apex-dark/50 backdrop-blur-lg border-apex-primary/20 hover:border-apex-primary/60 transition-all duration-300 h-full ${
                  hoveredCard === scenario.id ? "scale-105 -translate-y-1" : ""
                }`}
                onClick={() => onSelect(scenario.id)}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-apex-primary/0 via-apex-primary/5 to-apex-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative p-6 flex flex-col items-center text-center h-full">
                  {/* Icon */}
                  <div className="text-6xl mb-4 transition-transform duration-300 group-hover:scale-110">
                    {scenario.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-apex-primary mb-2">{scenario.title}</h3>

                  {/* Subtitle */}
                  <p className="text-apex-gray mb-6 flex-grow">{scenario.subtitle}</p>

                  {/* CTA */}
                  <Button className="w-full bg-apex-primary/20 hover:bg-apex-primary text-apex-primary hover:text-apex-dark border border-apex-primary/40 hover:border-apex-primary transition-all duration-300">
                    Try This Scenario
                  </Button>
                </div>

                {/* Animated border */}
                <div
                  className={`absolute inset-0 border-2 border-apex-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    hoveredCard === scenario.id ? "animate-glow" : ""
                  }`}
                />
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
