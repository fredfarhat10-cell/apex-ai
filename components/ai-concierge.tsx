"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Send, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [currentSection, setCurrentSection] = useState("hero")
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([])

  // Detect current visible section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "guilds", "echo", "privacy", "pricing"]
      const scrollPosition = window.scrollY + window.innerHeight / 2

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setCurrentSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSendMessage = () => {
    if (!message.trim()) return

    setMessages((prev) => [...prev, { role: "user", content: message }])

    // Contextual AI response based on current section
    const responses: Record<string, string> = {
      hero: "I see you're interested in Apex AI! It's a revolutionary AI Symbiont that runs entirely on your device with zero-knowledge encryption. What would you like to know more about?",
      guilds:
        "The Guilds are specialized AI environments for different aspects of your life - Financial, Career, Travel, and Wellness. Each one is designed to help you master that domain. Which guild interests you most?",
      echo: "Project Echo is our groundbreaking life simulation feature. It lets you simulate major decisions before you make them, showing you probable outcomes. Would you like to see a demo?",
      privacy:
        "Privacy is our foundation. Apex uses AES-256 encryption, runs 100% locally on your device, and we have zero access to your data. It's mathematically impossible for us to see your information. Any specific security questions?",
      pricing:
        "We offer three tiers: Nexus (Free trial), Synergy ($49/month with full features), and Apex (Enterprise). The free trial gives you 14 days of full access. Ready to start?",
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: responses[currentSection] || "How can I help you learn more about Apex AI?",
        },
      ])
    }, 500)

    setMessage("")
  }

  return (
    <>
      {/* Floating Orb Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00ffff] to-[#0099ff] hover:from-[#00ccff] hover:to-[#0077cc] apex-glow-strong transition-all duration-300 shadow-2xl"
            >
              <Sparkles className="w-6 h-6 text-[#001f3f]" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 w-96"
          >
            <Card className="glass-effect border-2 border-[#00ffff]/30 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#00ffff] to-[#0099ff] p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#001f3f]" />
                  <h3 className="font-bold text-[#001f3f]">AI Concierge</h3>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-[#001f3f] hover:bg-[#001f3f]/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4 bg-[#001f3f]/50">
                {messages.length === 0 && (
                  <div className="text-center text-[#66d9ef] py-8">
                    <p className="mb-2">👋 Hi! I'm your AI Concierge.</p>
                    <p className="text-sm">
                      I see you're viewing the <span className="text-[#00ffff] font-bold">{currentSection}</span>{" "}
                      section. How can I help?
                    </p>
                  </div>
                )}
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl ${
                        msg.role === "user"
                          ? "bg-[#00ffff] text-[#001f3f]"
                          : "bg-[#002b54] text-[#66d9ef] border border-[#00ffff]/20"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[#00ffff]/20 bg-[#001f3f]/80">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask me anything..."
                    className="bg-[#002b54] border-[#00ffff]/30 text-white placeholder:text-[#66d9ef]"
                  />
                  <Button onClick={handleSendMessage} className="bg-[#00ffff] hover:bg-[#00ccff] text-[#001f3f]">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
