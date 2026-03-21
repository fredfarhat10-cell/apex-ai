export class VoiceEngine {
  private synthesis: SpeechSynthesis | null = null
  private recognition: any = null
  private onTranscriptCallback: ((text: string) => void) | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis

      // Initialize speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.lang = "en-US"
      }
    }
  }

  speak(text: string, onStart?: () => void, onEnd?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not supported"))
        return
      }

      // Cancel any ongoing speech
      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Configure voice (prefer female, English)
      const voices = this.synthesis.getVoices()
      const preferredVoice =
        voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")) ||
        voices.find((v) => v.lang.startsWith("en"))

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.rate = 0.95
      utterance.pitch = 1.1
      utterance.volume = 1

      utterance.onstart = () => {
        onStart?.()
      }

      utterance.onend = () => {
        onEnd?.()
        resolve()
      }

      utterance.onerror = (error) => {
        console.error("[v0] Speech synthesis error:", error)
        onEnd?.()
        reject(error)
      }

      this.synthesis.speak(utterance)
    })
  }

  startListening(onTranscript: (text: string) => void, onEnd?: () => void): void {
    if (!this.recognition) {
      console.error("[v0] Speech recognition not supported")
      return
    }

    this.onTranscriptCallback = onTranscript

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log("[v0] Recognized:", transcript)
      onTranscript(transcript)
    }

    this.recognition.onend = () => {
      console.log("[v0] Recognition ended")
      onEnd?.()
    }

    this.recognition.onerror = (event: any) => {
      console.error("[v0] Recognition error:", event.error)
      onEnd?.()
    }

    this.recognition.start()
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop()
    }
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
    }
    this.stopListening()
  }
}
