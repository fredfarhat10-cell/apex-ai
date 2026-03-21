"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Target, TrendingUp, Zap, Edit2, Save } from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Fred",
    sportGoal: "Complete a marathon in under 4 hours",
    financialGoal: "Build a diversified portfolio with 8% annual returns",
    trainingDays: "4-5 times per week",
    riskTolerance: "Moderate",
    energyPeak: "Morning (6-10 AM)",
  })

  const handleSave = () => {
    // TODO: Save profile updates to backend/vault
    console.log("[v0] Saving profile updates:", profile)
    setIsEditing(false)
    alert("Profile updated successfully!")
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Profile & Personalization</h1>
          <p className="text-[#888888] text-lg">Review how Apex AI understands you and customize your preferences</p>
        </div>

        {/* AI Persona Summary */}
        <Card className="bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8533]/20 border-[#FF6B00]/30 p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8533] flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-3">Your High-Performer Persona</h2>
              <p className="text-[#E5E7EB] leading-relaxed">
                Based on your data, you are a{" "}
                <span className="text-[#FF6B00] font-semibold">growth-oriented investor</span> who trains{" "}
                <span className="text-[#FF6B00] font-semibold">{profile.trainingDays}</span> with a focus on{" "}
                <span className="text-[#FF6B00] font-semibold">endurance</span>. Your current energy cycle peaks in the{" "}
                <span className="text-[#FF6B00] font-semibold">{profile.energyPeak.toLowerCase()}</span>, making this
                your optimal time for high-intensity work and training.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0A0A0A]/50 rounded-xl p-5 border border-[#FF6B00]/20">
              <Zap className="w-6 h-6 text-[#FF6B00] mb-2" />
              <div className="text-2xl font-bold text-white mb-1">82%</div>
              <div className="text-sm text-[#888888]">Avg Energy Level</div>
            </div>
            <div className="bg-[#0A0A0A]/50 rounded-xl p-5 border border-[#FF6B00]/20">
              <Target className="w-6 h-6 text-[#FF6B00] mb-2" />
              <div className="text-2xl font-bold text-white mb-1">12</div>
              <div className="text-sm text-[#888888]">Active Goals</div>
            </div>
            <div className="bg-[#0A0A0A]/50 rounded-xl p-5 border border-[#FF6B00]/20">
              <TrendingUp className="w-6 h-6 text-[#FF6B00] mb-2" />
              <div className="text-2xl font-bold text-white mb-1">94%</div>
              <div className="text-sm text-[#888888]">Goal Completion</div>
            </div>
          </div>
        </Card>

        {/* Editable Goals & Preferences */}
        <Card className="bg-[#111111] border-[#222222] p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Core Goals & Preferences</h2>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <Button onClick={handleSave} className="bg-[#FF6B00] hover:bg-[#FF8533] text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-white font-medium mb-2 block">Name</Label>
              {isEditing ? (
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="bg-[#1A1A1A] border-gray-800 text-white"
                />
              ) : (
                <p className="text-gray-300">{profile.name}</p>
              )}
            </div>

            <div>
              <Label className="text-white font-medium mb-2 block">Sport Goal</Label>
              {isEditing ? (
                <Textarea
                  value={profile.sportGoal}
                  onChange={(e) => setProfile({ ...profile, sportGoal: e.target.value })}
                  className="bg-[#1A1A1A] border-gray-800 text-white"
                  rows={2}
                />
              ) : (
                <p className="text-gray-300">{profile.sportGoal}</p>
              )}
            </div>

            <div>
              <Label className="text-white font-medium mb-2 block">Financial Goal</Label>
              {isEditing ? (
                <Textarea
                  value={profile.financialGoal}
                  onChange={(e) => setProfile({ ...profile, financialGoal: e.target.value })}
                  className="bg-[#1A1A1A] border-gray-800 text-white"
                  rows={2}
                />
              ) : (
                <p className="text-gray-300">{profile.financialGoal}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-white font-medium mb-2 block">Training Frequency</Label>
                {isEditing ? (
                  <Input
                    value={profile.trainingDays}
                    onChange={(e) => setProfile({ ...profile, trainingDays: e.target.value })}
                    className="bg-[#1A1A1A] border-gray-800 text-white"
                  />
                ) : (
                  <p className="text-gray-300">{profile.trainingDays}</p>
                )}
              </div>

              <div>
                <Label className="text-white font-medium mb-2 block">Risk Tolerance</Label>
                {isEditing ? (
                  <select
                    value={profile.riskTolerance}
                    onChange={(e) => setProfile({ ...profile, riskTolerance: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-800 rounded-lg text-white"
                  >
                    <option value="Conservative">Conservative</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Aggressive">Aggressive</option>
                  </select>
                ) : (
                  <p className="text-gray-300">{profile.riskTolerance}</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-white font-medium mb-2 block">Energy Peak Time</Label>
              {isEditing ? (
                <Input
                  value={profile.energyPeak}
                  onChange={(e) => setProfile({ ...profile, energyPeak: e.target.value })}
                  className="bg-[#1A1A1A] border-gray-800 text-white"
                />
              ) : (
                <p className="text-gray-300">{profile.energyPeak}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Data Privacy Notice */}
        <Card className="bg-[#111111] border-[#FF6B00]/30 p-6 mt-8">
          <p className="text-sm text-[#888888] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            All your data is encrypted and stored securely in your personal vault. Apex AI uses this information solely
            to personalize your experience.
          </p>
        </Card>
      </div>
    </div>
  )
}
