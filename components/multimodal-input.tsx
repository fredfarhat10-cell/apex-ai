"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Mic, ImageIcon, Type, Send } from "lucide-react"
import { VoiceRecorder } from "./voice-recorder"
import { ImageUploader } from "./image-uploader"
import type { ImageAnalysisResult } from "@/lib/multimodal/image-analysis"

interface MultimodalInputProps {
  onSubmit: (content: string, type: "text" | "voice" | "image", metadata?: any) => void
}

export function MultimodalInput({ onSubmit }: MultimodalInputProps) {
  const [textInput, setTextInput] = useState("")
  const [activeTab, setActiveTab] = useState("text")

  const handleTextSubmit = () => {
    if (!textInput.trim()) return
    onSubmit(textInput, "text")
    setTextInput("")
  }

  const handleVoiceTranscription = (text: string) => {
    onSubmit(text, "voice")
  }

  const handleImageAnalysis = (result: ImageAnalysisResult) => {
    onSubmit(result.description, "image", result)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multimodal Input</CardTitle>
        <CardDescription>Communicate using text, voice, or images</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">
              <Type className="h-4 w-4 mr-2" />
              Text
            </TabsTrigger>
            <TabsTrigger value="voice">
              <Mic className="h-4 w-4 mr-2" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="image">
              <ImageIcon className="h-4 w-4 mr-2" />
              Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <Textarea
              placeholder="Type your message..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={4}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleTextSubmit()
                }
              }}
            />
            <Button onClick={handleTextSubmit} disabled={!textInput.trim()} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </TabsContent>

          <TabsContent value="voice">
            <VoiceRecorder onTranscription={handleVoiceTranscription} />
          </TabsContent>

          <TabsContent value="image">
            <ImageUploader onAnalysis={handleImageAnalysis} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
