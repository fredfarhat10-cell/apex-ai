"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Send, Sparkles } from "lucide-react"
import ActionCard from "./action-card"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  context?: string
}

interface ChatInterfaceProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showActionCard, setShowActionCard] = useState(false)
  const [lastResponse, setLastResponse] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Based on your recent training data and portfolio performance, I recommend adjusting your weekly mileage to 45km and rebalancing your tech holdings.",
        timestamp: new Date(),
        context: "Referencing your last run (Tue) and recent portfolio performance...",
      }
      setMessages((prev) => [...prev, aiResponse])
      setLastResponse(aiResponse.content)
      setIsLoading(false)
      setShowActionCard(true)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl h-[80vh] flex flex-col"
      >
        <Card className="bg-[#0A0A0A] border-[#222222] flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#222222]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6E56CF] to-[#00FFC6] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Apex AI</h2>
                <p className="text-xs text-[#888888]">Your intelligent assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[#888888] hover:text-white hover:bg-[#111111]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Memory Indicator */}
          {messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
            <div className="px-4 py-2 bg-[#111111] border-b border-[#222222]">
              <p className="text-xs text-[#888888] italic">
                {messages[messages.length - 1].context || "Analyzing your recent activity..."}
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6E56CF] to-[#00FFC6] flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">How can I help you today?</h3>
                  <p className="text-sm text-[#888888]">Ask me anything about your training or portfolio</p>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={message.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-[#6E56CF] to-[#00FFC6] text-white"
                        : "bg-[#111111] text-[#E5E7EB]"
                    } rounded-2xl px-4 py-3`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>

                {/* Show ActionCard after assistant's last message */}
                {message.role === "assistant" && index === messages.length - 1 && showActionCard && (
                  <div className="mt-4">
                    <ActionCard response={message.content} onClose={() => setShowActionCard(false)} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-[#111111] rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-[#6E56CF] rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-[#6E56CF] rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-[#6E56CF] rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#222222]">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-[#111111] border-[#222222] text-white placeholder:text-[#888888] resize-none min-h-[60px] max-h-[120px]"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-br from-[#6E56CF] to-[#00FFC6] hover:opacity-90 text-white px-6"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
