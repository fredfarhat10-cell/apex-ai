"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import {
  OrbitControls,
  Stars,
  Float,
  Html,
  PerspectiveCamera,
  Cloud,
  MeshTransmissionMaterial,
} from "@react-three/drei"
import { useRef, useState, Suspense, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type * as THREE from "three"
import { HolographicDisplay } from "./holographic-display"
import { TalkingOrb } from "./talking-orb"
import { LifeConstellation } from "./life-constellation"
import { SynergyStream } from "./synergy-stream"
import { Button } from "./ui/button"
import { Sparkles, Network } from "lucide-react"

function CentralOrb() {
  const meshRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  // Particle ring system
  const particleCount = 200
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2
    const radius = 2 + Math.random() * 0.5
    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5
    positions[i * 3 + 2] = Math.sin(angle) * radius
  }

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group>
        {/* Particle ring */}
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial size={0.03} color="#FF6B00" transparent opacity={0.6} />
        </points>

        {/* Main orb with glassmorphic material */}
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <sphereGeometry args={[1.5, 64, 64]} />
          <MeshTransmissionMaterial
            backside
            samples={16}
            resolution={512}
            transmission={0.95}
            roughness={0.1}
            thickness={0.5}
            ior={1.5}
            chromaticAberration={0.5}
            anisotropy={1}
            distortion={0.3}
            distortionScale={0.5}
            temporalDistortion={0.2}
            color="#FF6B00"
          />
        </mesh>

        {/* Inner glow sphere */}
        <mesh scale={0.8}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial color="#FF6B00" transparent opacity={0.3} />
        </mesh>

        {/* Pulsing core light */}
        <pointLight color="#FF6B00" intensity={3} distance={15} decay={2} />
      </group>
    </Float>
  )
}

function FinancialGuildSatellite({
  position,
  onClick,
}: {
  position: [number, number, number]
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.z = state.clock.elapsedTime * 0.2
    }
  })

  // Particle stream
  const particleCount = 50
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2
    const radius = 0.8
    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = Math.sin(angle) * radius
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2
  }

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.3}>
      <group position={position}>
        {/* Particle stream */}
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial size={0.02} color="#FFD700" transparent opacity={0.8} />
        </points>

        {/* Golden cube */}
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onClick}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={hovered ? 1.5 : 0.7}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        {hovered && (
          <Html center distanceFactor={8}>
            <div className="bg-black/80 backdrop-blur-sm border border-[#FFD700] px-4 py-2 rounded-lg text-[#FFD700] font-semibold whitespace-nowrap cursor-pointer animate-pulse">
              💰 Financial Guild
            </div>
          </Html>
        )}
        <pointLight color="#FFD700" intensity={hovered ? 2 : 1} distance={6} />
      </group>
    </Float>
  )
}

function WellnessGuildSatellite({
  position,
  auraColor,
  onClick,
}: {
  position: [number, number, number]
  auraColor: string
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1
      meshRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.4}>
      <group position={position}>
        {/* Bioluminescent sphere */}
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onClick}
        >
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial
            color={auraColor}
            emissive={auraColor}
            emissiveIntensity={hovered ? 2 : 1.2}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* Outer glow */}
        <mesh scale={1.3}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial color={auraColor} transparent opacity={0.2} />
        </mesh>

        {hovered && (
          <Html center distanceFactor={8}>
            <div
              className="bg-black/80 backdrop-blur-sm border px-4 py-2 rounded-lg font-semibold whitespace-nowrap cursor-pointer animate-pulse"
              style={{ borderColor: auraColor, color: auraColor }}
            >
              🧘 Wellness Guild
            </div>
          </Html>
        )}
        <pointLight color={auraColor} intensity={hovered ? 2 : 1.2} distance={6} />
      </group>
    </Float>
  )
}

function CareerGuildSatellite({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.8
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4
    }
  })

  return (
    <Float speed={2.2} rotationIntensity={1.2} floatIntensity={0.5}>
      <group position={position}>
        {/* Crystalline octahedron */}
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onClick}
        >
          <octahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial
            color="#00D9FF"
            emissive="#00D9FF"
            emissiveIntensity={hovered ? 1.8 : 0.8}
            roughness={0.05}
            metalness={0.95}
          />
        </mesh>

        {/* Sharp edges glow */}
        <mesh scale={1.05}>
          <octahedronGeometry args={[0.9, 0]} />
          <meshBasicMaterial color="#00D9FF" transparent opacity={0.3} wireframe />
        </mesh>

        {hovered && (
          <Html center distanceFactor={8}>
            <div className="bg-black/80 backdrop-blur-sm border border-[#00D9FF] px-4 py-2 rounded-lg text-[#00D9FF] font-semibold whitespace-nowrap cursor-pointer animate-pulse">
              💼 Career Guild
            </div>
          </Html>
        )}
        <pointLight color="#00D9FF" intensity={hovered ? 2 : 1} distance={6} />
      </group>
    </Float>
  )
}

