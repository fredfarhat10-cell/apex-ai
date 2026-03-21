"use client"

import { useState, useRef, Suspense } from "react"
import { motion } from "framer-motion"
import { Canvas, useFrame } from "@react-three/fiber"
import { MeshTransmissionMaterial, Stars, Sphere } from "@react-three/drei"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp, Brain, Heart, DollarSign, Target, Maximize2, Mic } from "lucide-react"
import { useVault } from "@/lib/vault-context"
import { cn } from "@/lib/utils"
import * as THREE from "three"

interface PerformanceMetrics {
  overall: number
  financial: number
  wellness: number
  productivity: number
  relationships: number
  growth: number
}

function PerformanceOrb3D({ color = "gold", score = 78 }: { color?: string; score?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = -state.clock.elapsedTime * 0.5
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      coreRef.current.scale.set(scale, scale, scale)
    }
  })

  const getColorFromScore = (score: number) => {
    if (score >= 80) return new THREE.Color("#FFD700") // Gold for flow state
    if (score >= 60) return new THREE.Color("#FFA500") // Orange for good
    return new THREE.Color("#FF6B6B") // Red for stress
  }

  const orbColor = getColorFromScore(score)

  return (
    <group>
      {/* Core - Bright inner sphere */}
      <Sphere ref={coreRef} args={[0.8, 32, 32]}>
        <meshStandardMaterial color={orbColor} emissive={orbColor} emissiveIntensity={2} toneMapped={false} />
      </Sphere>

      {/* Glassmorphic outer shell */}
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshTransmissionMaterial
          backside
          samples={16}
          resolution={512}
          transmission={0.95}
          roughness={0.1}
          thickness={0.5}
          ior={1.5}
          chromaticAberration={0.1}
          anisotropy={1}
          distortion={0.2}
          distortionScale={0.5}
          temporalDistortion={0.1}
          color={orbColor}
        />
      </Sphere>

      {/* Outer glow ring */}
      <Sphere args={[2, 32, 32]}>
        <meshBasicMaterial color={orbColor} transparent opacity={0.1} side={THREE.BackSide} />
      </Sphere>
    </group>
  )
}

