"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { useCustomization } from "@/lib/customization-context"

interface GestureHandlerProps {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  children: React.ReactNode
}

export function GestureHandler({ onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, children }: GestureHandlerProps) {
  const { settings } = useCustomization()
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchEndX = useRef(0)
  const touchEndY = useRef(0)

  useEffect(() => {
    if (!settings.gesturesEnabled) return

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX
      touchEndY.current = e.touches[0].clientY
    }

    const handleTouchEnd = () => {
      const deltaX = touchEndX.current - touchStartX.current
      const deltaY = touchEndY.current - touchStartY.current
      const minSwipeDistance = 50

      // Horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }
      // Vertical swipe
      else if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown()
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp()
        }
      }
    }

    document.addEventListener("touchstart", handleTouchStart)
    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [settings.gesturesEnabled, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return <>{children}</>
}
