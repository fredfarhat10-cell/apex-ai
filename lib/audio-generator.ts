/**
 * Web Audio API utilities for procedural soundscape generation
 * Creates ambient sounds based on user's aura and context
 */

import type { AuraState } from "./types"

export interface SoundscapeConfig {
  aura: AuraState
  duration?: number // seconds
  volume?: number // 0-1
}

export class SoundscapeGenerator {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private oscillators: OscillatorNode[] = []
  private isPlaying = false

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
    }
  }

  /**
   * Generates and plays a soundscape based on aura
   */
  async play(config: SoundscapeConfig): Promise<void> {
    if (!this.audioContext || !this.masterGain) {
      throw new Error("Audio context not available")
    }

    if (this.isPlaying) {
      this.stop()
    }

    const { aura, volume = 0.3 } = config
    this.masterGain.gain.value = volume
    this.isPlaying = true

    const frequencies = this.getFrequenciesForAura(aura)
    const now = this.audioContext.currentTime

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()

      oscillator.type = this.getWaveformForAura(aura)
      oscillator.frequency.value = freq

      // Create subtle variations
      const lfo = this.audioContext!.createOscillator()
      const lfoGain = this.audioContext!.createGain()
      lfo.frequency.value = 0.1 + index * 0.05
      lfoGain.gain.value = 2
      lfo.connect(lfoGain)
      lfoGain.connect(oscillator.frequency)
      lfo.start(now)

      // Envelope
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.1 / frequencies.length, now + 2)

      oscillator.connect(gain)
      gain.connect(this.masterGain!)

      oscillator.start(now)
      this.oscillators.push(oscillator)
    })
  }

  /**
   * Stops the current soundscape
   */
  stop(): void {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime

    this.oscillators.forEach((osc) => {
      try {
        osc.stop(now + 0.5)
      } catch (e) {
        // Oscillator may already be stopped
      }
    })

    this.oscillators = []
    this.isPlaying = false
  }

  /**
   * Adjusts volume
   */
  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }

  /**
   * Gets frequencies based on aura state
   */
  private getFrequenciesForAura(aura: AuraState): number[] {
    const baseFrequencies: Record<AuraState, number[]> = {
      Neutral: [220, 330, 440], // A3, E4, A4 - balanced
      Focused: [256, 384, 512], // C4, G4, C5 - clear, structured
      Creative: [261.63, 329.63, 392, 523.25], // C4, E4, G4, C5 - major chord, uplifting
      Stressed: [174, 285, 396], // Solfeggio frequencies - calming
      Energized: [440, 554.37, 659.25, 880], // A4, C#5, E5, A5 - bright, energetic
      Tired: [136.1, 204.15, 272.2], // Low frequencies - restful
    }

    return baseFrequencies[aura]
  }

  /**
   * Gets waveform type based on aura
   */
  private getWaveformForAura(aura: AuraState): OscillatorType {
    const waveforms: Record<AuraState, OscillatorType> = {
      Neutral: "sine",
      Focused: "triangle",
      Creative: "sine",
      Stressed: "sine",
      Energized: "sawtooth",
      Tired: "sine",
    }

    return waveforms[aura]
  }

  /**
   * Cleans up resources
   */
  dispose(): void {
    this.stop()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

/**
 * Generates a simple notification sound
 */
export function playNotificationSound(): void {
  if (typeof window === "undefined") return

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  oscillator.connect(gain)
  gain.connect(audioContext.destination)

  oscillator.frequency.value = 800
  oscillator.type = "sine"

  const now = audioContext.currentTime
  gain.gain.setValueAtTime(0.3, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

  oscillator.start(now)
  oscillator.stop(now + 0.3)
}
