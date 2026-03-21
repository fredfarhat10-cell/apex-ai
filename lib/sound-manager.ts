const SOUND_ENABLED_KEY = "apex_sound_enabled"

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false
  const stored = localStorage.getItem(SOUND_ENABLED_KEY)
  return stored !== "false" // Default to true
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return
  localStorage.setItem(SOUND_ENABLED_KEY, enabled.toString())
}

export function toggleSound(): boolean {
  const current = isSoundEnabled()
  setSoundEnabled(!current)
  return !current
}

// Simple beep sounds using Web Audio API
export function playSound(type: "click" | "success" | "notification" | "error") {
  if (!isSoundEnabled() || typeof window === "undefined") return

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  const sounds = {
    click: { freq: 800, type: "sine", duration: 0.05 },
    notification: { freq: 1200, type: "triangle", duration: 0.1 },
    success: { freq: 1500, type: "sine", duration: 0.15 },
    error: { freq: 400, type: "sine", duration: 0.1 },
  }

  const sound = sounds[type]
  oscillator.frequency.value = sound.freq
  oscillator.type = sound.type as OscillatorType

  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + sound.duration)
}
