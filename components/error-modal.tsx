"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { XIcon, AlertTriangleIcon, WifiOffIcon, RefreshCwIcon } from "./icons"
import { Button } from "./ui/button"

export type ErrorType = "api" | "network" | "auth" | "generic"

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: ErrorType
  onRetry?: () => void
}

export function ErrorModal({ isOpen, onClose, title, message, type = "generic", onRetry }: ErrorModalProps) {
  const getIcon = () => {
    switch (type) {
      case "network":
        return <WifiOffIcon className="w-12 h-12 text-red-400" />
      case "api":
        return <AlertTriangleIcon className="w-12 h-12 text-yellow-400" />
      case "auth":
        return <AlertTriangleIcon className="w-12 h-12 text-orange-400" />
      default:
        return <AlertTriangleIcon className="w-12 h-12 text-red-400" />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Close error modal"
              >
                <XIcon className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">{getIcon()}</div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white text-center mb-2">{title}</h2>

              {/* Message */}
              <p className="text-gray-300 text-center mb-6">{message}</p>

              {/* Actions */}
              <div className="flex gap-3">
                {onRetry && (
                  <Button onClick={onRetry} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <RefreshCwIcon className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                )}
                <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Global error handler hook
export function useErrorHandler() {
  const [error, setError] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: ErrorType
    onRetry?: () => void
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "generic",
  })

  const showError = (title: string, message: string, type: ErrorType = "generic", onRetry?: () => void) => {
    setError({ isOpen: true, title, message, type, onRetry })
  }

  const closeError = () => {
    setError((prev) => ({ ...prev, isOpen: false }))
  }

  return { error, showError, closeError }
}
