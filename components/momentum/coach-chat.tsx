"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowUp,
  Calendar,
  Moon,
  Zap,
  Settings,
  Sparkles,
} from "lucide-react"
import {
  useMomentumStore,
  type CoachingVoice,
  type ChatMessage,
} from "@/lib/momentum-store"

// ── Coaching voice labels & order ──

const voiceLabels: Record<CoachingVoice, string> = {
  "drill-sergeant": "Drill Sergeant",
  coach: "Balanced Coach",
  "data-nerd": "Data Nerd",
  friend: "Supportive Friend",
  silent: "Silent Mode",
}

const voiceOrder: CoachingVoice[] = [
  "coach",
  "drill-sergeant",
  "data-nerd",
  "friend",
  "silent",
]

// ── Quick actions ──

const quickActions = [
  { label: "Reschedule today", icon: Calendar, keyword: "reschedule" },
  { label: "I'm tired", icon: Moon, keyword: "tired" },
  { label: "Motivate me", icon: Zap, keyword: "motivate" },
  { label: "Adjust my plan", icon: Settings, keyword: "adjust" },
]

// ── Coach response logic ──

function generateCoachResponse(
  message: string,
  voice: CoachingVoice
): string {
  const lower = message.toLowerCase()

  if (lower.includes("tired") || lower.includes("exhausted")) {
    return "Heard. Let\u2019s do the minimum viable version \u2014 5 minutes instead of 30. Same habit, less friction. Ready when you are. \uD83D\uDCAA"
  }

  if (lower.includes("motivate")) {
    const motivations: Record<CoachingVoice, string> = {
      "drill-sergeant":
        "You didn\u2019t come this far to only come this far. Get up, show up, and outwork yesterday. No excuses.",
      coach:
        "You\u2019re building something real here. 12-day streak, consistency above 85% \u2014 that\u2019s not luck, that\u2019s you showing up. Keep going.",
      "data-nerd":
        "Fun fact: your completion rate is 87%. That puts you in the top 15% of users. Statistically, you\u2019re crushing it.",
      friend:
        "Hey, I see you. You\u2019re doing better than you think. Every single day you show up matters, even the hard ones. I\u2019m proud of you.",
      silent: "\uD83D\uDCAA\uD83D\uDD25",
    }
    return motivations[voice]
  }

  if (lower.includes("reschedule")) {
    return "No problem. I\u2019ve moved your remaining habits to your evening window. You\u2019ve got this."
  }

  if (lower.includes("adjust") || lower.includes("plan")) {
    return "Looking at your patterns\u2026 your best days are mornings. Want me to shift everything earlier?"
  }

  return "I\u2019m here for you. Tell me what you need \u2014 adjustments, motivation, or just someone to listen."
}

// ── Timestamp formatting ──

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ── Animation variants ──

const messageListVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
}

const messageVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
}

// ── Component ──

export default function CoachChat() {
  const {
    chatMessages,
    addChatMessage,
    user,
    updateCoachingVoice,
  } = useMomentumStore()

  const [inputValue, setInputValue] = useState("")
  const [isCoachTyping, setIsCoachTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const coachingVoice: CoachingVoice = user?.coachingVoice ?? "coach"

  // Auto-scroll on new messages or typing indicator
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages, isCoachTyping])

  // Cycle coaching voice
  function cycleVoice() {
    const currentIdx = voiceOrder.indexOf(coachingVoice)
    const nextVoice = voiceOrder[(currentIdx + 1) % voiceOrder.length]
    updateCoachingVoice(nextVoice)
  }

  // Send a message and queue a coach reply
  function sendMessage(content: string) {
    if (!content.trim()) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }

    addChatMessage(userMsg)
    setInputValue("")
    setIsCoachTyping(true)

    setTimeout(() => {
      const coachMsg: ChatMessage = {
        id: `c-${Date.now()}`,
        role: "coach",
        content: generateCoachResponse(content, coachingVoice),
        timestamp: new Date().toISOString(),
      }
      addChatMessage(coachMsg)
      setIsCoachTyping(false)
    }, 1000)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(inputValue)
  }

  function handleQuickAction(keyword: string, label: string) {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: label,
      timestamp: new Date().toISOString(),
      quickAction: keyword,
    }

    addChatMessage(userMsg)
    setIsCoachTyping(true)

    setTimeout(() => {
      const coachMsg: ChatMessage = {
        id: `c-${Date.now()}`,
        role: "coach",
        content: generateCoachResponse(keyword, coachingVoice),
        timestamp: new Date().toISOString(),
      }
      addChatMessage(coachMsg)
      setIsCoachTyping(false)
    }, 1000)
  }

  return (
    <div
      className="flex flex-col h-full max-w-md mx-auto"
      style={{ backgroundColor: "#0B1120" }}
    >
      {/* ── Top Bar ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{
          backgroundColor: "#131C2E",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={cycleVoice}
          className="flex items-center gap-3 flex-1 min-w-0"
          aria-label="Cycle coaching voice"
        >
          {/* Coach avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          <div className="min-w-0">
            <p
              className="text-sm font-semibold leading-tight"
              style={{ color: "#F1F5F9" }}
            >
              Coach Mode
            </p>
            <p className="text-xs truncate" style={{ color: "#64748B" }}>
              {voiceLabels[coachingVoice]}
            </p>
          </div>
        </button>

        <div
          className="text-[10px] font-medium rounded-full px-2 py-0.5"
          style={{
            backgroundColor: "rgba(59,130,246,0.15)",
            color: "#3B82F6",
          }}
        >
          Tap to switch
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ scrollBehavior: "smooth" }}
      >
        <motion.div
          variants={messageListVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              variants={messageVariants}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user" ? "rounded-br-md" : "rounded-bl-md"
                }`}
                style={
                  msg.role === "user"
                    ? { backgroundColor: "#1E3A5F", color: "#FFFFFF" }
                    : {
                        backgroundColor: "#1A2332",
                        color: "#FFFFFF",
                        borderLeft: "3px solid #22C55E",
                      }
                }
              >
                {msg.content}
              </div>
              <p
                className="text-[10px] mt-1 px-1"
                style={{ color: "#64748B" }}
              >
                {formatTimestamp(msg.timestamp)}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Typing indicator */}
        <AnimatePresence>
          {isCoachTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-start"
            >
              <div
                className="rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5"
                style={{
                  backgroundColor: "#1A2332",
                  borderLeft: "3px solid #22C55E",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "#64748B",
                    animationDelay: "0ms",
                  }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "#64748B",
                    animationDelay: "150ms",
                  }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "#64748B",
                    animationDelay: "300ms",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Quick Actions ── */}
      <div
        className="px-4 py-2 overflow-x-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="flex gap-2 w-max">
          {quickActions.map((action) => (
            <button
              key={action.keyword}
              onClick={() => handleQuickAction(action.keyword, action.label)}
              disabled={isCoachTyping}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap border transition-colors hover:border-white/20 disabled:opacity-50"
              style={{
                backgroundColor: "#131C2E",
                borderColor: "rgba(255,255,255,0.08)",
                color: "#F1F5F9",
              }}
            >
              <action.icon className="w-3.5 h-3.5" style={{ color: "#64748B" }} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input Area ── */}
      <div
        className="px-4 py-3 border-t"
        style={{
          backgroundColor: "#131C2E",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Message your coach..."
            disabled={isCoachTyping}
            className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-[#4A5568] disabled:opacity-60"
            style={{
              backgroundColor: "#0B1120",
              color: "#F1F5F9",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isCoachTyping}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-30"
            style={{ backgroundColor: "#3B82F6" }}
            aria-label="Send message"
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  )
}
