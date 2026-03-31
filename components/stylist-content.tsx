"use client"

import type React from "react"
import WardrobeCarousel from "./wardrobe-carousel"
import AnimatedCard from "./animated-card"
import GradientText from "./gradient-text"
import ApexSpinner from "./apex-spinner"
import TemplateSelector from "./template-selector"
import { Sparkles } from "lucide-react"
import { ShirtIcon, SparklesIcon, UploadCloudIcon, Wand2Icon, PlusCircleIcon, FilmIcon } from "./icons"
import Widget from "./widget" // Declare the Widget variable

import { useState } from "react"
import { useVault } from "@/lib/vault-context"
import type { WardrobeItem } from "@/lib/types"
import { getTemplatesByCategory } from "@/lib/templates"

export default function StylistContent() {
  const { wardrobe, appBackground, updateState, symbiontFeed, applyTemplate } = useVault()
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  // Image editing state
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editPrompt, setEditPrompt] = useState("")
  const [editedImage, setEditedImage] = useState<string | null>(null)
  const [editingLoading, setEditingLoading] = useState(false)

  // Video analysis state
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [videoPrompt, setVideoPrompt] = useState("")
  const [videoAnalysis, setVideoAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleGenerateTexture = async () => {
    if (!prompt) return
    setLoading(true)

    try {
      const response = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (data.imageUrl) {
        const newItem: WardrobeItem = {
          id: Date.now().toString(),
          name: prompt.slice(0, 30),
          prompt,
          imageUrl: data.imageUrl,
          createdAt: new Date().toISOString(),
        }
        updateState("wardrobe", [newItem, ...wardrobe])

        const newEvent = {
          id: Date.now().toString(),
          text: `Generated texture: "${prompt.slice(0, 40)}..."`,
          timestamp: new Date().toISOString(),
        }
        updateState("symbiontFeed", [newEvent, ...symbiontFeed])
      }
      setPrompt("")
    } catch (error) {
      console.error("[v0] Texture generation error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedImage(file)
      setEditedImage(null)
      setEditPrompt("")
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTransformImage = async () => {
    if (!uploadedImage || !editPrompt || !imagePreview) return
    setEditingLoading(true)

    try {
      // Simulate image transformation (in production, use actual AI image editing API)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setEditedImage(imagePreview) // For demo, show original
    } catch (error) {
      console.error("[v0] Image transformation error:", error)
    } finally {
      setEditingLoading(false)
    }
  }

  const handleAddEditedToWardrobe = () => {
    if (!editedImage) return
    const newItem: WardrobeItem = {
      id: Date.now().toString(),
      name: editPrompt.slice(0, 30),
      prompt: `Edited with: "${editPrompt}"`,
      imageUrl: editedImage,
      createdAt: new Date().toISOString(),
    }
    updateState("wardrobe", [newItem, ...wardrobe])

    setUploadedImage(null)
    setImagePreview(null)
    setEditPrompt("")
    setEditedImage(null)
  }

  const extractVideoFrames = async (videoFile: File, numFrames: number): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video")
      video.preload = "metadata"
      const reader = new FileReader()

      reader.onload = (e) => {
        if (typeof e.target?.result !== "string") {
          return reject(new Error("Failed to read video file"))
        }
        video.src = e.target.result
      }
      reader.onerror = () => reject(new Error("Error reading file"))
      reader.readAsDataURL(videoFile)

      video.onloadedmetadata = async () => {
        video.muted = true
        video.playsInline = true

        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        if (!context) return reject(new Error("Could not get canvas context"))

        const duration = video.duration
        if (duration <= 0 || !isFinite(duration)) {
          return reject(new Error("Invalid video duration"))
        }

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const frames: string[] = []
        const interval = duration / numFrames

        const captureFrameAt = (time: number) =>
          new Promise<void>((resolve_capture) => {
            const onSeeked = () => {
              context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
              const dataUrl = canvas.toDataURL("image/jpeg")
              frames.push(dataUrl.split(",")[1])
              resolve_capture()
            }
            video.addEventListener("seeked", onSeeked, { once: true })
            video.currentTime = time
          })

        try {
          for (let i = 0; i < numFrames; i++) {
            await captureFrameAt(Math.min(duration, i * interval))
          }
          resolve(frames)
        } catch (err) {
          reject(err as Error)
        }
      }

      video.onerror = () => reject(new Error("Error loading video data"))
    })
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      setVideoAnalysis(null)
      setVideoPrompt("")
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
    }
  }

  const handleAnalyzeVideo = async () => {
    if (!videoFile || !videoPrompt) return
    setIsAnalyzing(true)
    setVideoAnalysis("Extracting frames from video...")

    try {
      const frames = await extractVideoFrames(videoFile, 3)

      setVideoAnalysis("Analyzing frames with AI...")
      const response = await fetch("/api/ai/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames, prompt: videoPrompt }),
      })

      const data = await response.json()
      setVideoAnalysis(data.analysis)

      const newEvent = {
        id: Date.now().toString(),
        text: `Analyzed video: "${videoPrompt.slice(0, 40)}..."`,
        timestamp: new Date().toISOString(),
      }
      updateState("symbiontFeed", [newEvent, ...symbiontFeed])
    } catch (error) {
      setVideoAnalysis("Error analyzing video: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSelectTemplate = (template: any) => {
    applyTemplate(template)
    setShowTemplateSelector(false)
  }

  return (
    <div className="space-y-6">
      {wardrobe.length === 0 && (
        <div className="animate-fadeIn bg-gradient-to-r from-apex-primary/10 to-apex-secondary/10 border border-apex-primary/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-apex-primary" />
                Start with a Template
              </h3>
              <p className="text-apex-gray text-sm">Choose from pre-made wardrobe collections to get inspired</p>
            </div>
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="px-6 py-3 bg-gradient-to-r from-apex-primary to-apex-secondary text-white font-semibold rounded-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Browse Templates
            </button>
          </div>
        </div>
      )}

      <div className="animate-fadeIn">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <ShirtIcon className="w-8 h-8 text-apex-primary animate-pulse-ring" />
          <GradientText>AI Stylist</GradientText>
        </h1>
        <p className="text-apex-gray">
          Translate your internal state and external environment into unique visual concepts.
        </p>
      </div>

      <AnimatedCard className="animate-fadeIn" style={{ animationDelay: "100ms" } as any}>
        <Widget title="Mind Scan to Texture" icon={<SparklesIcon className="text-apex-primary animate-pulse" />}>
          <div className="flex gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Calm rainy evening in a neon-lit Tokyo street"
              className="flex-grow bg-apex-darker border border-gray-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-apex-primary text-white transition-all hover:border-apex-primary/50"
              onKeyDown={(e) => e.key === "Enter" && handleGenerateTexture()}
            />
            <button
              onClick={handleGenerateTexture}
              disabled={loading}
              className="bg-gradient-to-r from-apex-primary to-apex-secondary text-white font-semibold py-2 px-6 rounded-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              {loading ? (
                <>
                  <ApexSpinner size={16} />
                  Weaving...
                </>
              ) : (
                "Weave"
              )}
            </button>
          </div>
        </Widget>
      </AnimatedCard>

      <AnimatedCard className="animate-fadeIn" style={{ animationDelay: "200ms" } as any} glowOnHover>
        <Widget title="Image Alchemy" icon={<Wand2Icon className="text-apex-primary" />}>
          {!imagePreview && (
            <label
              htmlFor="image-upload"
              className="relative block w-full border-2 border-gray-600 border-dashed rounded-lg p-12 text-center hover:border-apex-primary/50 cursor-pointer transition-all hover:bg-apex-darker/50"
            >
              <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400 animate-float" />
              <span className="mt-2 block text-sm font-medium text-apex-light">Upload an image</span>
              <input id="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
            </label>
          )}

          {imagePreview && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="animate-fadeIn">
                  <p className="text-sm font-semibold mb-2 text-apex-gray">Original</p>
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="upload preview"
                    className="rounded-lg w-full object-contain border border-gray-700 transition-all hover:border-apex-primary/50"
                  />
                </div>
                <div className="animate-fadeIn" style={{ animationDelay: "100ms" }}>
                  <p className="text-sm font-semibold mb-2 text-apex-gray">Result</p>
                  <div className="aspect-square bg-apex-darker rounded-lg flex items-center justify-center border border-gray-700 p-4">
                    {editingLoading ? (
                      <div className="text-center">
                        <ApexSpinner size={32} />
                        <p className="text-sm text-apex-gray mt-4">Alchemizing your image...</p>
                      </div>
                    ) : editedImage ? (
                      <img
                        src={editedImage || "/placeholder.svg"}
                        alt="edited result"
                        className="rounded-lg max-w-full max-h-full object-contain animate-fadeIn"
                      />
                    ) : (
                      <p className="text-sm text-apex-gray text-center">Your transformed image will appear here.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="e.g., Add a surreal glow, change background..."
                  className="flex-grow bg-apex-darker border border-gray-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-apex-primary text-white transition-all hover:border-apex-primary/50"
                  onKeyDown={(e) => e.key === "Enter" && handleTransformImage()}
                />
                <button
                  onClick={handleTransformImage}
                  disabled={editingLoading || !editPrompt}
                  className="bg-apex-primary text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                >
                  {editingLoading ? "Transforming..." : "Transform"}
                </button>
              </div>

              {editedImage && (
                <div className="flex items-center gap-4 animate-fadeIn">
                  <button
                    onClick={handleAddEditedToWardrobe}
                    className="bg-apex-accent text-apex-darker font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(103,232,249,0.4)]"
                  >
                    <PlusCircleIcon className="w-4 h-4" /> Add to Wardrobe
                  </button>
                  <button
                    onClick={() => {
                      setUploadedImage(null)
                      setImagePreview(null)
                    }}
                    className="text-sm text-apex-gray hover:text-apex-light transition-colors"
                  >
                    Start over
                  </button>
                </div>
              )}
            </div>
          )}
        </Widget>
      </AnimatedCard>

      <AnimatedCard className="animate-fadeIn" style={{ animationDelay: "300ms" } as any} glowOnHover>
        <Widget title="Video Virtuoso" icon={<FilmIcon className="text-apex-primary" />}>
          {!videoPreview ? (
            <label
              htmlFor="video-upload"
              className="relative block w-full border-2 border-gray-600 border-dashed rounded-lg p-12 text-center hover:border-apex-primary/50 cursor-pointer transition-all hover:bg-apex-darker/50"
            >
              <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400 animate-float" />
              <span className="mt-2 block text-sm font-medium text-apex-light">Upload a short video</span>
              <input id="video-upload" type="file" className="sr-only" accept="video/*" onChange={handleVideoUpload} />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="animate-fadeIn">
                  <p className="text-sm font-semibold mb-2 text-apex-gray">Video Preview</p>
                  <video
                    controls
                    src={videoPreview}
                    className="rounded-lg w-full border border-gray-700 transition-all hover:border-apex-primary/50"
                  />
                </div>
                <div
                  className="bg-apex-darker rounded-lg p-4 border border-gray-700 animate-fadeIn"
                  style={{ animationDelay: "100ms" }}
                >
                  <p className="text-sm font-semibold mb-2 text-apex-gray">AI Analysis</p>
                  <div className="prose prose-invert prose-sm max-w-none text-apex-light min-h-[150px]">
                    {isAnalyzing && !videoAnalysis && (
                      <div className="flex flex-col items-center justify-center py-8">
                        <ApexSpinner size={32} />
                        <p className="text-sm text-apex-gray mt-4">Analyzing video...</p>
                      </div>
                    )}
                    {videoAnalysis && <p className="whitespace-pre-wrap text-sm animate-fadeIn">{videoAnalysis}</p>}
                    {!isAnalyzing && !videoAnalysis && (
                      <p className="text-apex-gray">Your video analysis will appear here.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="e.g., Analyze my form, what is the mood of this scene?"
                  className="flex-grow bg-apex-darker border border-gray-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-apex-primary text-white transition-all hover:border-apex-primary/50"
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyzeVideo()}
                />
                <button
                  onClick={handleAnalyzeVideo}
                  disabled={isAnalyzing || !videoPrompt}
                  className="bg-apex-primary text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
                </button>
              </div>
              <button
                onClick={() => {
                  setVideoFile(null)
                  setVideoPreview(null)
                }}
                className="text-sm text-apex-gray hover:text-apex-light transition-colors"
              >
                Start over
              </button>
            </div>
          )}
        </Widget>
      </AnimatedCard>

      <AnimatedCard className="animate-fadeIn" style={{ animationDelay: "400ms" } as any}>
        <Widget title="Wardrobe Carousel">
          <WardrobeCarousel
            items={wardrobe}
            currentBackground={appBackground}
            onSetBackground={(imageUrl) => updateState("appBackground", imageUrl)}
            onClearBackground={() => updateState("appBackground", null)}
          />
        </Widget>
      </AnimatedCard>

      {showTemplateSelector && (
        <TemplateSelector
          templates={getTemplatesByCategory("stylist")}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  )
}
