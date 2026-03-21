"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useVault } from "@/lib/vault-context"
import { Send, Bot, X, Mic, MicOff } from "lucide-react"
import { userContextManager } from "@/lib/user-context-manager"
import { generatePersonalizedGreeting, buildApexSystemPrompt } from "@/lib/apex-personality"
import type { ConversationMemory } from "@/lib/types/user-context"

interface Message {
  sender: "user" | "ai"
  text: string
}

const GlobalChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const { userProfile, expenses, habits, knowledgeItems } = useVault()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = "en-US"

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognitionInstance.onerror = () => {
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert("Voice input is not supported in your browser. Please use Chrome or Edge.")
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const speakResponse = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const profile = userContextManager.getUserProfile()
      const greeting = generatePersonalizedGreeting(profile?.name || userProfile?.name)

      setMessages([
        {
          sender: "ai",
          text: greeting,
        },
      ])
    }
  }, [isOpen, userProfile?.name, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { sender: "user", text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const systemPrompt = buildApexSystemPrompt(userProfile)
      const userContext = userContextManager.getRelevantContext(input)

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          systemPrompt,
          userContext,
        }),
      })

      const data = await res.json()
      const aiMessage: Message = { sender: "ai", text: data.text || "I'm not sure how to respond to that." }
      setMessages((prev) => [...prev, aiMessage])

      const conversation: ConversationMemory = {
        id: `conv_${Date.now()}`,
        timestamp: new Date(),
        userMessage: input,
        assistantResponse: aiMessage.text,
        context: [userContext],
        extractedInfo: {
          entities: [],
          topics: [],
          actionItems: [],
          preferences: {},
          facts: [],
        },
        sentiment: "neutral",
      }
      userContextManager.saveConversation(conversation)

      speakResponse(aiMessage.text)
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMessage: Message = { sender: "ai", text: "Sorry, I encountered an error. Please try again." }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {isOpen ? (
        <div className="w-96 h-[500px] bg-apex-darker border border-gray-700 rounded-lg shadow-2xl flex flex-col animate-fadeIn">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-apex-light">Apex Chat</h3>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                Local Only
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-apex-gray hover:text-apex-light transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-2 ${msg.sender === "user" ? "justify-end" : ""}`}>
                {msg.sender === "ai" && <Bot className="text-apex-primary w-5 h-5 mt-1 flex-shrink-0" />}
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${msg.sender === "user" ? "bg-apex-primary text-white" : "bg-apex-dark text-apex-light"}`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2">
                <Bot className="text-apex-primary w-5 h-5 mt-1" />
                <div className="bg-apex-dark p-3 rounded-lg">
                  <p className="text-sm text-apex-gray">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-grow bg-apex-dark border border-gray-600 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-apex-primary text-white"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2 rounded-md transition-all ${isListening ? "bg-red-500 animate-pulse" : "bg-apex-dark hover:bg-gray-700"}`}
              disabled={isLoading}
              title="Voice input"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button
              type="submit"
              className="bg-apex-primary p-2 rounded-md hover:bg-opacity-80 disabled:bg-opacity-50 transition-all"
              disabled={isLoading}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-apex-primary text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
        >
          <Bot size={24} />
        </button>
      )}
    </div>
  )
}

export default GlobalChat
