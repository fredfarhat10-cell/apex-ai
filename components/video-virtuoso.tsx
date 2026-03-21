"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { extractFrames, analyzeVideo, validateVideoFile, type VideoFrame } from "@/lib/video-processor"
import { Spinner } from "@/components/spinner"
import { UploadIcon, PlayIcon, SparklesIcon } from "./icons"

export function VideoVirtuoso() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [frames, setFrames] = useState<VideoFrame[]>([])
  const [analysis, setAnalysis] = useState<string>("")
  const [prompt, setPrompt] = useState("Analyze the movement and technique in this video")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateVideoFile(file)
    if (!validation.valid) {
      setError(validation.error || "Invalid file")
      return
    }

    setVideoFile(file)
    setError("")
    setFrames([])
    setAnalysis("")
  }

  const handleExtractFrames = async () => {
    if (!videoFile) return

    setIsProcessing(true)
    setError("")

    try {
      const { frames: extractedFrames, metadata } = await extractFrames(videoFile, {
        maxFrames: 10,
        interval: 1,
        quality: 0.7,
      })

      setFrames(extractedFrames)
      console.log("[v0] Extracted frames:", extractedFrames.length, "Metadata:", metadata)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract frames")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAnalyze = async () => {
    if (frames.length === 0) return

    setIsAnalyzing(true)
    setError("")

    try {
      const result = await analyzeVideo(frames, prompt)

      if (result.error) {
        setError(result.error)
      } else {
        setAnalysis(result.analysis)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze video")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-apex-dark border-apex-primary/20">
        <h2 className="text-2xl font-bold text-apex-light mb-4 flex items-center gap-2">
          <SparklesIcon className="text-apex-primary" />
          Video Virtuoso
        </h2>
        <p className="text-apex-gray mb-6">
          Upload a video to extract frames and analyze with AI. Perfect for technique analysis, movement tracking, or
          visual insights.
        </p>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full bg-transparent border-apex-primary/30 hover:bg-apex-primary/10"
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              {videoFile ? videoFile.name : "Select Video File"}
            </Button>
          </div>

          {/* Extract Frames */}
          {videoFile && frames.length === 0 && (
            <Button onClick={handleExtractFrames} disabled={isProcessing} className="w-full">
              {isProcessing ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Extracting Frames...
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Extract Frames
                </>
              )}
            </Button>
          )}

          {/* Frame Preview */}
          {frames.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-apex-light mb-2">Extracted Frames ({frames.length})</h3>
              <div className="grid grid-cols-5 gap-2">
                {frames.slice(0, 10).map((frame, index) => (
                  <img
                    key={index}
                    src={frame.dataUrl || "/placeholder.svg"}
                    alt={`Frame ${index + 1}`}
                    className="w-full h-auto rounded border border-apex-gray/20"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Analysis Prompt */}
          {frames.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-apex-light mb-2">Analysis Prompt</label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What would you like to analyze?"
                className="w-full px-4 py-2 bg-apex-darker border border-apex-gray/30 rounded-lg text-apex-light focus:outline-none focus:border-apex-primary"
              />
            </div>
          )}

          {/* Analyze Button */}
          {frames.length > 0 && (
            <Button onClick={handleAnalyze} disabled={isAnalyzing || !prompt} className="w-full">
              {isAnalyzing ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Analyze Video
                </>
              )}
            </Button>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="p-4 bg-apex-darker border border-apex-primary/20 rounded-lg">
              <h3 className="text-sm font-semibold text-apex-primary mb-2">AI Analysis</h3>
              <div className="text-sm text-apex-light whitespace-pre-wrap">{analysis}</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
