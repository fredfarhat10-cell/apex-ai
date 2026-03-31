"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, ImageIcon, Loader2, X } from "lucide-react"
import { analyzeImage } from "@/lib/multimodal/image-analysis"
import type { ImageAnalysisResult } from "@/lib/multimodal/image-analysis"

interface ImageUploaderProps {
  onAnalysis: (result: ImageAnalysisResult) => void
}

export function ImageUploader({ onAnalysis }: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ImageAnalysisResult | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    setSelectedImage(file)
    setResult(null)

    // Create preview
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    try {
      const analysis = await analyzeImage(selectedImage)
      setResult(analysis)
      onAnalysis(analysis)
    } catch (error) {
      console.error("[v0] Image analysis failed:", error)
      alert("Failed to analyze image")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setSelectedImage(null)
    setResult(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {!selectedImage ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">Upload an image to analyze</p>
              <Button asChild>
                <label>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Image
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>
              </Button>
            </div>
          ) : (
            <>
              {previewUrl && (
                <div className="relative">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full rounded-lg max-h-96 object-contain"
                  />
                  <Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={handleClear}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {!result && (
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>
              )}

              {result && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                  </div>

                  {result.objects.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Objects Detected</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.objects.map((obj, idx) => (
                          <Badge key={idx} variant="secondary">
                            {obj.name} ({(obj.confidence * 100).toFixed(0)}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.text && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Text Found</h3>
                      <p className="text-sm text-muted-foreground">{result.text}</p>
                    </div>
                  )}

                  {result.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
