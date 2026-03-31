"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

interface OnboardingData {
  name: string
  goal: string
  tone: string
}

interface SimpleChatProps {
  userData: OnboardingData
}

interface Message {
  type: "apex" | "user"
  text: string
}

export default function SimpleChat({ userData }: SimpleChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [memoryFacts, setMemoryFacts] = useState<string[]>([])
  const recognitionRef = useRef<any>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedHistory = localStorage.getItem("apex_conversation_history")
    const savedMemory = localStorage.getItem("apex_memory")

    if (savedHistory) {
      const history = JSON.parse(savedHistory)
      setMessages(history)
    }

    if (savedMemory) {
      const memory = JSON.parse(savedMemory)
      setMemoryFacts(memory)
    }

    const greeting = getGreetingWithMemory(userData.tone, userData.name, savedMemory ? JSON.parse(savedMemory) : [])
    setTimeout(() => {
      typeMessage(greeting)
    }, 500)

    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
          // Auto-send after transcription
          setTimeout(() => {
            handleSendMessage(transcript)
          }, 100)
        }

        recognitionRef.current.onerror = () => {
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("apex_conversation_history", JSON.stringify(messages))
    }
  }, [messages])

  const getGreetingWithMemory = (tone: string, name: string, memory: string[]) => {
    const hasPastFacts = memory.length > 0
    const lastFact = hasPastFacts ? memory[memory.length - 1] : null

    switch (tone.toLowerCase()) {
      case "friendly":
        return hasPastFacts
          ? `Hey ${name}! Great to see you again. Last time you mentioned ${lastFact} — ready to continue where we left off?`
          : `Hey there, ${name}! What would you like to work on today?`
      case "professional":
        return hasPastFacts
          ? `Welcome back, ${name}. I recall you mentioned ${lastFact}. How may I assist you today?`
          : `Welcome back, ${name}. How may I assist you today?`
      case "playful":
        return hasPastFacts
          ? `Yo ${name}! Back for more? I remember you said ${lastFact}. Let's make magic!`
          : `Yo ${name}! Ready to crush some goals today?`
      default:
        return hasPastFacts
          ? `Welcome back, ${name}! Last time you mentioned ${lastFact}. What would you like to work on today?`
          : `Welcome back, ${name}! What would you like to work on today?`
    }
  }

  const detectAndSaveMemory = (userMessage: string) => {
    const lowerMsg = userMessage.toLowerCase()
    const memoryTriggers = [
      { pattern: /i work (in|as|at) (.+)/i, extract: (match: RegExpMatchArray) => `works ${match[1]} ${match[2]}` },
      { pattern: /my goal is (.+)/i, extract: (match: RegExpMatchArray) => `goal: ${match[1]}` },
      { pattern: /i (like|love|enjoy) (.+)/i, extract: (match: RegExpMatchArray) => `${match[1]}s ${match[2]}` },
      { pattern: /i'm (a|an) (.+)/i, extract: (match: RegExpMatchArray) => `is ${match[1]} ${match[2]}` },
      { pattern: /i live in (.+)/i, extract: (match: RegExpMatchArray) => `lives in ${match[1]}` },
    ]

    for (const trigger of memoryTriggers) {
      const match = userMessage.match(trigger.pattern)
      if (match) {
        const fact = trigger.extract(match)
        const updatedMemory = [...memoryFacts, fact]
        setMemoryFacts(updatedMemory)
        localStorage.setItem("apex_memory", JSON.stringify(updatedMemory))
        break
      }
    }
  }

  const getResponse = (userMessage: string, tone: string) => {
    const lowerMsg = userMessage.toLowerCase()

    // Simple response logic based on tone
    if (lowerMsg.includes("help") || lowerMsg.includes("what can you do")) {
      switch (tone.toLowerCase()) {
        case "friendly":
          return "I'm here to help you with anything! I can help you organize tasks, brainstorm ideas, learn new things, or just chat. What sounds good?"
        case "professional":
          return "I can assist you with task management, information retrieval, strategic planning, and productivity optimization. Please specify your requirements."
        case "playful":
          return "Oh, I can do SO much! Organize your life, help you learn cool stuff, brainstorm wild ideas... you name it! What's your vibe today?"
        default:
          return "I can help you with organizing, learning, building projects, and brainstorming. What would you like to focus on?"
      }
    }

    if (lowerMsg.includes("thank")) {
      switch (tone.toLowerCase()) {
        case "friendly":
          return "You're so welcome! Happy to help anytime!"
        case "professional":
          return "You're welcome. I'm here whenever you need assistance."
        case "playful":
          return "No prob! That's what I'm here for!"
        default:
          return "You're welcome!"
      }
    }

    // Default responses based on tone
    switch (tone.toLowerCase()) {
      case "friendly":
        return "That's interesting! I'm here to help you with that. Could you tell me more about what you need?"
      case "professional":
        return "I understand. Could you provide more details so I can assist you effectively?"
      case "playful":
        return "Ooh, I like where this is going! Tell me more!"
      default:
        return "I'm here to help. What would you like to know more about?"
    }
  }

  const typeMessage = (message: string) => {
    setIsTyping(true)
    let index = 0
    const tempMsg = { type: "apex" as const, text: "" }
    setMessages((prev) => [...prev, tempMsg])

    const interval = setInterval(() => {
      if (index < message.length) {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { type: "apex", text: message.slice(0, index + 1) }
          return updated
        })
        index++
      } else {
        clearInterval(interval)
        setIsTyping(false)
      }
    }, 20)
  }

  const handleSendMessage = (messageText: string) => {
    if (!messageText.trim() || isTyping) return

    const userMessage = messageText.trim()
    setMessages((prev) => [...prev, { type: "user", text: userMessage }])
    setInput("")

    detectAndSaveMemory(userMessage)

    setTimeout(() => {
      const response = getResponse(userMessage, userData.tone)
      typeMessage(response)
    }, 500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(input)
  }

  const handleVoiceInput = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const handleClearMemory = () => {
    if (
      confirm(
        "Are you sure you want to clear all memory and restart? This will erase your conversation history and learned facts.",
      )
    ) {
      localStorage.removeItem("apex_user_profile")
      localStorage.removeItem("apex_conversation_history")
      localStorage.removeItem("apex_memory")
      window.location.reload()
    }
  }

  const hasSpeechRecognition =
    typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .pulse-animation {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[700px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-lg">
                🧠
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Apex Assistant</h1>
                <p className="text-sm text-blue-100">Always here to help</p>
              </div>
            </div>
            <button
              onClick={handleClearMemory}
              className="text-white hover:text-blue-100 text-sm px-3 py-1 border border-white/30 rounded-lg hover:bg-white/10 transition-all"
            >
              Clear Memory
            </button>
          </div>
          {memoryFacts.length > 0 && (
            <div className="text-xs text-blue-100 bg-white/10 px-3 py-1 rounded-full inline-block">
              Memory active: Apex remembers your last {memoryFacts.length} insight{memoryFacts.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} fade-in`}>
              {msg.type === "apex" && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm mr-2 flex-shrink-0 mt-1">
                  🧠
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                  msg.type === "apex"
                    ? "bg-white text-gray-800 shadow-md"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                }`}
              >
                <p className="text-base leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start fade-in">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm mr-2 flex-shrink-0">
                🧠
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl shadow-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          {isListening && (
            <div className="mb-2 text-center text-sm text-blue-600 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full pulse-animation"></div>
              Listening...
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-gray-800"
              disabled={isTyping || isListening}
            />
            {hasSpeechRecognition && (
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  isListening ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                disabled={isTyping}
              >
                {isListening ? "🔴" : "🎤"}
              </button>
            )}
            <button
              type="submit"
              disabled={!input.trim() || isTyping || isListening}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
