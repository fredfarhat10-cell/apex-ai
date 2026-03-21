"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars, Float, Html, PerspectiveCamera, Line } from "@react-three/drei"
import { useState, Suspense } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"

interface LifeEvent {
  id: string
  title: string
  date: string
  category: "career" | "financial" | "wellness" | "personal"
  position: [number, number, number]
  connections: string[]
}

const mockLifeEvents: LifeEvent[] = [
  {
    id: "1",
    title: "Started New Job",
    date: "Jan 2024",
    category: "career",
    position: [3, 2, -2],
    connections: ["2", "3"],
  },
  {
    id: "2",
    title: "Income Increased 30%",
    date: "Feb 2024",
    category: "financial",
    position: [5, 1, 0],
    connections: ["4"],
  },
  {
    id: "3",
    title: "Moved to New City",
    date: "Jan 2024",
    category: "personal",
    position: [2, 3, -3],
    connections: ["5"],
  },
  {
    id: "4",
    title: "Invested in Portfolio",
    date: "Mar 2024",
    category: "financial",
    position: [6, 0, 1],
    connections: [],
  },
  {
    id: "5",
    title: "Joined Gym",
    date: "Feb 2024",
    category: "wellness",
    position: [-2, 2, -1],
    connections: ["6"],
  },
  {
    id: "6",
    title: "Improved Recovery Score",
    date: "Apr 2024",
    category: "wellness",
    position: [-3, 1, 1],
    connections: [],
  },
]

function EventStar({ event, onClick }: { event: LifeEvent; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  const getColor = () => {
    switch (event.category) {
      case "career":
        return "#00D9FF"
      case "financial":
        return "#FFD700"
      case "wellness":
        return "#10B981"
      case "personal":
        return "#9333EA"
    }
  }

  const color = getColor()

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={event.position}>
        <mesh onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} onClick={onClick}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1.5 : 0.8} />
        </mesh>
        {hovered && (
          <Html center distanceFactor={6}>
            <div
              className="bg-black/90 backdrop-blur-sm border px-3 py-2 rounded-lg font-medium whitespace-nowrap text-sm cursor-pointer"
              style={{ borderColor: color, color: color }}
            >
              <p className="font-bold">{event.title}</p>
              <p className="text-xs opacity-70">{event.date}</p>
            </div>
          </Html>
        )}
        <pointLight color={color} intensity={hovered ? 1 : 0.5} distance={3} />
      </group>
    </Float>
  )
}

function ConnectionLine({
  start,
  end,
  color,
}: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  return <Line points={[start, end]} color={color} lineWidth={1} transparent opacity={0.4} />
}

function ConstellationScene({
  events,
  onEventClick,
}: { events: LifeEvent[]; onEventClick: (event: LifeEvent) => void }) {
  return (
    <>
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.3} />

      {/* Render event stars */}
      {events.map((event) => (
        <EventStar key={event.id} event={event} onClick={() => onEventClick(event)} />
      ))}

      {/* Render connection lines */}
      {events.map((event) =>
        event.connections.map((connId) => {
          const connectedEvent = events.find((e) => e.id === connId)
          if (!connectedEvent) return null
          return (
            <ConnectionLine
              key={`${event.id}-${connId}`}
              start={event.position}
              end={connectedEvent.position}
              color="#FF6B00"
            />
          )
        }),
      )}

      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} minDistance={3} maxDistance={15} />
    </>
  )
}

export function LifeConstellation({ onClose }: { onClose: () => void }) {
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null)

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* 3D Canvas */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={75} />
        <Suspense fallback={null}>
          <ConstellationScene events={mockLifeEvents} onEventClick={setSelectedEvent} />
        </Suspense>
      </Canvas>

      {/* Header */}
      <div className="absolute top-8 left-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/60 backdrop-blur-md border border-[#FF6B00]/30 rounded-lg px-6 py-4"
        >
          <h1 className="text-2xl font-bold text-white mb-1">Life Constellation</h1>
          <p className="text-sm text-gray-400">Your journey mapped in the stars</p>
        </motion.div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-10 p-3 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Event details panel */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-32 right-8 z-10 w-80 bg-black/80 backdrop-blur-xl border border-[#FF6B00]/30 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-2">{selectedEvent.title}</h3>
          <p className="text-sm text-gray-400 mb-4">{selectedEvent.date}</p>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-[#FF6B00]/20 border border-[#FF6B00]/30 rounded-full text-xs text-[#FF6B00] font-medium">
              {selectedEvent.category}
            </span>
          </div>
          <p className="text-sm text-gray-300">
            This event is connected to {selectedEvent.connections.length} other life moments, showing how your decisions
            create ripple effects across domains.
          </p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="absolute bottom-8 left-8 z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3"
        >
          <p className="text-xs text-gray-400 mb-2">Categories:</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00D9FF]" />
              <span className="text-xs text-gray-300">Career</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FFD700]" />
              <span className="text-xs text-gray-300">Financial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span className="text-xs text-gray-300">Wellness</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#9333EA]" />
              <span className="text-xs text-gray-300">Personal</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
