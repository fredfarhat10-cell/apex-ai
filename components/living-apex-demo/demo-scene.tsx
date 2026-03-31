"use client"

import { useState, useEffect, useCallback } from "react"
import { ChatPanel, type ChatMessage } from "./chat-panel"
import { Orb3D } from "./orb-3d"
import { BackgroundFX } from "./background-fx"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Volume2, VolumeX, X } from "lucide-react"
import { typeText, wait, clamp, randomJitter } from "@/lib/typewriter"
import { getScenario, type DemoMessage } from "@/lib/demo-data"

interface DemoSceneProps {
  scenarioId: string
  onBack: () => void
  onComplete: () => void
}

export function DemoScene({ scenarioId, onBack, onComplete }: DemoSceneProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [orbState, setOrbState] = useState<"idle" | "thinking" | "replying">("idle")
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  const scenario = getScenario(scenarioId)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onBack()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onBack])

  const playMessageFlow = useCallback(
    async (demoMessages: DemoMessage[], startIndex = 0) => {
      for (let i = startIndex; i < demoMessages.length; i++) {
        const msg = demoMessages[i]

        if (msg.role === "apex") {
          // Show thinking state
          setIsTyping(true)
          setOrbState("thinking")

          const thinkTime = clamp((msg.thinkTime || 300) + msg.text.length * 8 + randomJitter(), 300, 1400)
          await wait(thinkTime)

          // Type the message
          setIsTyping(false)
          setOrbState("replying")

          const messageId = `apex-${Date.now()}`

          await new Promise<void>((resolve) => {
            typeText(
              (text) => {
                setMessages((prev) => {
                  const existing = prev.find((m) => m.id === messageId)
                  if (existing) {
                    return prev.map((m) => (m.id === messageId ? { ...m, text } : m))
                  }
                  return [...prev, { id: messageId, role: "apex", text }]
                })
              },
              msg.text,
              {
                avg: 28,
                jitter: 8,
                onComplete: () => {
                  setOrbState("idle")
                  resolve()
                },
              },
            )
          })

          // Show quick replies if available
          if (msg.replies && msg.replies.length > 0) {
            await wait(350)
            setQuickReplies(msg.replies)
            return // Wait for user interaction
          }

          await wait(350 + Math.random() * 350)
        } else {
          // User message - instant
          const messageId = `user-${Date.now()}`
          setMessages((prev) => [...prev, { id: messageId, role: "user", text: msg.text }])
          await wait(600)
        }
      }

      // Demo complete
      await wait(1000)
      onComplete()
    },
    [onComplete],
  )

  useEffect(() => {
    if (!scenario) return

    // Start with initial messages
    playMessageFlow(scenario.messages)
  }, [scenario, playMessageFlow])

  const handleQuickReply = useCallback(
    async (reply: string) => {
      if (!scenario) return

      // Add user's choice as a message
      const userMessageId = `user-${Date.now()}`
      setMessages((prev) => [...prev, { id: userMessageId, role: "user", text: reply }])
      setQuickReplies([])
      setSelectedVariant(reply)

      await wait(600)

      // Get variant messages
      const variantMessages = scenario.variants[reply]
      if (variantMessages) {
        await playMessageFlow(variantMessages)
      }
    },
    [scenario, playMessageFlow],
  )

  if (!scenario) {
    return (
      <div className="min-h-screen bg-apex-darker flex items-center justify-center">
        <p className="text-apex-gray">Scenario not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-apex-darker relative overflow-hidden">
      {/* Background effects */}
      <BackgroundFX scenario={scenario.bgTheme} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="p-6 flex items-center justify-between animate-fadeIn" style={{ animationDuration: "600ms" }}>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onBack} className="text-apex-gray hover:text-apex-primary">
              <ArrowLeft className="mr-2" size={20} />
              Back
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/"
                }
              }}
              className="text-apex-gray hover:text-apex-primary"
              aria-label="Exit demo"
            >
              <X size={20} />
            </Button>
            <span className="text-xs text-apex-gray/60 ml-2">Press ESC to go back</span>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-apex-primary">{scenario.title}</h2>
            <p className="text-sm text-apex-gray">{scenario.subtitle}</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-apex-gray hover:text-apex-primary"
            aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </Button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 p-6">
          {/* Orb */}
          <div className="flex-shrink-0 animate-fadeIn delay-300" style={{ animationDuration: "750ms" }}>
            <Orb3D state={orbState} scenario={scenario.bgTheme} />
          </div>

          {/* Chat */}
          <div className="flex-1 w-full animate-fadeIn delay-600" style={{ animationDuration: "600ms" }}>
            <ChatPanel
              messages={messages}
              isTyping={isTyping}
              quickReplies={quickReplies}
              onQuickReply={handleQuickReply}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
