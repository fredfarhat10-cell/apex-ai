"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, Brain, Lock, DollarSign, Settings, Search, Sparkles } from "lucide-react"

const faqData = [
  {
    question: "What can Apex AI actually do?",
    answer:
      "I am designed to be your cognitive co-pilot. I can help you set and track financial goals, analyze spending patterns, build healthy routines, and provide personalized insights by learning from our conversations. My goal is to help you orchestrate your life with more clarity and intention.",
    icon: <Brain className="text-purple-400" />,
    category: "Capabilities",
  },
  {
    question: "What are your limitations?",
    answer:
      "I am not a licensed financial advisor and cannot give investment advice. My analysis is based on the data you provide and simulated market conditions. I do not have real-time access to your bank accounts unless you connect them. My memory is powerful but local to your device; I cannot sync data across your devices automatically.",
    icon: <Brain className="text-gray-400" />,
    category: "Capabilities",
  },
  {
    question: "How is my data kept private?",
    answer:
      "Your privacy is my core directive. All data is encrypted with AES-256-GCM and stored exclusively on your device in IndexedDB. Your master password is never stored. I operate on a zero-knowledge principle—it is architecturally impossible for me or anyone else to access your data.",
    icon: <Lock className="text-green-400" />,
    category: "Privacy",
  },
  {
    question: "What is the pricing model? Is there a free version?",
    answer:
      "Apex AI operates on a freemium model. The core features—including the encrypted vault, basic goal tracking, and standard AI insights—are free forever. An optional 'Apex Pro' subscription unlocks advanced capabilities like multi-constraint simulations, automated financial coaching, and deeper trend analysis. The Pro plan will be a simple monthly or yearly subscription with no hidden fees.",
    icon: <DollarSign className="text-yellow-400" />,
    category: "Subscription",
  },
  {
    question: "How do I set up my financial goals?",
    answer:
      "Navigate to the 'Financial Studio' from the main Nexus dashboard. Inside, you'll find the 'Goals & Forecast' widget. Click 'Add Goal' to define your target amount, current savings, and desired timeline. I will automatically track your progress and provide insights to help you stay on track.",
    icon: <Settings className="text-cyan-400" />,
    category: "Setup",
  },
  {
    question: "How does Apex learn and personalize?",
    answer:
      "I learn from our conversations and the data you input. For example, if you mention you're saving for a house, I'll prioritize insights related to real estate and long-term savings. My 'Aura' system adapts my tone and suggestions based on your current emotional state. This all happens locally on your device.",
    icon: <Sparkles className="text-pink-400" />,
    category: "AI",
  },
]

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredFaqs = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-8 animate-fadeIn p-8">
      <div>
        <h1 className="text-4xl font-bold text-white flex items-center gap-3 font-orbitron">
          <HelpCircle size={40} className="text-apex-primary" />
          Help Center
        </h1>
        <p className="text-apex-gray mt-2">
          Your guide to mastering the symbiont. All questions, answered with transparency.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search questions (e.g., 'pricing', 'privacy')..."
          className="w-full bg-apex-dark/80 border-2 border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:border-apex-primary transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="bg-apex-dark/50 border-gray-800 p-6 glassmorphism">
        <Accordion type="single" collapsible className="w-full">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-700">
                <AccordionTrigger className="text-lg font-semibold text-white hover:text-apex-primary transition-colors text-left">
                  <div className="flex items-center gap-4">
                    {faq.icon}
                    <span>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-apex-gray leading-relaxed pt-2 pl-14">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No results found for "{searchTerm}".</p>
              <p className="text-sm mt-2">Try searching for a different keyword.</p>
            </div>
          )}
        </Accordion>
      </Card>

      <div className="text-center text-sm text-gray-500 pt-4">
        <p>This is a living document. I will update it as I learn and evolve.</p>
      </div>
    </div>
  )
}
