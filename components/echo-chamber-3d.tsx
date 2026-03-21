"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars, Float, Html, PerspectiveCamera, Line } from "@react-three/drei"
import { useRef, useState, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type * as THREE from "three"
import { X, TrendingUp } from "lucide-react"

interface TimelinePath {
  title: string
  probability: number
  color: string
  points: [number, number, number][]
  outcome: string
}

const mockTimelinePaths: TimelinePath[] = [
  {
    title: "The Ambitious Leap",
    probability: 45,
    color: "#FFD700",
    points: [
      [0, 0, 0],
      [2, 1, -1],
      [4, 2, -2],
      [6, 3, -2.5],
      [8, 4, -3],
    ],
    outcome: "High growth trajectory with initial sacrifice",
  },
  {
    title: "The Balanced Evolution",
    probability: 35,
    color: "#10B981",
    points: [
      [0, 0, 0],
      [2, 0.5, 0],
      [4, 1, 0.5],
      [6, 1.5, 1],
      [8, 2, 1.5],
    ],
    outcome: "Sustainable growth prioritizing stability",
  },
  {
    title: "The Strategic Pivot",
    probability: 20,
    color: "#9333EA",
    points: [
      [0, 0, 0],
      [2, -0.5, 1],
      [4, 0, 2],
      [6, 1, 3],
      [8, 3, 4],
    ],
    outcome: "Unconventional path to autonomy",
  },
]

function TimelineBranch({
  path,
  isSelected,
  onClick,
}: { path: TimelinePath; isSelected: boolean; onClick: () => void }) {
  const sphereRefs = useRef<THREE.Mesh[]>([])

  useFrame((state) => {
    sphereRefs.current.forEach((sphere, i) => {
      if (sphere) {
        const pulse = Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.1 + 1
        sphere.scale.setScalar(isSelected ? pulse * 1.5 : 1)
      }
    })
  })

  return (
    <group>
      {/* Path line */}
      <Line
        points={path.points}
        color={path.color}
        lineWidth={isSelected ? 3 : 1.5}
        transparent
        opacity={isSelected ? 1 : 0.6}
      />

      {/* Milestone spheres */}
      {path.points.map((point, i) => (
        <Float key={i} speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
          <mesh
            ref={(el) => {
              if (el) sphereRefs.current[i] = el
            }}
            position={point}
            onClick={onClick}
            onPointerOver={(e) => {
              e.stopPropagation()
              document.body.style.cursor = "pointer"
            }}
            onPointerOut={() => {
              document.body.style.cursor = "default"
            }}
          >
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={path.color} emissive={path.color} emissiveIntensity={isSelected ? 1.5 : 0.8} />
            {isSelected && i === path.points.length - 1 && (
              <Html center distanceFactor={6}>
                <div
                  className="bg-black/90 backdrop-blur-sm border px-4 py-3 rounded-lg font-medium whitespace-nowrap text-sm"
                  style={{ borderColor: path.color, color: path.color }}
                >
                  <p className="font-bold mb-1">{path.title}</p>
                  <p className="text-xs opacity-70">{path.probability}% probability</p>
                </div>
              </Html>
            )}
          </mesh>
          <pointLight color={path.color} intensity={isSelected ? 1.5 : 0.8} distance={3} />
        </Float>
      ))}
    </group>
  )
}

function TimelineScene({
  paths,
  selectedPath,
  onPathClick,
}: {
  paths: TimelinePath[]
  selectedPath: TimelinePath | null
  onPathClick: (path: TimelinePath) => void
}) {
  return (
    <>
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />

      {/* Origin point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#FF6B00" emissive="#FF6B00" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0, 0, 0]} color="#FF6B00" intensity={2} distance={5} />

      {/* Timeline branches */}
      {paths.map((path) => (
        <TimelineBranch
          key={path.title}
          path={path}
          isSelected={selectedPath?.title === path.title}
          onClick={() => onPathClick(path)}
        />
      ))}

      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} minDistance={5} maxDistance={20} />
    </>
  )
}

export function EchoChamber3D({ isActive, onClose }: { isActive: boolean; onClose: () => void }) {
  const [selectedPath, setSelectedPath] = useState<TimelinePath | null>(null)

  if (!isActive) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black"
      >
        {/* 3D Canvas */}
        <Canvas>
          <PerspectiveCamera makeDefault position={[4, 3, 12]} fov={75} />
          <Suspense fallback={null}>
            <TimelineScene paths={mockTimelinePaths} selectedPath={selectedPath} onPathClick={setSelectedPath} />
          </Suspense>
        </Canvas>

        {/* Header */}
        <div className="absolute top-8 left-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur-md border border-[#FF6B00]/30 rounded-lg px-6 py-4"
          >
            <h1 className="text-2xl font-bold text-white mb-1">Echo Chamber</h1>
            <p className="text-sm text-gray-400">Explore your probable futures in 3D</p>
          </motion.div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 z-10 p-3 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Path details panel */}
        {selectedPath && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-32 right-8 z-10 w-96 bg-black/80 backdrop-blur-xl border rounded-lg p-6"
            style={{ borderColor: selectedPath.color }}
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6" style={{ color: selectedPath.color }} />
              <h3 className="text-xl font-bold text-white">{selectedPath.title}</h3>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-3 py-1 border rounded-full text-sm font-medium"
                style={{ borderColor: selectedPath.color, color: selectedPath.color }}
              >
                {selectedPath.probability}% probability
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{selectedPath.outcome}</p>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-8 left-8 z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 text-sm text-gray-300"
          >
            <p className="mb-1">🖱️ Drag to rotate timelines</p>
            <p className="mb-1">🔍 Scroll to zoom</p>
            <p>✨ Click path endpoints to explore</p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
