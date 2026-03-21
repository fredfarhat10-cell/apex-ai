// In lib/voice-engine.ts

export class VoiceEngine {
  private recognition: any = null;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        // ... (recognition setup remains the same)
      }
    }
  }

  async speak(text: string, onStart?: () => void, onEnd?: () => void): Promise<void> {
    this.stop(); // Stop any currently playing audio
    onStart?.();

    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch voice from API.");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.play();
      
      this.currentAudio.onended = () => {
        onEnd?.();
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
      };

    } catch (error) {
      console.error("Voice synthesis error:", error);
      onEnd?.(); // Ensure onEnd is called even on error
    }
  }

  // ... (startListening and stopListening methods remain the same)
  
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.stopListening();
  }
}
