"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, TrendingUp, Sparkles, CheckCircle } from "lucide-react"
import { getActivePersonality, setActivePersonality, getPersonalityStats } from "@/lib/personality-engine"
import { getAllPersonalityProfiles } from "@/lib/personality-profiles"
import type { PersonalityProfile, PersonalityStats } from "@/lib/types/personality"

export function PersonalitySettings() {
  const [profiles, setProfiles] = useState<PersonalityProfile[]>([])
  const [activeProfile, setActiveProfile] = useState<PersonalityProfile | null>(null)
  const [stats, setStats] = useState<PersonalityStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [allProfiles, active, personalityStats] = await Promise.all([
        getAllPersonalityProfiles(),
        getActivePersonality(),
        getPersonalityStats(),
      ])

      setProfiles(allProfiles)
      setActiveProfile(active)
      setStats(personalityStats)
    } catch (error) {
      console.error("[v0] Failed to load personality data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectProfile = async (profileId: string) => {
    await setActivePersonality(profileId)
    await loadData()
  }

  const getToneColor = (tone: string) => {
    switch (tone) {
      case "enthusiastic":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50"
      case "calm":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      case "serious":
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
      case "playful":
        return "bg-pink-500/20 text-pink-400 border-pink-500/50"
      default:
        return "bg-purple-500/20 text-purple-400 border-purple-500/50"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Adaptive Personality System
          </CardTitle>
          <CardDescription>Customize how Apex communicates with you</CardDescription>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Profile</p>
                <p className="text-lg font-bold">{activeProfile?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Interactions</p>
                <p className="text-2xl font-bold">{stats.totalInteractions}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">{(stats.feedbackScore * 100).toFixed(0)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Preferred Traits</p>
                <p className="text-sm font-medium">{stats.preferredTraits.slice(0, 2).join(", ")}</p>
              </div>
            </div>
          )}

          <Tabs defaultValue="profiles" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profiles">Personality Profiles</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="profiles" className="space-y-3">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading profiles...</p>
              ) : (
                profiles.map((profile) => (
                  <Card key={profile.id} className={activeProfile?.id === profile.id ? "border-primary" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{profile.name}</h3>
                            {activeProfile?.id === profile.id && (
                              <Badge variant="default">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{profile.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getToneColor(profile.emotionalTone)}>{profile.emotionalTone}</Badge>
                        <Badge variant="secondary">{profile.communicationStyle}</Badge>
                        {profile.traits.map((trait, idx) => (
                          <Badge key={idx} variant="outline">
                            {trait}
                          </Badge>
                        ))}
                      </div>

                      {activeProfile?.id !== profile.id && (
                        <Button size="sm" onClick={() => handleSelectProfile(profile.id)} variant="outline">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Activate
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              {stats && (
                <>
                  <Card>
                    <CardContent className="pt-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Your Preferences
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Based on {stats.totalInteractions} interactions, you prefer personalities that are:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {stats.preferredTraits.map((trait, idx) => (
                          <Badge key={idx} variant="secondary">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <h3 className="text-sm font-semibold mb-3">How It Works</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Apex adapts its communication style based on your selected personality</li>
                        <li>• The system learns from your feedback to improve responses</li>
                        <li>• Personality automatically adjusts based on time of day and context</li>
                        <li>• You can switch profiles anytime to match your current needs</li>
                      </ul>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
