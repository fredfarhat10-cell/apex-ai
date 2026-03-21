"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface OnboardingData {
  name: string
  goal: string
  tone: string
}

interface SimpleOnboardingProps {
  onComplete: (data: OnboardingData) => void
}

export default function SimpleOnboarding({ onComplete }: SimpleOnboardingProps) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [goal, setGoal] = useState("")
  const [tone, setTone] = useState("")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Array<{ type: "apex" | "user"; text: string }>>([])
  const [isTyping, setIsTyping] = useState(false)

  const apexMessages = [
    "Hi, I'm Apex — what's your first name?",
    `Nice to meet you, ${name}! What are you mainly hoping to do with me?`,
    "How would you like me to talk to you?",
    `Perfect, ${name} — I've set everything up for you. Let's begin!`,
  ]

  const goalOptions = ["Learn", "Build", "Organize", "Brainstorm"]
  const toneOptions = ["Friendly", "Professional", "Playful"]

  useEffect(() => {
    // Show first message with typing effect
    if (step === 0) {
      typeMessage(apexMessages[0])
    }
  }, [])

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
    }, 30)
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userName = input.trim()
    setName(userName)
    setMessages((prev) => [...prev, { type: "user", text: userName }])
    setInput("")
    setStep(1)

    setTimeout(() => {
      typeMessage(`Nice to meet you, ${userName}! What are you mainly hoping to do with me?`)
    }, 500)
  }

  const handleGoalSelect = (selectedGoal: string) => {
    setGoal(selectedGoal)
    setMessages((prev) => [...prev, { type: "user", text: selectedGoal }])
    setStep(2)

    setTimeout(() => {
      typeMessage("How would you like me to talk to you?")
    }, 500)
  }

  const handleToneSelect = (selectedTone: string) => {
    setTone(selectedTone)
    setMessages((prev) => [...prev, { type: "user", text: selectedTone }])
    setStep(3)

    setTimeout(() => {
      typeMessage(`Perfect, ${name} — I've set everything up for you. Let's begin!`)
      setTimeout(() => {
        const data: OnboardingData = { name, goal, tone: selectedTone }
        localStorage.setItem("apex_user_profile", JSON.stringify(data))
        localStorage.setItem("apex_conversation_history", JSON.stringify([]))
        localStorage.setItem("apex_memory", JSON.stringify([]))
        onComplete(data)
      }, 2000)
    }, 500)
  }

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
      `}</style>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-3xl shadow-lg">
            🧠
          </div>
          <h1 className="text-2xl font-bold text-white">Apex Assistant</h1>
        </div>

        {/* Chat Area */}
        <div className="p-6 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} fade-in`}>
              {msg.type === "apex" && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm mr-2 flex-shrink-0">
                  🧠
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.type === "apex"
                    ? "bg-white text-gray-800 shadow-md"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                }`}
              >
                <p className="text-base leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-200">
          {step === 0 && !isTyping && (
            <form onSubmit={handleNameSubmit} className="fade-in">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your name..."
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-gray-800"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </form>
          )}

          {step === 1 && !isTyping && (
            <div className="grid grid-cols-2 gap-3 fade-in">
              {goalOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleGoalSelect(option)}
                  className="px-4 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-800 font-medium"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {step === 2 && !isTyping && (
            <div className="grid grid-cols-3 gap-3 fade-in">
              {toneOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleToneSelect(option)}
                  className="px-4 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-gray-800 font-medium"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="text-center text-gray-500 fade-in">
              <div className="inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
