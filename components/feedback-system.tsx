"use client"

import { useState } from "react"
import { MessageSquareIcon, SendIcon } from "./icons"

export default function FeedbackSystem() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [category, setCategory] = useState<"bug" | "feature" | "general">("general")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    const feedbackEntry = {
      id: Date.now().toString(),
      category,
      feedback,
      timestamp: new Date().toISOString(),
    }

    const existingFeedback = JSON.parse(localStorage.getItem("apex_feedback") || "[]")
    localStorage.setItem("apex_feedback", JSON.stringify([...existingFeedback, feedbackEntry]))

    setSubmitted(true)
    setTimeout(() => {
      setIsOpen(false)
      setSubmitted(false)
      setFeedback("")
    }, 2000)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-apex-primary text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
        title="Send Feedback"
      >
        <MessageSquareIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-apex-dark border border-gray-800 rounded-lg p-6 max-w-md w-full space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-lg">Send Feedback</h3>
              <button onClick={() => setIsOpen(false)} className="text-apex-gray hover:text-white">
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <p className="text-apex-accent font-semibold mb-2">Thank you!</p>
                <p className="text-sm text-apex-gray">Your feedback has been saved locally.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm text-apex-gray">Category</label>
                  <div className="flex gap-2">
                    {(["bug", "feature", "general"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`flex-1 py-2 rounded-md text-sm capitalize transition-colors ${
                          category === cat
                            ? "bg-apex-primary text-white"
                            : "bg-apex-darker text-apex-gray hover:bg-gray-800"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-apex-gray">Your Feedback</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what you think..."
                    rows={5}
                    className="w-full bg-apex-darker border border-gray-700 rounded-md p-3 outline-none focus:ring-2 focus:ring-apex-primary text-white resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!feedback.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-apex-accent text-apex-darker py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <SendIcon className="w-4 h-4" />
                  Submit Feedback
                </button>

                <p className="text-xs text-apex-gray text-center">
                  Feedback is stored locally on your device for privacy.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
