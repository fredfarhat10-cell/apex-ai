"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, XIcon } from "./icons"
import type { WardrobeItem } from "@/lib/types"

interface WardrobeCarouselProps {
  items: WardrobeItem[]
  currentBackground: string | null
  onSetBackground: (imageUrl: string) => void
  onClearBackground: () => void
}

export default function WardrobeCarousel({
  items,
  currentBackground,
  onSetBackground,
  onClearBackground,
}: WardrobeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.offsetWidth
      carouselRef.current.scrollTo({
        left: index * itemWidth,
        behavior: "smooth",
      })
    }
    setCurrentIndex(index)
  }

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
    scrollToIndex(newIndex)
  }

  const handleNext = () => {
    const newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
    scrollToIndex(newIndex)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        const scrollLeft = carouselRef.current.scrollLeft
        const itemWidth = carouselRef.current.offsetWidth
        const index = Math.round(scrollLeft / itemWidth)
        setCurrentIndex(index)
      }
    }

    const carousel = carouselRef.current
    carousel?.addEventListener("scroll", handleScroll)
    return () => carousel?.removeEventListener("scroll", handleScroll)
  }, [])

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-apex-gray">Your wardrobe is empty. Generate a texture to begin.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {currentBackground && (
        <button
          onClick={onClearBackground}
          className="absolute top-0 right-0 z-10 text-xs bg-apex-dark text-apex-gray px-3 py-1.5 rounded-full hover:bg-red-500/20 hover:text-red-400 flex items-center gap-1 transition-all shadow-lg hover:scale-110"
        >
          <XIcon className="w-3 h-3" />
          Clear Background
        </button>
      )}

      <div className="relative group transform-3d">
        {/* Navigation buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-apex-dark/80 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-apex-primary hover:scale-110 shadow-lg glow-cyan"
          aria-label="Previous"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-apex-dark/80 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-apex-primary hover:scale-110 shadow-lg glow-cyan"
          aria-label="Next"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, index) => (
            <div key={item.id} className="flex-shrink-0 w-full snap-center px-4">
              <div
                className={`relative aspect-video bg-apex-darker rounded-2xl overflow-hidden border-2 transition-all card-3d ${
                  currentBackground === item.imageUrl
                    ? "border-apex-primary shadow-lg shadow-apex-primary/50 glow-pulse"
                    : "border-gray-800 hover:border-apex-primary/50"
                }`}
              >
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-full object-cover animate-kenBurns"
                />

                {/* Overlay with info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-all duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3 animate-fadeIn">
                    <p className="text-white text-sm font-medium">{item.name}</p>
                    <p className="text-apex-gray text-xs line-clamp-2">{item.prompt}</p>

                    {currentBackground !== item.imageUrl && (
                      <button
                        onClick={() => onSetBackground(item.imageUrl)}
                        className="w-full bg-apex-primary/90 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg hover:bg-apex-primary transition-all hover:scale-105 flex items-center justify-center gap-2 glow-cyan"
                      >
                        Set as Background
                      </button>
                    )}
                  </div>
                </div>

                {/* Active indicator */}
                {currentBackground === item.imageUrl && (
                  <div className="absolute top-4 right-4 bg-apex-primary text-white rounded-full p-2 shadow-lg animate-pulse-ring">
                    <CheckIcon className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`h-2 rounded-full transition-all hover:scale-125 ${
                index === currentIndex ? "w-8 bg-apex-primary glow-cyan" : "w-2 bg-gray-600 hover:bg-gray-500"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