function VoiceHalo({ isListening = true }: { isListening?: boolean }) {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(
            from 0deg,
            transparent 0%,
            rgba(212, 175, 55, 0.3) 10%,
            transparent 20%,
            transparent 80%,
            rgba(212, 175, 55, 0.3) 90%,
            transparent 100%
          )`,
          padding: "2px",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {isListening && (
        <motion.div
          className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-[#D4AF37]/30"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Mic className="w-4 h-4 text-[#D4AF37]" />
          </motion.div>
          <span className="text-xs text-[#D4AF37] font-medium">Listening</span>
        </motion.div>
      )}
    </motion.div>
  )
}

function PreCogTicker() {
  const messages = [
    "SAVED $12,450 ON TAX-LOSS HARVESTING",
    "PREVENTED MARATHON DNF (RECOVERY LOW)",
    "SECURED DAUGHTER'S RECITAL SEAT (CALENDAR CONFLICT DETECTED)",
    "BOOKED RIO FLIGHT AT 42% DISCOUNT",
    "DETECTED BURNOUT RISK - SCHEDULED RECOVERY DAY",
    "OPTIMIZED PORTFOLIO ALLOCATION (+8.2% PROJECTED)",
    "IDENTIFIED MEETING CONFLICT - RESCHEDULED AUTOMATICALLY",
  ]

  const fullMessage = messages.join("  •  ") + "  •  "
  const duplicatedMessage = fullMessage + fullMessage

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-[#D4AF37]/20 py-3 overflow-hidden z-40">
      <motion.div
        className="whitespace-nowrap text-[#D4AF37] font-mono text-sm"
        animate={{
          x: [0, -fullMessage.length * 8],
        }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {duplicatedMessage}
      </motion.div>
    </div>
  )
}

function GenomeRibbon() {
  const archetypes = [
    { name: "BOLD YOU", color: "#FF6B35", description: "Risk-taker, high growth" },
    { name: "FAMILY YOU", color: "#4ECDC4", description: "Relationship-focused" },
    { name: "ATHLETE YOU", color: "#95E1D3", description: "Peak performance" },
    { name: "SCHOLAR YOU", color: "#F38181", description: "Knowledge seeker" },
    { name: "BUILDER YOU", color: "#AA96DA", description: "Creator, entrepreneur" },
  ]

  return (
    <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-[#D4AF37]/20 py-4 z-40">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-muted-foreground uppercase tracking-wider flex-shrink-0">ARCHETYPES:</span>
          {archetypes.map((archetype, idx) => (
            <motion.button
              key={idx}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-colors flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: archetype.color }} />
              <span className="text-xs font-mono text-white">{archetype.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function OrbitalDashboard() {
  const vault = useVault()
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    overall: 78,
    financial: 82,
    wellness: 75,
    productivity: 80,
    relationships: 70,
    growth: 85,
  })
  const [selectedMetric, setSelectedMetric] = useState<keyof PerformanceMetrics | null>(null)
  const [isListening, setIsListening] = useState(true)

  const getMetricColor = (value: number) => {
    if (value >= 80) return "text-green-500"
    if (value >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getMetricGradient = (value: number) => {
    if (value >= 80) return "from-green-500/20 to-green-500/5"
    if (value >= 60) return "from-yellow-500/20 to-yellow-500/5"
    return "from-red-500/20 to-red-500/5"
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <VoiceHalo isListening={isListening} />

      <GenomeRibbon />

      <PreCogTicker />

      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Suspense fallback={null}>
            {/* Deep space background with parallax stars */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
            <Stars radius={150} depth={80} count={3000} factor={6} saturation={0} fade speed={0.2} />

            {/* Lighting */}
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4ECDC4" />

            {/* 3D Performance Orb */}
            <PerformanceOrb3D color="gold" score={metrics.overall} />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 container mx-auto px-6 py-24 pb-32">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-white to-[#D4AF37] mb-4 tracking-tight">
            Orbital Command Center
          </h1>
          <p className="text-muted-foreground text-lg">Your life performance at a glance</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Metric Cards */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { key: "financial", label: "Financial", icon: DollarSign, value: metrics.financial },
              { key: "wellness", label: "Wellness", icon: Heart, value: metrics.wellness },
              { key: "productivity", label: "Productivity", icon: Zap, value: metrics.productivity },
              { key: "relationships", label: "Social", icon: Target, value: metrics.relationships },
              { key: "growth", label: "Growth", icon: TrendingUp, value: metrics.growth },
              { key: "overall", label: "Mental", icon: Brain, value: 88 },
            ].map((metric, idx) => {
              const Icon = metric.icon
              const isSelected = selectedMetric === metric.key

              return (
                <motion.div
                  key={metric.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                >
                  <Card
                    className={cn(
                      "p-6 cursor-pointer transition-all hover:scale-105 bg-black/60 backdrop-blur-xl",
                      isSelected
                        ? "border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20"
                        : "border-[#D4AF37]/20 hover:border-[#D4AF37]/40",
                    )}
                    onClick={() => setSelectedMetric(metric.key as keyof PerformanceMetrics)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Icon className={cn("w-6 h-6", isSelected ? "text-[#D4AF37]" : getMetricColor(metric.value))} />
                      <Badge variant="outline" className="text-xs border-[#D4AF37]/30">
                        {metric.value >= 80 ? "Excellent" : metric.value >= 60 ? "Good" : "Needs Work"}
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{metric.value}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{metric.label}</p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Performance Summary */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <Card className="p-6 bg-black/60 backdrop-blur-xl border-[#D4AF37]/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Performance Summary</h3>
                <Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">
                  Live
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Score</span>
                  <span className="text-2xl font-bold text-[#D4AF37]">{metrics.overall}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm text-green-500 font-medium">Optimal Performance</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Weekly Trend</span>
                  <span className="text-sm text-[#D4AF37] font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +12%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Next Sync</span>
                  <span className="text-sm text-white font-medium">Tomorrow 9:00 AM</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-black/60 backdrop-blur-xl border-[#D4AF37]/20">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Daily Synapse", icon: Zap, href: "/daily-synapse" },
                  { label: "Weekly Sync", icon: Target, href: "/weekly-sync" },
                  { label: "Genome View", icon: Brain, href: "/genome" },
                  {
                    label: "Full Screen",
                    icon: Maximize2,
                    onClick: () => document.documentElement.requestFullscreen(),
                  },
                ].map((action, idx) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 transition-all bg-transparent border-[#D4AF37]/20"
                      onClick={action.onClick}
                    >
                      <Icon className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