function Scene({
  onGuildClick,
}: {
  onGuildClick: (guild: "financial" | "wellness" | "career") => void
}) {
  useEffect(() => {
    // Voice greeting on load
    const speak = (text: string) => {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 0.8
        window.speechSynthesis.speak(utterance)
      }
    }

    setTimeout(() => {
      speak("Welcome to Apex Nexus. Your Life OS is now online. Navigate your universe by voice or touch.")
    }, 1000)
  }, [])

  return (
    <>
      {/* Dynamic starfield background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Ambient nebula clouds */}
      <Cloud opacity={0.15} speed={0.2} width={10} depth={1.5} segments={20} color="#FF6B00" position={[0, 0, -10]} />
      <Cloud opacity={0.1} speed={0.3} width={12} depth={2} segments={25} position={[5, 2, -5]} color="#9333EA" />
      <Cloud opacity={0.08} speed={0.25} width={8} depth={1.8} segments={18} position={[-5, -2, -8]} color="#00D9FF" />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#FF6B00" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#9333EA" />

      {/* Central Cosmic Orb */}
      <CentralOrb />

      {/* Guild Satellites orbiting the central orb */}
      <FinancialGuildSatellite position={[5, 1, 0]} onClick={() => onGuildClick("financial")} />
      <WellnessGuildSatellite position={[-4, -1, 3]} auraColor="#10B981" onClick={() => onGuildClick("wellness")} />
      <CareerGuildSatellite position={[0, 3, -5]} onClick={() => onGuildClick("career")} />

      {/* Camera controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

export default function ApexNexus() {
  const [selectedGuild, setSelectedGuild] = useState<"financial" | "wellness" | "career" | null>(null)
  const [showConstellation, setShowConstellation] = useState(false)
  const [showSynergyStream, setShowSynergyStream] = useState(false)

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Canvas */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={75} />
        <Suspense fallback={null}>
          <Scene onGuildClick={setSelectedGuild} />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-8 left-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/60 backdrop-blur-md border border-[#FF6B00]/30 rounded-lg px-6 py-4"
        >
          <h1 className="text-2xl font-bold text-white mb-1">Apex Nexus</h1>
          <p className="text-sm text-gray-400">Your Life OS in 3D Space</p>
        </motion.div>
      </div>

      {/* Experience buttons */}
      <div className="absolute top-8 right-8 z-10 flex flex-col gap-3">
        <Button
          onClick={() => setShowConstellation(true)}
          className="bg-black/60 backdrop-blur-md border border-[#9333EA]/30 hover:bg-[#9333EA]/20 text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Life Constellation
        </Button>
        <Button
          onClick={() => setShowSynergyStream(true)}
          className="bg-black/60 backdrop-blur-md border border-[#FF6B00]/30 hover:bg-[#FF6B00]/20 text-white"
        >
          <Network className="w-4 h-4 mr-2" />
          Synergy Stream
        </Button>
      </div>

      {/* Navigation hint */}
      <div className="absolute bottom-8 left-8 z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 text-sm text-gray-300"
        >
          <p className="mb-1">🖱️ Drag to rotate</p>
          <p className="mb-1">🔍 Scroll to zoom</p>
          <p className="mb-1">✨ Click satellites to explore</p>
          <p>🎤 Use voice commands to navigate</p>
        </motion.div>
      </div>

      {/* Holographic Display */}
      <AnimatePresence>
        {selectedGuild && <HolographicDisplay guildType={selectedGuild} onClose={() => setSelectedGuild(null)} />}
      </AnimatePresence>

      {/* Life Constellation */}
      <AnimatePresence>
        {showConstellation && <LifeConstellation onClose={() => setShowConstellation(false)} />}
      </AnimatePresence>

      {/* Synergy Stream */}
      <AnimatePresence>
        {showSynergyStream && (
          <SynergyStream
            from="wellness"
            to="financial"
            insight="I've detected a new synergy: your morning workouts are directly correlated with a positive 2% daily gain in your portfolio, likely due to increased clarity in decision-making."
            onClose={() => setShowSynergyStream(false)}
          />
        )}
      </AnimatePresence>

      {/* Voice-First Talking Orb */}
      <TalkingOrb />
    </div>
  )
}
