"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import ActionCard from "./action-card"

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [showActionCard, setShowActionCard] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        role: "assistant",
        content:
          "Based on your current training load and energy levels, I recommend a recovery-focused session tomorrow. Let's plan a 30-minute easy run at zone 2 heart rate.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setShowActionCard(true)
    }, 1000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-[#0A0A0A] border-l border-[#222222] z-50 flex flex-col"
          >
            {/* Header with Memory Indicator */}
            <div className="p-6 border-b border-[#222222]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Apex AI</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-[#888888] hover:text-white">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              {/* Memory Indicator */}
              <div className="bg-[#111111] border border-[#FF6B00]/30 rounded-xl p-3">
                <p className="text-xs text-[#888888] uppercase tracking-wider mb-1">Context</p>
                <p className="text-sm text-[#E5E7EB]">
                  Referencing your Q4 business goals and last week's training volume (42km)
                </p>
              </div>
            </div>

            {/* Messages - Timeline Style */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-[#888888] mt-12">
                  <p className="text-lg mb-2">How can I help you today?</p>
                  <p className="text-sm">Ask me about your training, portfolio, or goals</p>
                </div>
              )}

              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.role === "user"
                        ? "bg-[#FF6B00] text-white"
                        : "bg-[#111111] border border-[#222222] text-[#E5E7EB]"
                    } rounded-2xl p-4`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {showActionCard && messages.length > 0 && (
                <ActionCard response={messages[messages.length - 1].content} onClose={() => setShowActionCard(false)} />
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-[#222222]">
              <div className="flex gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 bg-[#111111] border-[#222222] text-white placeholder:text-[#888888] resize-none min-h-[60px]"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-[#FF6B00] hover:bg-[#FF8533] text-white h-[60px] w-[60px] p-0"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
