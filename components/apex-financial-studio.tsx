"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface OnboardingData {
  name: string
  goal: string
  tone: string
}

interface Message {
  type: "apex" | "user"
  text: string
}

interface Memory {
  name: string
  goal: string
  tone: string
  facts: string[]
  emotions: string[]
  lastVisit: number
  lastMood?: string
  lastMarket?: string
}

interface PortfolioAsset {
  name: string
  value: number
  change: number
}

interface AdvisorReport {
  totalValue: number
  totalChange: number
  diversificationScore: string
  riskLevel: "Low" | "Moderate" | "High"
  summary: string
  recommendation: string
  timestamp: number
}

interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  timelineMonths: number
}

interface MarketData {
  timestamp: number
  globalIndex: number
  volatilityIndex: number
  sentiment: "bullish" | "bearish" | "neutral"
}

type Mood = "Confident" | "Calm" | "Cautious" | "Reassuring" | "Alert"

interface Settings {
  energyLevel: number
  adaptiveMode: boolean
}

type View = "dashboard" | "portfolio" | "insights" | "goals" | "settings"

function analyzePortfolio(portfolio: PortfolioAsset[]): AdvisorReport {
  const totalValue = portfolio.reduce((sum, asset) => sum + asset.value, 0)
  const weightedChange = portfolio.reduce((sum, asset) => sum + (asset.change * asset.value) / totalValue, 0)

  const diversificationScore =
    portfolio.length >= 5 ? "Excellent" : portfolio.length >= 3 ? "Good" : "Needs Improvement"

  let riskLevel: "Low" | "Moderate" | "High" = "Moderate"
  const volatileAssets = portfolio.filter((a) => Math.abs(a.change) > 2).length
  if (volatileAssets >= portfolio.length * 0.6) riskLevel = "High"
  else if (volatileAssets <= portfolio.length * 0.2) riskLevel = "Low"

  let summary = `Your portfolio is valued at £${totalValue.toLocaleString()} with a ${weightedChange >= 0 ? "+" : ""}${weightedChange.toFixed(2)}% daily change. `
  summary += `Diversification score: ${diversificationScore}. Overall risk level: ${riskLevel}.`

  let recommendation = ""
  if (weightedChange < -1) {
    recommendation =
      "Markets are showing some volatility. Consider rebalancing toward more stable assets like bonds or defensive stocks to reduce risk exposure."
  } else if (riskLevel === "High") {
    recommendation =
      "Your portfolio has high exposure to volatile assets. Consider diversifying into lower-risk investments to balance your risk profile."
  } else if (diversificationScore === "Needs Improvement") {
    recommendation =
      "Increasing diversification across different sectors and asset classes could help reduce overall portfolio risk."
  } else {
    recommendation =
      "Your portfolio looks well-balanced for long-term growth. Continue monitoring and rebalancing quarterly to maintain your target allocation."
  }

  return {
    totalValue,
    totalChange: weightedChange,
    diversificationScore,
    riskLevel,
    summary,
    recommendation,
    timestamp: Date.now(),
  }
}

function calculateForecast(currentAmount: number, timelineMonths: number): number {
  return currentAmount * Math.pow(1 + 0.005, timelineMonths)
}

