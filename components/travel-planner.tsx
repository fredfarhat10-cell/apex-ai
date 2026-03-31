"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Users, DollarSign, Plane, Compass } from "lucide-react"
import { AIFeedback } from "@/components/ai-feedback"

export function TravelPlanner() {
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
    budget: "",
    interests: "",
  })
  const [isPlanning, setIsPlanning] = useState(false)
  const [itinerary, setItinerary] = useState<any>(null)
  const [itineraryId, setItineraryId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPlanning(true)

    try {
      const response = await fetch("/api/travel/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? Number.parseFloat(formData.budget) : undefined,
          interests: formData.interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Poll for completion
        const taskId = data.taskId
        const pollInterval = setInterval(async () => {
          const statusResponse = await fetch(`/api/travel/plan?taskId=${taskId}`)
          const statusData = await statusResponse.json()

          if (statusData.status === "completed") {
            clearInterval(pollInterval)
            setItinerary(statusData.itinerary)
            setItineraryId(taskId)
            setIsPlanning(false)
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval)
            setIsPlanning(false)
            alert("Failed to generate travel plan. Please try again.")
          }
        }, 3000)
      }
    } catch (error) {
      console.error("Error planning travel:", error)
      setIsPlanning(false)
      alert("Failed to plan travel. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Plan Your Perfect Getaway
          </CardTitle>
          <CardDescription>Let Apex AI agents research and plan your entire trip in 60 seconds</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destination">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Destination
                </Label>
                <Input
                  id="destination"
                  placeholder="e.g., Paris, Tokyo, Bali"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelers">
                  <Users className="inline h-4 w-4 mr-1" />
                  Travelers
                </Label>
                <Input
                  id="travelers"
                  type="number"
                  min="1"
                  value={formData.travelers}
                  onChange={(e) => setFormData({ ...formData, travelers: Number.parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Budget (Optional)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Total budget in USD"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">
                  <Compass className="inline h-4 w-4 mr-1" />
                  Interests (Optional)
                </Label>
                <Input
                  id="interests"
                  placeholder="e.g., food, adventure, culture"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPlanning}>
              {isPlanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  AI Agents Planning Your Trip...
                </>
              ) : (
                <>
                  <Plane className="mr-2 h-4 w-4" />
                  Generate Travel Plan
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {itinerary && itineraryId && (
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Itinerary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: itinerary }} />
            </div>
            <AIFeedback
              outputId={itineraryId}
              outputType="travel_plan"
              onFeedback={(feedback) => {
                console.log("[v0] Travel plan feedback:", feedback)
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
