"use client"

import { useState, useEffect, useRef } from "react"
import { useVault } from "@/lib/vault-context"
import { motion } from "framer-motion"
import type { Activity, StudioType } from "@/lib/types"
import { PlusIcon, SparklesIcon, MicIcon, ZapIcon } from "./icons"
import { Button } from "@/components/ui/button"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from "@react-three/drei"
import TemplateSelector from "./template-selector"
import { getTemplatesByCategory } from "@/lib/templates"
import { Sparkles } from "lucide-react"
import ApexWidget from "./apex-widget"

// Life Rhythm Orb - Central 3D element
function LifeRhythmOrb({ activeNodes }: { activeNodes: number }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere args={[1, 64, 64]}>
        <MeshDistortMaterial
          color={activeNodes > 0 ? "#10B981" : "#6366F1"}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  )
}

export default function ActivitiesContent() {
  const { activities, userProfile, updateState, symbiontFeed, applyTemplate } = useVault()
  const [isListening, setIsListening] = useState(false)
  const [voiceInput, setVoiceInput] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [selectedNode, setSelectedNode] = useState<Activity | null>(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Voice input setup
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setVoiceInput(transcript)
        handleVoiceCommand(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }
    }
  }, [])

  const startVoiceInput = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const handleVoiceCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase()

    // Quick-add activity via voice
    if (lowerCommand.includes("add") || lowerCommand.includes("create")) {
      const activityName = command.replace(/add|create/gi, "").trim()
      if (activityName) {
        await handleAddActivity(activityName, "general")
      }
    }

    // Customize background
    if (lowerCommand.includes("customize background")) {
      // Trigger background customization
      console.log("[v0] Customize background requested")
    }
  }

  const handleAddActivity = async (name: string, category: string) => {
    const studioMap: { [key: string]: StudioType } = {
      music: "music",
      art: "art",
      fitness: "fitness",
      coding: "coding",
      gaming: "gaming",
      reading: "reading",
      cooking: "cooking",
    }

    const newActivity: Activity = {
      id: Date.now().toString(),
      name,
      category,
      studioType: studioMap[category] || "nexus",
      createdAt: new Date().toISOString(),
      completedCount: 0,
    }

    updateState("activities", [...activities, newActivity])
  }

  const handleGetSuggestions = async () => {
    if (!userProfile?.hobbies || userProfile.hobbies.length === 0) {
      return
    }

    setLoadingSuggestions(true)
    try {
      const response = await fetch("/api/ai/activity-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hobbies: userProfile.hobbies,
          existingActivities: activities.map((a) => a.name),
        }),
      })
      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error("[v0] Failed to get suggestions:", error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleCompleteActivity = (activityId: string) => {
    const updatedActivities = activities.map((a) =>
      a.id === activityId ? { ...a, completedCount: a.completedCount + 1, lastCompleted: new Date().toISOString() } : a,
    )
    updateState("activities", updatedActivities)
  }

  const handleSelectTemplate = (template: any) => {
    // Implement template selection logic here
    console.log("Template selected:", template)
    applyTemplate(template)
    setShowTemplateSelector(false)
  }

  // Group activities by studio type
  const activityNodes = activities.reduce(
    (acc, activity) => {
      if (!acc[activity.studioType]) {
        acc[activity.studioType] = []
      }
      acc[activity.studioType].push(activity)
      return acc
    },
    {} as { [key: string]: Activity[] },
  )

  const hasActivities = activities.length > 0

  return (
    <div className="space-y-6 relative">
      {/* Neural background effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <ZapIcon className="w-8 h-8 text-emerald-400" /> Life Rhythm Hub
            </h1>
            <p className="text-apex-gray mt-1">Your neural activity network</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={startVoiceInput}
              disabled={isListening}
              variant={isListening ? "secondary" : "default"}
              className="flex items-center gap-2"
            >
              <MicIcon className="w-4 h-4" />
              {isListening ? "Listening..." : "Voice Command"}
            </Button>
            <Button onClick={handleGetSuggestions} disabled={loadingSuggestions} className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              {loadingSuggestions ? "Thinking..." : "AI Suggestions"}
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <ApexWidget widgetId="activities-daily-tasks" />
        </div>

        {/* Start with a Template */}
        {!hasActivities && (
          <>
            <div className="animate-fadeIn bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/30 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    Start with a Template
                  </h3>
                  <p className="text-apex-gray text-sm">
                    Choose from pre-made activity plans for fitness, music, or writing
                  </p>
                </div>
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-semibold rounded-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Browse Templates
                </button>
              </div>
            </div>

            <div className="bg-apex-dark rounded-lg p-8 mb-6 border border-gray-800">
              <div className="h-64 relative">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} intensity={1} />
                  <LifeRhythmOrb activeNodes={0} />
                  <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
                </Canvas>
              </div>
              <div className="text-center mt-4">
                <h3 className="text-xl font-semibold text-white mb-2">Your Nexus Awaits</h3>
                <p className="text-apex-gray">
                  Share your hobbies and goals to unlock personalized activity studios. Start by adding your first
                  activity or using voice commands.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Activity Nodes - Branch out from center */}
        {hasActivities && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {Object.entries(activityNodes).map(([studioType, nodeActivities]) => (
              <motion.div
                key={studioType}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-apex-dark rounded-lg p-6 border border-gray-800 hover:border-emerald-500/50 transition-all cursor-pointer relative overflow-hidden group"
                onClick={() => setSelectedNode(nodeActivities[0])}
              >
                {/* Energy flow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white capitalize">{studioType} Studio</h3>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-emerald-400 text-sm font-bold">{nodeActivities.length}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {nodeActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-2 bg-apex-darker rounded-md hover:bg-gray-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCompleteActivity(activity.id)
                        }}
                      >
                        <span className="text-sm text-apex-light">{activity.name}</span>
                        <span className="text-xs text-apex-gray">{activity.completedCount}x</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Particle trail effect */}
                <motion.div
                  className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-emerald-400"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-apex-dark rounded-lg p-6 border border-emerald-500/30 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-emerald-400" />
              AI-Suggested Activities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-apex-darker rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => handleAddActivity(suggestion.name, suggestion.category)}
                >
                  <h4 className="font-semibold text-white mb-1">{suggestion.name}</h4>
                  <p className="text-xs text-apex-gray mb-2">{suggestion.description}</p>
                  <span className="text-xs text-emerald-400 capitalize">{suggestion.category}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Add */}
        <div className="bg-apex-dark rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Add Activity</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Activity name..."
              className="flex-grow bg-apex-darker border border-gray-700 rounded-md p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-white"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value) {
                  handleAddActivity(e.currentTarget.value, "general")
                  e.currentTarget.value = ""
                }
              }}
            />
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <PlusIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {showTemplateSelector && (
        <TemplateSelector
          templates={[
            ...getTemplatesByCategory("fitness"),
            ...getTemplatesByCategory("music"),
            ...getTemplatesByCategory("writing"),
          ]}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  )
}
