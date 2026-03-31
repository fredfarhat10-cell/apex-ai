"use client"

import { useEffect, useState } from "react"

interface BackgroundFXProps {
  scenario: "fitness" | "writing" | "productivity"
}

const scenarioGradients = {
  fitness: {
    from: "#001f3f",
    via: "#003d6b",
    to: "#00ffff",
  },
  writing: {
    from: "#1a0033",
    via: "#330066",
    to: "#9966ff",
  },
  productivity: {
    from: "#001a33",
    via: "#004466",
    to: "#00ccff",
  },
}

export function BackgroundFX({ scenario }: BackgroundFXProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const gradient = scenarioGradients[scenario]

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }))
    setParticles(newParticles)
  }, [scenario])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 animate-fadeIn"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${gradient.to}15 0%, ${gradient.via}10 40%, ${gradient.from} 100%)`,
          animationDuration: "1.2s",
        }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-apex-primary rounded-full particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        />
      ))}

      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 animate-pulseBg"
        style={{ background: gradient.to, animationDuration: "6s" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulseBg"
        style={{ background: gradient.via, animationDuration: "8s", animationDelay: "1s" }}
      />
    </div>
  )
}
