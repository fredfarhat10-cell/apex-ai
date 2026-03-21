"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export interface ChatMessage {
  id: string
  role: "user" | "apex"
  text: string
}

interface ChatPanelProps {
  messages: ChatMessage[]
  isTyping: boolean
  quickReplies?: string[]
  onQuickReply: (reply: string) => void
}

export function ChatPanel({ messages, isTyping, quickReplies, onQuickReply }: ChatPanelProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Messages */}
      <div className="space-y-4 mb-6" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
            style={{ animationDelay: "0ms", animationDuration: "400ms" }}
          >
            <Card
              className={`max-w-[80%] p-4 ${
                message.role === "user"
                  ? "bg-apex-primary/20 border-apex-primary/40 text-apex-light"
                  : "bg-apex-dark/80 border-apex-primary/20 text-apex-light backdrop-blur-lg"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
            </Card>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fadeIn" style={{ animationDuration: "300ms" }}>
            <Card className="bg-apex-dark/80 border-apex-primary/20 backdrop-blur-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-apex-primary" />
                <span className="text-sm text-apex-gray">Apex is thinking...</span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Quick replies */}
      {quickReplies && quickReplies.length > 0 && !isTyping && (
        <div className="flex flex-wrap gap-3 justify-center animate-fadeIn" style={{ animationDuration: "400ms" }}>
          {quickReplies.map((reply, index) => (
            <div
              key={reply}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 70}ms`, animationDuration: "260ms" }}
            >
              <Button
                onClick={() => onQuickReply(reply)}
                className="bg-apex-primary/10 hover:bg-apex-primary text-apex-primary hover:text-apex-dark border border-apex-primary/40 hover:border-apex-primary transition-all duration-300 hover:scale-105"
              >
                {reply}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
