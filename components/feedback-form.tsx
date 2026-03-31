"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Star, Send } from "lucide-react"

interface FeedbackEntry {
  id: string
  rating: number
  category: string
  message: string
  timestamp: string
}

export default function FeedbackForm() {
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState("general")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const feedback: FeedbackEntry = {
      id: Date.now().toString(),
      rating,
      category,
      message,
      timestamp: new Date().toISOString(),
    }

    // Store feedback locally
    const existingFeedback = JSON.parse(localStorage.getItem("apex-feedback") || "[]")
    localStorage.setItem("apex-feedback", JSON.stringify([...existingFeedback, feedback]))

    setSubmitted(true)
    setTimeout(() => {
      setRating(0)
      setCategory("general")
      setMessage("")
      setSubmitted(false)
    }, 3000)
  }

  return (
    <Card className="bg-apex-dark border-gray-800 p-6 space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="text-apex-accent" size={24} />
        <h3 className="text-xl font-bold text-white">Send Feedback</h3>
      </div>

      {submitted ? (
        <div className="text-center py-8 space-y-3 animate-in fade-in">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <Send className="text-green-400" size={32} />
          </div>
          <h4 className="text-lg font-semibold text-white">Thank you for your feedback!</h4>
          <p className="text-apex-gray text-sm">
            Your input helps us improve Apex. All feedback is stored locally and never shared.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-apex-gray mb-2 block">How would you rate your experience?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star size={32} className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-apex-gray mb-2 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-apex-darker border border-gray-700 rounded-md p-2 text-white"
            >
              <option value="general">General Feedback</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="ui">UI/UX Improvement</option>
              <option value="performance">Performance Issue</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-apex-gray mb-2 block">Your Feedback</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think..."
              className="bg-apex-darker border-gray-700 text-white min-h-32"
              required
            />
          </div>

          <Button type="submit" disabled={rating === 0} className="w-full bg-apex-primary">
            <Send size={16} className="mr-2" />
            Submit Feedback
          </Button>

          <p className="text-xs text-apex-gray text-center">
            Your feedback is stored locally on your device and never sent to external servers.
          </p>
        </form>
      )}
    </Card>
  )
}
