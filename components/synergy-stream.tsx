"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { PerspectiveCamera } from "@react-three/drei"
import { useRef, useMemo } from "react"
import { motion } from "framer-motion"
import type * as THREE from "three"
import { X } from "lucide-react"

interface SynergyStreamProps {
  from: "wellness" | "financial" | "career"
  to: "wellness" | "financial" | "career"
  insight: string
  onClose: () => void
}

function ParticleStream({
  fromPos,
  toPos,
  color,
}: { fromPos: [number, number, number]; toPos: [number, number, number]; color: string }) {
  const particlesRef = useRef<THREE.Points>(null)

  const particleCount = 100
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount
      pos[i * 3] = fromPos[0] + (toPos[0] - fromPos[0]) * t
      pos[i * 3 + 1] = fromPos[1] + (toPos[1] - fromPos[1]) * t
      pos[i * 3 + 2] = fromPos[2] + (toPos[2] - fromPos[2]) * t
    }
    return pos
  }, [fromPos, toPos])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.z = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={color} transparent opacity={0.8} />
    </points>
  )
}

function StreamScene({ fromPos, toPos }: { fromPos: [number, number, number]; toPos: [number, number, number] }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {/* Particle stream */}
      <ParticleStream fromPos={fromPos} toPos={toPos} color="#FF6B00" />

      {/* Source sphere */}
      <mesh position={fromPos}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.8} />
      </mesh>

      {/* Destination sphere */}
      <mesh position={toPos}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.8} />
      </mesh>
    </>
  )
}

export function SynergyStream({ from, to, insight, onClose }: SynergyStreamProps) {
  const fromPos: [number, number, number] = [-3, 0, 0]
  const toPos: [number, number, number] = [3, 0, 0]

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={75} />
          <StreamScene fromPos={fromPos} toPos={toPos} />
        </Canvas>
      </div>

      {/* Insight panel */}
      <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-black/80 backdrop-blur-xl border border-[#FF6B00]/30 rounded-2xl p-8 shadow-2xl pointer-events-auto"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Synergy Detected</h2>
              <p className="text-sm text-gray-400">
                {from.charAt(0).toUpperCase() + from.slice(1)} → {to.charAt(0).toUpperCase() + to.slice(1)}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="bg-gradient-to-r from-[#FF6B00]/20 to-[#9333EA]/20 border border-[#FF6B00]/30 rounded-lg p-6">
            <p className="text-lg text-white leading-relaxed">{insight}</p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-1 bg-gradient-to-r from-[#10B981] via-[#FF6B00] to-[#FFD700] rounded-full" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
