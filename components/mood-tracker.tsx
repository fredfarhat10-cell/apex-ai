"use client"

import { useState } from "react"
import { useVault } from "@/lib/vault-context"
import type { AuraState, MoodEntry } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { BrainCircuit, Sparkles, CloudRain, Zap, Sun, TrendingUp } from "lucide-react"
import { TrendAnalyzer } from "@/lib/trend-analyzer"
import { Moon as Mo } from "lucide-react" // Declaring the missing JSX variable

const auraIcons: Record<AuraState, JSX.Element> = {
  Neutral: <Sun size={24} />,
  Focused: <BrainCircuit size={24} />,
  Creative: <Sparkles size={24} />,
  Stressed: <CloudRain size={24} />,
  Energized: <Zap size={24} />,
  Tired: <Mo size={24} />, // Using the declared JSX variable
}

export default function MoodTracker() {
  const { aura, moodHistory, updateState, ...state } = useVault()
  const [intensity, setIntensity] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [stress, setStress] = useState(3)
  const [motivation, setMotivation] = useState(3)
  const [notes, setNotes] = useState("")
  const [showHistory, setShowHistory] = useState(false)

  const handleSaveMood = () => {
    const newMood: MoodEntry = {
      id: Date.now().toString(),
      aura,
      intensity,
      energy,
      stress,
      motivation,
      timestamp: new Date().toISOString(),
      notes: notes.trim() || undefined,
    }

    const updatedHistory = [...moodHistory, newMood]
    updateState("moodHistory", updatedHistory)

    // Update trend analysis
    const analysis = TrendAnalyzer.analyze({ ...state, moodHistory: updatedHistory, aura })
    updateState("trendAnalysis", analysis)

    // Reset form
    setNotes("")
    alert("Mood logged successfully!")
  }

  const recentMoods = [...moodHistory].reverse().slice(0, 5)

  return (
    <Card className="bg-apex-dark border-gray-800 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-apex-accent" size={24} />
          Mood Tracker
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? "Hide" : "Show"} History
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-apex-darker rounded-lg">
          <span className="text-apex-accent">{auraIcons[aura]}</span>
          <div>
            <p className="text-sm text-apex-gray">Current Aura</p>
            <p className="text-lg font-semibold text-white">{aura}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-apex-gray mb-2 block">Intensity (1-5)</label>
            <Slider value={[intensity]} onValueChange={(v) => setIntensity(v[0])} min={1} max={5} step={1} />
            <p className="text-xs text-apex-gray text-right mt-1">{intensity}/5</p>
          </div>

          <div>
            <label className="text-sm text-apex-gray mb-2 block">Energy Level (1-5)</label>
            <Slider value={[energy]} onValueChange={(v) => setEnergy(v[0])} min={1} max={5} step={1} />
            <p className="text-xs text-apex-gray text-right mt-1">{energy}/5</p>
          </div>

          <div>
            <label className="text-sm text-apex-gray mb-2 block">Stress Level (1-5)</label>
            <Slider value={[stress]} onValueChange={(v) => setStress(v[0])} min={1} max={5} step={1} />
            <p className="text-xs text-apex-gray text-right mt-1">{stress}/5</p>
          </div>

          <div>
            <label className="text-sm text-apex-gray mb-2 block">Motivation (1-5)</label>
            <Slider value={[motivation]} onValueChange={(v) => setMotivation(v[0])} min={1} max={5} step={1} />
            <p className="text-xs text-apex-gray text-right mt-1">{motivation}/5</p>
          </div>

          <div>
            <label className="text-sm text-apex-gray mb-2 block">Notes (Optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling? Any context..."
              className="bg-apex-darker border-gray-700 text-white"
              rows={3}
            />
          </div>
        </div>

        <Button onClick={handleSaveMood} className="w-full bg-apex-primary hover:bg-apex-primary/80">
          Log Mood
        </Button>
      </div>

      {showHistory && recentMoods.length > 0 && (
        <div className="space-y-3 animate-fadeIn">
          <h4 className="text-sm font-semibold text-apex-accent">Recent Moods</h4>
          {recentMoods.map((mood) => (
            <div key={mood.id} className="p-3 bg-apex-darker rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-apex-accent">{auraIcons[mood.aura]}</span>
                  <span className="text-sm font-medium text-white">{mood.aura}</span>
                </div>
                <span className="text-xs text-apex-gray">{new Date(mood.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-apex-gray">Intensity</p>
                  <p className="text-white font-medium">{mood.intensity}/5</p>
                </div>
                <div>
                  <p className="text-apex-gray">Energy</p>
                  <p className="text-white font-medium">{mood.energy}/5</p>
                </div>
                <div>
                  <p className="text-apex-gray">Stress</p>
                  <p className="text-white font-medium">{mood.stress}/5</p>
                </div>
                <div>
                  <p className="text-apex-gray">Motivation</p>
                  <p className="text-white font-medium">{mood.motivation}/5</p>
                </div>
              </div>
              {mood.notes && <p className="text-xs text-apex-gray italic">{mood.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