export default function ApexFinancialStudio() {
  // Onboarding state
  const [isOnboarding, setIsOnboarding] = useState(true)
  const [showGetStarted, setShowGetStarted] = useState(true)
  const [showOrbIntro, setShowOrbIntro] = useState(false)
  const [introMessageIndex, setIntroMessageIndex] = useState(0)
  const [showConversation, setShowConversation] = useState(false)
  const [input, setInput] = useState("")
  const [onboardingMessages, setOnboardingMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)

  // Extracted user data from conversation
  const [extractedName, setExtractedName] = useState("")
  const [extractedInterest, setExtractedInterest] = useState("")
  const [extractedGoal, setExtractedGoal] = useState("")

  // User data
  const [memory, setMemory] = useState<Memory | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [isListening, setIsListening] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([])
  const [advisorReport, setAdvisorReport] = useState<AdvisorReport | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [goals, setGoals] = useState<Goal[]>([])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: "", targetAmount: "", currentAmount: "", timelineMonths: "" })

  const [marketData, setMarketData] = useState<MarketData>({
    timestamp: Date.now(),
    globalIndex: 0,
    volatilityIndex: 30,
    sentiment: "neutral",
  })
  const [mood, setMood] = useState<Mood>("Calm")
  const [microFeedback, setMicroFeedback] = useState<string>("")
  const [settings, setSettings] = useState<Settings>({
    energyLevel: 3,
    adaptiveMode: true,
  })

  // Intro step state management
  const [introStep, setIntroStep] = useState(0) // Added introStep state

  const recognitionRef = useRef<any>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedMarket = localStorage.getItem("apex_market")
    if (savedMarket) {
      setMarketData(JSON.parse(savedMarket))
    }

    const marketInterval = setInterval(() => {
      setMarketData((prev) => {
        const drift = (Math.random() - 0.5) * 4 // ±2% max
        const newIndex = Math.max(-5, Math.min(5, prev.globalIndex + drift))
        const newVolatility = Math.max(0, Math.min(100, prev.volatilityIndex + (Math.random() - 0.5) * 10))

        let newSentiment: "bullish" | "bearish" | "neutral" = "neutral"
        if (newIndex > 1) newSentiment = "bullish"
        else if (newIndex < -1) newSentiment = "bearish"

        const newMarket = {
          timestamp: Date.now(),
          globalIndex: newIndex,
          volatilityIndex: newVolatility,
          sentiment: newSentiment,
        }

        localStorage.setItem("apex_market", JSON.stringify(newMarket))
        return newMarket
      })
    }, 5000)

    return () => clearInterval(marketInterval)
  }, [])

  useEffect(() => {
    if (!settings.adaptiveMode) {
      setMood("Calm")
      return
    }

    const calculateMood = (): Mood => {
      let score = 0

      // Market sentiment weight (30%)
      if (marketData.sentiment === "bullish") score += 30
      else if (marketData.sentiment === "bearish") score -= 30

      // Portfolio performance weight (30%)
      if (advisorReport) {
        if (advisorReport.totalChange > 2) score += 30
        else if (advisorReport.totalChange < -2) score -= 30
        else if (advisorReport.totalChange > 0) score += 15
        else if (advisorReport.totalChange < 0) score -= 15
      }

      // User emotion weight (25%)
      if (memory?.emotions.length) {
        const lastEmotion = memory.emotions[memory.emotions.length - 1]
        if (lastEmotion === "excited" || lastEmotion === "goal-oriented") score += 25
        else if (lastEmotion === "worried" || lastEmotion === "uncertain") score -= 25
      }

      // Time of day weight (15%)
      const hour = new Date().getHours()
      if (hour >= 6 && hour < 12)
        score += 15 // Morning optimism
      else if (hour >= 22 || hour < 6) score -= 10 // Late night caution

      // Volatility penalty
      if (marketData.volatilityIndex > 60) score -= 20

      // Determine mood from score
      if (score > 40) return "Confident"
      if (score > 10) return "Calm"
      if (score > -10) return "Cautious"
      if (score > -40) return "Reassuring"
      return "Alert"
    }

    const newMood = calculateMood()
    if (newMood !== mood) {
      setMood(newMood)

      // Generate micro-feedback on mood change
      const feedbackMessages: Record<Mood, string[]> = {
        Confident: ["Momentum building — let's capture this opportunity.", "Markets are favorable — time to act."],
        Calm: ["Steady as always.", "Markets easing — space to breathe."],
        Cautious: ["Volatility rising — I'll stay vigilant.", "We may rebalance to limit downside."],
        Reassuring: ["You're doing the right thing staying consistent.", "Short-term noise — long-term focus."],
        Alert: ["Markets are volatile — let's safeguard your gains.", "Turbulence ahead — reviewing allocations."],
      }

      const messages = feedbackMessages[newMood]
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setMicroFeedback(randomMessage)

      // Clear micro-feedback after 5 seconds
      setTimeout(() => setMicroFeedback(""), 5000)

      // Save mood to memory
      if (memory) {
        const updatedMemory = { ...memory, lastMood: newMood, lastMarket: marketData.sentiment }
        setMemory(updatedMemory)
        localStorage.setItem(
          "apex_user_profile",
          JSON.stringify({
            name: updatedMemory.name,
            goal: updatedMemory.goal,
            tone: updatedMemory.tone,
            lastMood: updatedMemory.lastMood,
            lastMarket: updatedMemory.lastMarket,
          }),
        )
      }
    }
  }, [marketData, advisorReport, memory, settings.adaptiveMode, mood]) // Fixed dependency array to include full memory object

  useEffect(() => {
    const savedSettings = localStorage.getItem("apex_settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  useEffect(() => {
    const savedPortfolio = localStorage.getItem("apex_portfolio")
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio))
    } else {
      const defaultPortfolio: PortfolioAsset[] = [
        { name: "Global Equity ETF", value: 32000, change: 1.8 },
        { name: "UK Bonds", value: 15000, change: 0.3 },
        { name: "Tech Growth Fund", value: 9000, change: -2.1 },
        { name: "Emerging Markets", value: 6500, change: 2.4 },
        { name: "Real Estate Fund", value: 4000, change: 0.7 },
      ]
      setPortfolio(defaultPortfolio)
      localStorage.setItem("apex_portfolio", JSON.stringify(defaultPortfolio))
    }

    const savedReport = localStorage.getItem("apex_advisor_report")
    if (savedReport) {
      setAdvisorReport(JSON.parse(savedReport))
    }

    const savedGoals = localStorage.getItem("apex_goals")
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    } else {
      const defaultGoals: Goal[] = [
        { id: "1", title: "New Home Fund", targetAmount: 50000, currentAmount: 20000, timelineMonths: 24 },
        { id: "2", title: "Retirement Savings", targetAmount: 500000, currentAmount: 150000, timelineMonths: 120 },
      ]
      setGoals(defaultGoals)
      localStorage.setItem("apex_goals", JSON.JSON.stringify(defaultGoals))
    }
  }, [])

  useEffect(() => {
    const savedProfile = localStorage.getItem("apex_user_profile")
    const onboardingComplete = localStorage.getItem("onboardingComplete")

    if (savedProfile && onboardingComplete) {
      const profile = JSON.parse(savedProfile)
      const savedMemory = localStorage.getItem("apex_memory")
      const savedEmotions = localStorage.getItem("apex_emotions")
      const savedHistory = localStorage.getItem("apex_conversation_history")

      const mem: Memory = {
        name: profile.name,
        goal: profile.goal,
        tone: profile.tone || "Friendly",
        facts: savedMemory ? JSON.parse(savedMemory) : [],
        emotions: savedEmotions ? JSON.parse(savedEmotions) : [],
        lastVisit: Date.now(),
        lastMood: profile.lastMood,
        lastMarket: profile.lastMarket,
      }

      setMemory(mem)
      setIsOnboarding(false)

      if (savedHistory) {
        setMessages(JSON.parse(savedHistory))
      } else {
        setTimeout(() => {
          typeMessage(getWelcomeBackMessage(mem), setMessages)
        }, 500)
      }
    }
  }, [])

  useEffect(() => {
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
          setTimeout(() => handleSendMessage(transcript), 100)
        }

        recognitionRef.current.onerror = () => setIsListening(false)
        recognitionRef.current.onend = () => setIsListening(false)
      }
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, onboardingMessages])

  useEffect(() => {
    if (messages.length > 0 && memory) {
      localStorage.setItem("apex_conversation_history", JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem("apex_goals", JSON.stringify(goals))
    }
  }, [goals])

  const typeMessage = (message: string, setMessagesFn: React.Dispatch<React.SetStateAction<Message[]>>) => {
    setIsTyping(true)
    let index = 0
    const tempMsg = { type: "apex" as const, text: "" }
    setMessagesFn((prev) => [...prev, tempMsg])

    const interval = setInterval(() => {
      if (index < message.length) {
        setMessagesFn((prev) => {
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

  const getWelcomeBackMessage = (mem: Memory) => {
    const lastEmotion = mem.emotions.length > 0 ? mem.emotions[mem.emotions.length - 1] : null
    const lastFact = mem.facts.length > 0 ? mem.facts[mem.facts.length - 1] : null

    if (mem.lastMood && mem.lastMarket) {
      return `Good to see you again, ${mem.name}. Markets are still ${mem.lastMarket}; I remain ${mem.lastMood.toLowerCase()}. How can I assist you today?`
    }

    if (lastEmotion === "worried" || lastEmotion === "uncertain") {
      return `Welcome back, ${mem.name}. I hope you're feeling more confident today. How can I support you?`
    }

    if (lastFact) {
      return `Good to see you again, ${mem.name}. Last time you mentioned ${lastFact}. Ready to continue?`
    }

    return `Welcome back, ${mem.name}. How can I assist you today?`
  }

  const detectEmotion = (text: string): string | null => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes("worried") || lowerText.includes("anxious") || lowerText.includes("nervous"))
      return "worried"
    if (lowerText.includes("uncertain") || lowerText.includes("confused") || lowerText.includes("lost"))
      return "uncertain"
    if (lowerText.includes("excited") || lowerText.includes("happy") || lowerText.includes("great")) return "excited"
    if (lowerText.includes("goal") || lowerText.includes("plan") || lowerText.includes("target")) return "goal-oriented"
    return null
  }

  const getEmotionalResponse = (
    emotion: string,
    userName: string,
    userMessage: string,
    report?: AdvisorReport | null,
  ): string => {
    const moodPrefix: Record<Mood, string> = {
      Confident: "Let's capture this momentum.",
      Calm: "Steady as always.",
      Cautious: "We may rebalance to limit downside.",
      Reassuring: "You're doing the right thing staying consistent.",
      Alert: "Markets are volatile; let's safeguard your gains.",
    }

    if (report && report.totalChange < 0) {
      return `${moodPrefix[mood]} Markets can be rough, ${userName}. Let's review your allocations calmly. Your portfolio is down ${Math.abs(report.totalChange).toFixed(2)}% today, but remember that short-term volatility is normal. Would you like me to analyze your risk exposure?`
    }

    if (report && report.totalChange > 2) {
      return `${moodPrefix[mood]} Good momentum today, ${userName}. Your portfolio is up ${report.totalChange.toFixed(2)}%. Want to set a profit target or review your allocation to lock in some gains?`
    }

    switch (emotion) {
      case "worried":
        return `I understand, ${userName}. It's completely normal to feel that way when markets move fast. Let's look at your situation calmly and work through this together.`
      case "uncertain":
        return `${userName}, uncertainty is part of investing. Let me help you break this down into clear, manageable steps so you can feel more confident.`
      case "excited":
        return `I appreciate your enthusiasm, ${userName}. Let's channel that energy into smart decisions. What's got you excited?`
      case "goal-oriented":
        return `Great mindset, ${userName}. Setting clear goals is the foundation of financial success. Let's define what you want to achieve.`
      default:
        return `I'm here to help, ${userName}. Tell me more about what's on your mind.`
    }
  }

  const detectAndSaveMemory = (userMessage: string) => {
    if (!memory) return

    const lowerMsg = userMessage.toLowerCase()
    const memoryTriggers = [
      { pattern: /i work (in|as|at) (.+)/i, extract: (match: RegExpMatchArray) => `works ${match[1]} ${match[2]}` },
      { pattern: /my goal is (.+)/i, extract: (match: RegExpMatchArray) => `goal: ${match[1]}` },
      { pattern: /i (want to|plan to) (.+)/i, extract: (match: RegExpMatchArray) => `plans to ${match[2]}` },
      {
        pattern: /i'm (saving|investing) for (.+)/i,
        extract: (match: RegExpMatchArray) => `${match[1]} for ${match[2]}`,
      },
      { pattern: /i have (.+) in (.+)/i, extract: (match: RegExpMatchArray) => `has ${match[1]} in ${match[2]}` },
    ]

    for (const trigger of memoryTriggers) {
      const match = userMessage.match(trigger.pattern)
      if (match) {
        const fact = trigger.extract(match)
        const updatedFacts = [...memory.facts, fact]
        const updatedMemory = { ...memory, facts: updatedFacts }
        setMemory(updatedMemory)
        localStorage.setItem("apex_memory", JSON.stringify(updatedFacts))
        break
      }
    }

    const emotion = detectEmotion(userMessage)
    if (emotion) {
      const updatedEmotions = [...memory.emotions.slice(-4), emotion]
      const updatedMemory = { ...memory, emotions: updatedEmotions }
      setMemory(updatedMemory)
      localStorage.setItem("apex_emotions", JSON.stringify(updatedEmotions))
    }
  }

  const runAnalysis = () => {
    if (portfolio.length === 0) return

    setIsAnalyzing(true)
    setTimeout(() => {
      const report = analyzePortfolio(portfolio)
      setAdvisorReport(report)
      localStorage.setItem("apex_advisor_report", JSON.stringify(report))
      setIsAnalyzing(false)

      if (memory) {
        const emotion = report.totalChange < -1 ? "concerned" : report.totalChange > 2 ? "optimistic" : "neutral"
        const updatedEmotions = [...memory.emotions.slice(-4), emotion]
        setMemory({ ...memory, emotions: updatedEmotions })
        localStorage.setItem("apex_emotions", JSON.stringify(updatedEmotions))
      }
    }, 1500)
  }

  const getResponse = (userMessage: string): string => {
    if (!memory) return "I'm here to help."

    const lowerMsg = userMessage.toLowerCase()
    const emotion = detectEmotion(userMessage)

    if (
      lowerMsg.includes("goal") &&
      (lowerMsg.includes("progress") || lowerMsg.includes("how") || lowerMsg.includes("status"))
    ) {
      if (goals.length > 0) {
        const goal = goals[0]
        const progress = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)
        const projected = calculateForecast(goal.currentAmount, goal.timelineMonths)
        const onTrack = projected >= goal.targetAmount

        return `Your '${goal.title}' goal is ${progress}% complete. At the current pace, your portfolio could reach £${projected.toLocaleString()} in ${goal.timelineMonths} months, ${onTrack ? "putting you on track to meet your target" : "which may need adjustment to reach your target"}. ${onTrack ? "Steady progress — you're on course." : "We can adjust allocation to stay on track."}`
      }
      return `You haven't set any goals yet. Would you like to create one?`
    }

    if (lowerMsg.includes("forecast") || lowerMsg.includes("project")) {
      if (goals.length > 0) {
        const goal = goals[0]
        const projected = calculateForecast(goal.currentAmount, goal.timelineMonths)
        const percentage = ((projected / goal.targetAmount) * 100).toFixed(0)

        return `At the current pace, your portfolio could reach £${projected.toLocaleString()} in ${goal.timelineMonths} months, about ${percentage}% of your goal.`
      }
      return `I can help you forecast your financial progress. Let's set up a goal first.`
    }

    if (
      lowerMsg.includes("portfolio") ||
      lowerMsg.includes("analysis") ||
      lowerMsg.includes("risk") ||
      lowerMsg.includes("recommendation") ||
      lowerMsg.includes("how does my portfolio look")
    ) {
      runAnalysis()

      if (advisorReport) {
        const emotionalPrefix =
          advisorReport.totalChange < 0
            ? `Markets can be rough, ${memory.name}. Let's review it calmly. `
            : advisorReport.totalChange > 2
              ? `Good momentum today. `
              : ""

        let goalReference = ""
        if (goals.length > 0) {
          const goal = goals[0]
          const progress = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)
          goalReference = ` Your '${goal.title}' goal is ${progress}% complete — want me to suggest an allocation?`
        }

        return `${emotionalPrefix}Let me analyze your portfolio for you, ${memory.name}. One moment... Your total value is £${advisorReport.totalValue.toLocaleString()} with a ${advisorReport.totalChange >= 0 ? "+" : ""}${advisorReport.totalChange.toFixed(2)}% daily change. Diversification score: ${advisorReport.diversificationScore}. Overall risk is ${advisorReport.riskLevel}. ${advisorReport.recommendation}${goalReference}`
      }

      return `Let me analyze your portfolio for you, ${memory.name}. One moment...`
    }

    if (emotion) {
      return getEmotionalResponse(emotion, memory.name, userMessage, advisorReport)
    }

    if (lowerMsg.includes("investment")) {
      return `${memory.name}, I can help you analyze your portfolio. While I provide information and insights, remember that I'm not a licensed financial advisor. What specific aspect would you like to explore?`
    }

    if (lowerMsg.includes("market") || lowerMsg.includes("stock")) {
      return `The markets are always moving, ${memory.name}. I can help you understand trends and make informed decisions. What would you like to know?`
    }

    if (lowerMsg.includes("help") || lowerMsg.includes("what can you do")) {
      return `I'm here to help you with financial insights, portfolio analysis, goal setting, and market understanding. I provide information to help you make informed decisions. What would you like to focus on?`
    }

    switch (memory.tone.toLowerCase()) {
      case "friendly":
        return `That's interesting, ${memory.name}. I'm here to help you with that. Could you tell me more?`
      case "professional":
        return `I understand, ${memory.name}. Could you provide more details so I can assist you effectively?`
      case "playful":
        return `I like where this is going, ${memory.name}. Tell me more.`
      default:
        return `I'm here to help, ${memory.name}. What would you like to know more about?`
    }
  }

  const handleSendMessage = (messageText: string) => {
    if (!messageText.trim() || isTyping) return

    const userMessage = messageText.trim()
    setMessages((prev) => [...prev, { type: "user", text: userMessage }])
    setInput("")

    if (memory) {
      detectAndSaveMemory(userMessage)
    }

    setTimeout(() => {
      const response = getResponse(userMessage)
      typeMessage(response, setMessages)
    }, 500)
  }

  const handleQuickAction = (action: string) => {
    let message = ""
    switch (action) {
      case "portfolio":
        message = "Can you analyze my portfolio?"
        break
      case "goal":
        message = "What's my goal progress?"
        break
      case "insight":
        message = "What are the latest market insights?"
        break
    }
    handleSendMessage(message)
  }

  const handleResetAnalysis = () => {
    if (confirm("Are you sure you want to reset the portfolio analysis?")) {
      localStorage.removeItem("apex_advisor_report")
      setAdvisorReport(null)
    }
  }

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.currentAmount || !newGoal.timelineMonths) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      targetAmount: Number.parseFloat(newGoal.targetAmount),
      currentAmount: Number.parseFloat(newGoal.currentAmount),
      timelineMonths: Number.parseInt(newGoal.timelineMonths),
    }

    setGoals([...goals, goal])
    setNewGoal({ title: "", targetAmount: "", currentAmount: "", timelineMonths: "" })
    setShowAddGoal(false)
  }

  const handleDeleteGoal = (id: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      setGoals(goals.filter((g) => g.id !== id))
    }
  }

  const handleGetStarted = () => {
    setShowGetStarted(false)
    setTimeout(() => {
      setShowOrbIntro(true)
      setIntroMessageIndex(0)
      setIntroStep(1) // Set introStep to 1 after showing intro
    }, 500)
  }

  useEffect(() => {
    if (!showGetStarted && introStep === 0) {
      setIntroStep(1)
    }
  }, [showGetStarted])

  const introMessages = [
    "Hello, Namaste, and Ciao 👋",
    "Allow me to introduce myself…",
    "I'm Apex — your AI companion and advisor.",
    "I'd love to get to know you — not through questions, but through conversation.",
    "So, tell me something about yourself — what fascinates you lately?",
  ]

  useEffect(() => {
    if (!showOrbIntro || introMessageIndex >= introMessages.length) return

    const timer = setTimeout(
      () => {
        typeMessage(introMessages[introMessageIndex], setOnboardingMessages)

        if (introMessageIndex === introMessages.length - 1) {
          // Last message - transition to conversation
          setTimeout(() => {
            setShowConversation(true)
          }, 2000)
        } else {
          setIntroMessageIndex(introMessageIndex + 1)
        }
      },
      introMessageIndex === 0 ? 500 : 2000,
    )

    return () => clearTimeout(timer)
  }, [showOrbIntro, introMessageIndex, isTyping])

  const extractUserInfo = (text: string) => {
    const lowerText = text.toLowerCase()

    // Extract name patterns
    if (!extractedName) {
      const namePatterns = [/my name is (\w+)/i, /i'm (\w+)/i, /i am (\w+)/i, /call me (\w+)/i, /this is (\w+)/i]

      for (const pattern of namePatterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          setExtractedName(match[1])
          break
        }
      }
    }

    // Extract interests/fascinations
    if (!extractedInterest) {
      const interestPatterns = [
        /fascinated by (.+?)(?:\.|$)/i,
        /interested in (.+?)(?:\.|$)/i,
        /passionate about (.+?)(?:\.|$)/i,
        /love (.+?)(?:\.|$)/i,
        /enjoy (.+?)(?:\.|$)/i,
      ]

      for (const pattern of interestPatterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          setExtractedInterest(match[1].trim())
          break
        }
      }
    }

    // Extract goals
    if (!extractedGoal) {
      const goalPatterns = [
        /goal is to (.+?)(?:\.|$)/i,
        /want to (.+?)(?:\.|$)/i,
        /planning to (.+?)(?:\.|$)/i,
        /hoping to (.+?)(?:\.|$)/i,
        /trying to (.+?)(?:\.|$)/i,
        /save for (.+?)(?:\.|$)/i,
        /invest in (.+?)(?:\.|$)/i,
      ]

      for (const pattern of goalPatterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          setExtractedGoal(match[1].trim())
          break
        }
      }
    }
  }

  const getConversationalResponse = (userMessage: string): string => {
    extractUserInfo(userMessage)

    const lowerMsg = userMessage.toLowerCase()

    // If we have all info, wrap up
    if (extractedName && extractedInterest && extractedGoal) {
      return `Perfect, I understand you better now, ${extractedName}. You're interested in ${extractedInterest} and want to ${extractedGoal}. Let's build your financial future together.`
    }

    // Guide conversation to extract missing info
    if (!extractedName) {
      return "That's interesting. By the way, what should I call you?"
    }

    if (!extractedInterest) {
      return `Thanks for sharing, ${extractedName}. What fascinates you most right now — whether it's work, hobbies, or something else?`
    }

    if (!extractedGoal) {
      return `I appreciate you opening up about ${extractedInterest}. What are you hoping to achieve financially? What's your main goal?`
    }

    // Default response
    return "Tell me more about that. I'm here to understand you better."
  }

  const handleConversationalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userInput = input.trim()
    setOnboardingMessages((prev) => [...prev, { type: "user", text: userInput }])
    setInput("")

    setTimeout(() => {
      const response = getConversationalResponse(userInput)
      typeMessage(response, setOnboardingMessages)

      // Check if onboarding is complete
      if (extractedName && extractedInterest && extractedGoal) {
        setTimeout(() => {
          completeOnboarding()
        }, 3000)
      }
    }, 500)
  }

  const completeOnboarding = () => {
    const newMemory: Memory = {
      name: extractedName,
      goal: extractedGoal,
      tone: "Friendly", // Default tone
      facts: [extractedInterest],
      emotions: [],
      lastVisit: Date.now(),
    }

    localStorage.setItem(
      "apex_user_profile",
      JSON.stringify({
        name: extractedName,
        goal: extractedGoal,
        tone: "Friendly",
      }),
    )
    localStorage.setItem("apex_memory", JSON.stringify([extractedInterest]))
    localStorage.setItem("apex_emotions", JSON.stringify([]))
    localStorage.setItem("apex_conversation_history", JSON.stringify([]))
    localStorage.setItem("onboardingComplete", "true")

    setMemory(newMemory)

    // Fade to black transition
    const overlay = document.createElement("div")
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: black;
      opacity: 0;
      transition: opacity 1s ease;
      z-index: 9999;
      pointer-events: none;
    `
    document.body.appendChild(overlay)

    setTimeout(() => {
      overlay.style.opacity = "1"
    }, 100)

    setTimeout(() => {
      setIsOnboarding(false)
      setTimeout(() => {
        overlay.style.opacity = "0"
        setTimeout(() => {
          document.body.removeChild(overlay)
          typeMessage(
            `Welcome to Apex Financial Studio, ${extractedName}. I'm here to help you ${extractedGoal}. Remember, I provide information and insights, not licensed financial advice. How can I assist you today?`,
            setMessages,
          )
        }, 1000)
      }, 100)
    }, 1000)
  }

  const handleClearMemory = () => {
    if (
      confirm(
        "Are you sure you want to clear all data and start fresh? This will erase your profile, conversation history, and learned insights.",
      )
    ) {
      localStorage.removeItem("apex_user_profile")
      localStorage.removeItem("apex_conversation_history")
      localStorage.removeItem("apex_memory")
      localStorage.removeItem("apex_emotions")
      localStorage.removeItem("apex_portfolio")
      localStorage.removeItem("apex_advisor_report")
      localStorage.removeItem("apex_goals")
      localStorage.removeItem("onboardingComplete") // Also remove onboarding completion flag
      window.location.reload()
    }
  }

  const handleVoiceInput = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const hasSpeechRecognition =
    typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "#1E8449"
      case "Moderate":
        return "#F1C40F"
      case "High":
        return "#C0392B"
      default:
        return "#666"
    }
  }

  const getOrbStyle = () => {
    const baseSpeed = 3 - (settings.energyLevel / 5) * 1.5 // 3s to 1.5s based on energy

    const moodStyles: Record<Mood, { gradient: string; shadow: string; speed: number }> = {
      Confident: {
        gradient: "radial-gradient(circle at 30% 30%, #00CED1, #1E90FF, #0B132B)",
        shadow: "0 0 60px rgba(0, 206, 209, 0.8), 0 0 100px rgba(30, 144, 255, 0.6)",
        speed: baseSpeed * 0.7,
      },
      Calm: {
        gradient: "radial-gradient(circle at 30% 30%, #7209B7, #3A0CA3, #0B132B)",
        shadow: "0 0 40px rgba(58, 12, 163, 0.6), 0 0 80px rgba(114, 9, 183, 0.4)",
        speed: baseSpeed * 1.2,
      },
      Cautious: {
        gradient: "radial-gradient(circle at 30% 30%, #FFB347, #FF8C00, #0B132B)",
        shadow: "0 0 50px rgba(255, 179, 71, 0.7), 0 0 90px rgba(255, 140, 0, 0.5)",
        speed: baseSpeed,
      },
      Reassuring: {
        gradient: "radial-gradient(circle at 30% 30%, #9370DB, #8A2BE2, #0B132B)",
        shadow: "0 0 45px rgba(147, 112, 219, 0.7), 0 0 85px rgba(138, 43, 226, 0.5)",
        speed: baseSpeed,
      },
      Alert: {
        gradient: "radial-gradient(circle at 30% 30%, #FF6B6B, #DC143C, #0B132B)",
        shadow: "0 0 55px rgba(255, 107, 107, 0.8), 0 0 95px rgba(220, 20, 60, 0.6)",
        speed: baseSpeed * 0.5,
      },
    }

    return moodStyles[mood]
  }

  const getMoodOverlay = () => {
    const overlays: Record<Mood, string> = {
      Confident: "rgba(0, 206, 209, 0.03)",
      Calm: "rgba(58, 12, 163, 0.02)",
      Cautious: "rgba(255, 140, 0, 0.03)",
      Reassuring: "rgba(138, 43, 226, 0.02)",
      Alert: "rgba(220, 20, 60, 0.04)",
    }
    return overlays[mood]
  }

  if (isOnboarding) {
    const orbStyle = getOrbStyle()

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #020202 0%, #0B132B 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Star-field background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: `
              radial-gradient(2px 2px at 20% 30%, white, transparent),
              radial-gradient(2px 2px at 60% 70%, white, transparent),
              radial-gradient(1px 1px at 50% 50%, white, transparent),
              radial-gradient(1px 1px at 80% 10%, white, transparent),
              radial-gradient(2px 2px at 90% 60%, white, transparent),
              radial-gradient(1px 1px at 33% 80%, white, transparent),
              radial-gradient(1px 1px at 15% 90%, white, transparent)
            `,
            backgroundSize: "200% 200%",
            animation: "twinkle 8s ease-in-out infinite",
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.3; }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes orbPulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.9;
            }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
        `}</style>

        <div
          style={{
            maxWidth: "600px",
            width: "100%",
            textAlign: "center",
            padding: "2rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Get Started Screen */}
          {showGetStarted && (
            <div className="fade-in-up">
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "700",
                  color: "white",
                  marginBottom: "1rem",
                  lineHeight: "1.3",
                }}
              >
                Welcome to Apex
              </h1>
              <p
                style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", marginBottom: "3rem", lineHeight: "1.6" }}
              >
                Your AI companion for financial clarity and confidence
              </p>
              <button
                onClick={handleGetStarted}
                style={{
                  padding: "1rem 3rem",
                  background: "linear-gradient(135deg, #3A0CA3, #7209B7)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 8px 30px rgba(58, 12, 163, 0.5)",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(58, 12, 163, 0.6)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(58, 12, 163, 0.5)"
                }}
              >
                Get Started
              </button>
            </div>
          )}

          {/* Orb Intro Screen */}
          {showOrbIntro && (
            <div className="fade-in-up">
              {/* Animated Orb */}
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  margin: "0 auto 2rem",
                  borderRadius: "50%",
                  background: orbStyle.gradient,
                  boxShadow: orbStyle.shadow,
                  animation: `orbPulse ${orbStyle.speed}s ease-in-out infinite`,
                }}
              />

              {/* Orb Messages */}
              <div style={{ minHeight: "200px" }}>
                {onboardingMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className="fade-in-up"
                    style={{
                      marginBottom: "1.5rem",
                      color: msg.type === "apex" ? "white" : "#D4AF37",
                      fontSize: msg.type === "apex" ? "1.25rem" : "1.1rem",
                      fontWeight: msg.type === "apex" ? "400" : "600",
                      lineHeight: "1.6",
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Conversational Input */}
              {showConversation && !isTyping && (
                <form onSubmit={handleConversationalSubmit} className="fade-in-up" style={{ marginTop: "2rem" }}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    style={{
                      width: "100%",
                      padding: "1rem 1.5rem",
                      background: "rgba(255,255,255,0.1)",
                      border: "2px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      color: "white",
                      outline: "none",
                      textAlign: "center",
                    }}
                    autoFocus
                  />
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main dashboard view
  const orbStyle = getOrbStyle()

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, #020202 0%, #0B132B 100%)`,
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .pulse-animation { animation: pulse 1.5s ease-in-out infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation { animation: spin 1s linear infinite; }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: starTwinkle 3s ease-in-out infinite;
        }
        @keyframes particleDrift {
          0% { transform: translate(0, 0); opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { transform: translate(100px, -100px); opacity: 0; }
        }
        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: particleDrift 10s ease-in-out infinite;
        }
        @keyframes tickerSlide {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .ticker-slide { animation: tickerSlide 0.5s ease-out; }
        @keyframes microFeedbackFade {
          0% { opacity: 0; transform: translateY(10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .micro-feedback { animation: microFeedbackFade 5s ease-in-out; }
      `}</style>

      {[...Array(80)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="star"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      {[...Array(20)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="particle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        />
      ))}

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: getMoodOverlay(),
          pointerEvents: "none",
          transition: "background 2s ease",
          zIndex: 0,
        }}
      />

      <div
        className="ticker-slide"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "0.75rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
          zIndex: 100,
          fontSize: "0.9rem",
          fontWeight: "500",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>Global Index</span>
          <span
            style={{
              color: marketData.globalIndex >= 0 ? "#1E8449" : "#E74C3C",
              fontWeight: "600",
              transition: "color 0.5s ease",
            }}
          >
            {marketData.globalIndex >= 0 ? "▲" : "▼"} {Math.abs(marketData.globalIndex).toFixed(2)}%
          </span>
        </div>

        <div style={{ width: "1px", height: "20px", background: "rgba(255, 255, 255, 0.2)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>Volatility</span>
          <span style={{ color: "white", fontWeight: "600", transition: "color 0.5s ease" }}>
            {Math.round(marketData.volatilityIndex)}
          </span>
        </div>

        <div style={{ width: "1px", height: "20px", background: "rgba(255, 255, 255, 0.2)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>Sentiment</span>
          <span
            style={{
              color:
                marketData.sentiment === "bullish"
                  ? "#1E8449"
                  : marketData.sentiment === "bearish"
                    ? "#E74C3C"
                    : "#FFB347",
              fontWeight: "600",
              textTransform: "capitalize",
              transition: "color 0.5s ease",
            }}
          >
            {marketData.sentiment}
          </span>
        </div>
      </div>

      {/* Sidebar */}
      <div
        style={{
          width: isSidebarOpen ? "280px" : "0",
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          padding: isSidebarOpen ? "2rem 1.5rem" : "2rem 0",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          overflow: "hidden",
          position: "relative",
          zIndex: 10,
          marginTop: "60px",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "white", margin: "0 0 0.5rem 0" }}>Apex Studio</h2>
          <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
            Your AI Financial Companion
          </p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: "📊" },
            { id: "portfolio", label: "Portfolio", icon: "💼" },
            { id: "insights", label: "Insights", icon: "📈" },
            { id: "goals", label: "Goals", icon: "🎯" },
            { id: "settings", label: "Settings", icon: "⚙️" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                background: currentView === item.id ? "rgba(212, 175, 55, 0.2)" : "transparent",
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: currentView === item.id ? "600" : "400",
                textAlign: "left",
                transition: "all 0.2s",
                borderLeft: currentView === item.id ? "3px solid #D4AF37" : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (currentView !== item.id) e.currentTarget.style.background = "rgba(255,255,255,0.05)"
              }}
              onMouseLeave={(e) => {
                if (currentView !== item.id) e.currentTarget.style.background = "transparent"
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {memory && memory.lastVisit && (
          <div
            style={{
              marginTop: "2rem",
              padding: "1rem",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.6)", margin: "0 0 0.5rem 0" }}>Last visit</p>
            <p style={{ fontSize: "0.85rem", color: "white", margin: 0 }}>
              {new Date(memory.lastVisit).toLocaleDateString()}
            </p>
          </div>
        )}

        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            border: `1px solid ${orbStyle.shadow.split(",")[0].split("(")[1]}`,
            transition: "all 0.5s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: orbStyle.gradient,
                boxShadow: orbStyle.shadow,
              }}
            />
            <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>Apex Mood</p>
          </div>
          <p style={{ fontSize: "0.9rem", color: "white", margin: 0, fontWeight: "600" }}>{mood}</p>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="main-content"
        style={{
          flex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem",
          width: "100%",
          position: "relative",
          zIndex: 1,
          marginTop: "60px",
        }}
      >
        {microFeedback && (
          <div
            className="micro-feedback"
            style={{
              position: "fixed",
              top: "80px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0, 0, 0, 0.9)",
              backdropFilter: "blur(10px)",
              padding: "0.75rem 1.5rem",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              fontSize: "0.9rem",
              fontWeight: "500",
              zIndex: 200,
              boxShadow: orbStyle.shadow,
            }}
          >
            {microFeedback}
          </div>
        )}

        {currentView === "dashboard" && (
          <div className="fade-in">
            <div style={{ marginBottom: "2rem" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "white", margin: "0 0 0.5rem 0" }}>
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
                {memory?.name}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", margin: 0 }}>
                Here's your financial overview
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
                padding: "2rem",
                borderRadius: "12px",
                marginBottom: "2rem",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700", color: "white" }}>
                  🎯 Goals & Forecast
                </h2>
                <button
                  onClick={() => setShowAddGoal(!showAddGoal)}
                  style={{
                    padding: "0.5rem 1.25rem",
                    background: "rgba(212, 175, 55, 0.2)",
                    color: "#D4AF37",
                    border: "1px solid #D4AF37",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  {showAddGoal ? "Cancel" : "Add Goal"}
                </button>
              </div>

              {showAddGoal && (
                <div
                  className="fade-in"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Goal name"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      style={{
                        padding: "0.75rem",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "6px",
                        color: "white",
                        outline: "none",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Target £"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                      style={{
                        padding: "0.75rem",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "6px",
                        color: "white",
                        outline: "none",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Current £"
                      value={newGoal.currentAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                      style={{
                        padding: "0.75rem",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "6px",
                        color: "white",
                        outline: "none",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Timeline (months)"
                      value={newGoal.timelineMonths}
                      onChange={(e) => setNewGoal({ ...newGoal, timelineMonths: e.target.value })}
                      style={{
                        padding: "0.75rem",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "6px",
                        color: "white",
                        outline: "none",
                      }}
                    />
                  </div>
                  <button
                    onClick={handleAddGoal}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "#D4AF37",
                      color: "#0B132B",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Add Goal
                  </button>
                </div>
              )}

              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}
              >
                {goals.map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100
                  const projected = calculateForecast(goal.currentAmount, goal.timelineMonths)
                  const onTrack = projected >= goal.targetAmount

                  return (
                    <div
                      key={goal.id}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        padding: "1.5rem",
                        borderRadius: "8px",
                        border: `1px solid ${onTrack ? "#1E8449" : "#F1C40F"}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          marginBottom: "1rem",
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "white" }}>
                          {goal.title}
                        </h3>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "rgba(255,255,255,0.5)",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                          }}
                        >
                          ×
                        </button>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Progress</span>
                          <span style={{ fontSize: "0.85rem", color: "white", fontWeight: "600" }}>
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(progress, 100)}%`,
                              height: "100%",
                              background: onTrack ? "#1E8449" : "#F1C40F",
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                          Current: £{goal.currentAmount.toLocaleString()}
                        </p>
                        <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                          Target: £{goal.targetAmount.toLocaleString()}
                        </p>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                          Timeline: {goal.timelineMonths} months
                        </p>
                      </div>

                      <div
                        style={{
                          padding: "0.75rem",
                          background: onTrack ? "rgba(30, 132, 73, 0.2)" : "rgba(241, 196, 15, 0.2)",
                          borderRadius: "6px",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", fontWeight: "600", color: "white" }}>
                          Forecast
                        </p>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "rgba(255,255,255,0.9)" }}>
                          Projected: £{projected.toLocaleString()} in {goal.timelineMonths} months
                        </p>
                      </div>

                      <div
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          background: onTrack ? "#1E8449" : "#F1C40F",
                          color: "white",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                        }}
                      >
                        {onTrack ? "On Track" : "Needs Attention"}
                      </div>
                    </div>
                  )
                })}
              </div>

              {goals.length === 0 && (
                <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.5)" }}>
                  <p style={{ margin: 0, fontSize: "1rem" }}>No goals set yet. Click "Add Goal" to get started.</p>
                </div>
              )}
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
                padding: "2rem",
                borderRadius: "12px",
                marginBottom: "2rem",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700", color: "white" }}>
                  🤖 Advisor Insights
                </h2>
                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  style={{
                    padding: "0.5rem 1.25rem",
                    background: isAnalyzing ? "rgba(255,255,255,0.1)" : "rgba(212, 175, 55, 0.2)",
                    color: isAnalyzing ? "rgba(255,255,255,0.5)" : "#D4AF37",
                    border: `1px solid ${isAnalyzing ? "rgba(255,255,255,0.2)" : "#D4AF37"}`,
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: isAnalyzing ? "not-allowed" : "pointer",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {isAnalyzing && <span className="spin-animation">⚙️</span>}
                  {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                </button>
              </div>

              {advisorReport ? (
                <div className="fade-in">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1.5rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div>
                      <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                        Total Portfolio Value
                      </p>
                      <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: "700", color: "white" }}>
                        £{advisorReport.totalValue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                        Daily Change
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "1.75rem",
                          fontWeight: "700",
                          color: advisorReport.totalChange >= 0 ? "#1E8449" : "#C0392B",
                        }}
                      >
                        {advisorReport.totalChange >= 0 ? "+" : ""}
                        {advisorReport.totalChange.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                        Risk Level
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.25rem 0.75rem",
                            background: getRiskColor(advisorReport.riskLevel),
                            color: "white",
                            borderRadius: "12px",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                          }}
                        >
                          {advisorReport.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginBottom: "1rem",
                      padding: "1rem",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "8px",
                    }}
                  >
                    <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: "600", color: "white" }}>
                      Summary
                    </p>
                    <p style={{ margin: 0, fontSize: "0.95rem", color: "rgba(255,255,255,0.9)", lineHeight: "1.6" }}>
                      {advisorReport.summary}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: "1rem",
                      background: "rgba(212, 175, 55, 0.1)",
                      borderRadius: "8px",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                    }}
                  >
                    <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: "600", color: "white" }}>
                      Recommendation
                    </p>
                    <p style={{ margin: 0, fontSize: "0.95rem", color: "rgba(255,255,255,0.9)", lineHeight: "1.6" }}>
                      {advisorReport.recommendation}
                    </p>
                  </div>

                  <p
                    style={{
                      margin: "1rem 0 0 0",
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.5)",
                      textAlign: "right",
                    }}
                  >
                    Last analysis: {new Date(advisorReport.timestamp).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.5)" }}>
                  <p style={{ margin: 0, fontSize: "1rem" }}>
                    No analysis available yet. Click "Run Analysis" to get started.
                  </p>
                </div>
              )}
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, rgba(58, 12, 163, 0.3) 0%, rgba(114, 9, 183, 0.3) 100%)",
                backdropFilter: "blur(10px)",
                padding: "2rem",
                borderRadius: "12px",
                marginBottom: "2rem",
                color: "white",
                border: "1px solid rgba(114, 9, 183, 0.5)",
              }}
            >
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", opacity: 0.9 }}>Portfolio Balance</p>
              <h2 style={{ margin: "0 0 1rem 0", fontSize: "2.5rem", fontWeight: "700" }}>
                £{advisorReport ? advisorReport.totalValue.toLocaleString() : "66,500"}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    color: advisorReport && advisorReport.totalChange < 0 ? "#EF4444" : "#4ADE80",
                    fontSize: "1.1rem",
                  }}
                >
                  {advisorReport && advisorReport.totalChange < 0 ? "↘" : "↗"}
                </span>
                <span
                  style={{
                    color: advisorReport && advisorReport.totalChange < 0 ? "#EF4444" : "#4ADE80",
                    fontWeight: "600",
                  }}
                >
                  {advisorReport
                    ? `${advisorReport.totalChange >= 0 ? "+" : ""}${advisorReport.totalChange.toFixed(2)}%`
                    : "+0.8%"}
                </span>
                <span style={{ opacity: 0.8, fontSize: "0.9rem" }}>today</span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(10px)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "600", color: "white" }}>
                  📈 Market Insights
                </h3>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", lineHeight: "1.6", fontSize: "0.95rem" }}>
                  Markets showing steady growth. Tech sector up 3.2%, with strong performance in AI and cloud computing
                  sectors.
                </p>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(10px)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "600", color: "white" }}>
                  🎯 Goals Progress
                </h3>
                <p style={{ margin: "0 0 0.75rem 0", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                  {memory?.goal || "Building wealth"}
                </p>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ width: "68%", height: "100%", background: "#D4AF37" }}></div>
                </div>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                  68% complete
                </p>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(10px)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "600", color: "white" }}>
                  📝 Personal Notes
                </h3>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.25rem",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: "1.8",
                    fontSize: "0.95rem",
                  }}
                >
                  <li>Review quarterly performance</li>
                  <li>Research emerging markets</li>
                  <li>Rebalance portfolio next month</li>
                </ul>
              </div>
            </div>

            <div
              style={{
                background: "rgba(212, 175, 55, 0.1)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "2rem",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.9rem", color: "rgba(255,255,255,0.9)" }}>
                <strong>Note:</strong> Apex provides information and insights, not licensed financial advice. Always
                consult with a qualified financial advisor for personalized guidance.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "rgba(11, 19, 43, 0.8)",
                  padding: "1rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      background: "radial-gradient(circle, #7209B7, #3A0CA3)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 15px rgba(114, 9, 183, 0.5)",
                    }}
                  >
                    🧠
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "600", color: "white" }}>Chat with Apex</h3>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                      Your financial assistant
                    </p>
                  </div>
                </div>
                {memory && memory.facts.length > 0 && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#D4AF37",
                      background: "rgba(212, 175, 55, 0.2)",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                    }}
                  >
                    {memory.facts.length} insight{memory.facts.length !== 1 ? "s" : ""} remembered
                  </div>
                )}
              </div>

              <div style={{ padding: "1.5rem", minHeight: "300px", maxHeight: "400px", overflowY: "auto" }}>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className="fade-in"
                    style={{
                      display: "flex",
                      justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    {msg.type === "apex" && (
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          background: "radial-gradient(circle, #7209B7, #3A0CA3)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "0.5rem",
                          flexShrink: 0,
                          fontSize: "1rem",
                          boxShadow: "0 0 10px rgba(114, 9, 183, 0.5)",
                        }}
                      >
                        🧠
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: "75%",
                        padding: "0.75rem 1rem",
                        borderRadius: "12px",
                        background: msg.type === "apex" ? "rgba(255,255,255,0.1)" : "rgba(212, 175, 55, 0.2)",
                        color: "white",
                        border:
                          msg.type === "apex" ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(212, 175, 55, 0.3)",
                      }}
                    >
                      <p style={{ margin: 0, lineHeight: "1.6" }}>{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div
                    className="fade-in"
                    style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "radial-gradient(circle, #7209B7, #3A0CA3)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "0.5rem",
                        flexShrink: 0,
                        boxShadow: "0 0 10px rgba(114, 9, 183, 0.5)",
                      }}
                    >
                      🧠
                    </div>
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <div
                          style={{ width: "8px", height: "8px", background: "white", borderRadius: "50%" }}
                          className="pulse-animation"
                        ></div>
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            background: "white",
                            borderRadius: "50%",
                            animationDelay: "0.2s",
                          }}
                          className="pulse-animation"
                        ></div>
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            background: "white",
                            borderRadius: "50%",
                            animationDelay: "0.4s",
                          }}
                          className="pulse-animation"
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div style={{ padding: "0 1.5rem 1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => handleQuickAction("portfolio")}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(212, 175, 55, 0.2)"
                    e.currentTarget.style.borderColor = "#D4AF37"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)"
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                  }}
                >
                  Analyze Portfolio
                </button>
                <button
                  onClick={() => handleQuickAction("goal")}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(212, 175, 55, 0.2)"
                    e.currentTarget.style.borderColor = "#D4AF37"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)"
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                  }}
                >
                  Goal Progress
                </button>
                <button
                  onClick={() => handleQuickAction("insight")}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(212, 175, 55, 0.2)"
                    e.currentTarget.style.borderColor = "#D4AF37"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)"
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                  }}
                >
                  Market Insight
                </button>
              </div>

              <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                {isListening && (
                  <div
                    style={{
                      marginBottom: "0.5rem",
                      textAlign: "center",
                      fontSize: "0.85rem",
                      color: "#D4AF37",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{ width: "8px", height: "8px", background: "#D4AF37", borderRadius: "50%" }}
                      className="pulse-animation"
                    ></div>
                    Listening...
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage(input)
                  }}
                  style={{ display: "flex", gap: "0.5rem" }}
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Apex anything..."
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      border: "2px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                      outline: "none",
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                    }}
                    disabled={isTyping || isListening}
                  />
                  {hasSpeechRecognition && (
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      style={{
                        padding: "0.75rem 1rem",
                        background: isListening ? "#EF4444" : "rgba(255,255,255,0.05)",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "1.25rem",
                      }}
                      disabled={isTyping}
                    >
                      {isListening ? "🔴" : "🎤"}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping || isListening}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "rgba(212, 175, 55, 0.2)",
                      color: "#D4AF37",
                      border: "1px solid #D4AF37",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
                      opacity: input.trim() && !isTyping ? 1 : 0.5,
                    }}
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {currentView === "settings" && (
          <div className="fade-in">
            <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "white", marginBottom: "2rem" }}>Settings</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "white", marginBottom: "1rem" }}>
                  Adjust Apex Energy
                </h3>
                <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  Control how dynamic and responsive Apex is. Higher energy means faster animations and more proactive
                  communication.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.85rem" }}>Reserved</span>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={settings.energyLevel}
                    onChange={(e) => {
                      const newSettings = { ...settings, energyLevel: Number.parseInt(e.target.value) }
                      setSettings(newSettings)
                      localStorage.setItem("apex_settings", JSON.JSON.stringify(newSettings))
                    }}
                    style={{
                      flex: 1,
                      height: "6px",
                      borderRadius: "3px",
                      background: "rgba(255, 255, 255, 0.2)",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.85rem" }}>Dynamic</span>
                </div>
                <p style={{ color: "white", fontSize: "0.9rem", marginTop: "0.5rem", textAlign: "center" }}>
                  Level: {settings.energyLevel}
                </p>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "white", marginBottom: "0.5rem" }}>
                      Adaptive Mode
                    </h3>
                    <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem", margin: 0 }}>
                      Allow Apex to adapt its mood and tone based on market conditions and your emotions.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newSettings = { ...settings, adaptiveMode: !settings.adaptiveMode }
                      setSettings(newSettings)
                      localStorage.setItem("apex_settings", JSON.stringify(newSettings))
                    }}
                    style={{
                      width: "60px",
                      height: "32px",
                      borderRadius: "16px",
                      background: settings.adaptiveMode ? "#1E8449" : "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      cursor: "pointer",
                      position: "relative",
                      transition: "background 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "white",
                        position: "absolute",
                        top: "4px",
                        left: settings.adaptiveMode ? "32px" : "4px",
                        transition: "left 0.3s ease",
                      }}
                    />
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "white", marginBottom: "1rem" }}>
                  Clear All Data
                </h3>
                <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  Reset your profile, conversation history, and all stored memories.
                </p>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                      localStorage.clear()
                      window.location.reload()
                    }
                  }}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "rgba(231, 76, 60, 0.2)",
                    border: "1px solid rgba(231, 76, 60, 0.5)",
                    borderRadius: "8px",
                    color: "#E74C3C",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(231, 76, 60, 0.3)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(231, 76, 60, 0.2)"
                  }}
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
