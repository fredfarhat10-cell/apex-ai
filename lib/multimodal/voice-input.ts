export interface VoiceRecording {
  blob: Blob
  duration: number
  timestamp: string
}

export interface TranscriptionResult {
  text: string
  confidence: number
  language: string
  duration: number
}

/**
 * Check if browser supports voice recording
 */
export function isVoiceSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

/**
 * Start voice recording
 */
export async function startRecording(): Promise<MediaRecorder> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)

    return mediaRecorder
  } catch (error) {
    console.error("[v0] Failed to start recording:", error)
    throw new Error("Microphone access denied or not available")
  }
}

/**
 * Record audio and return blob
 */
export function recordAudio(): Promise<VoiceRecording> {
  return new Promise(async (resolve, reject) => {
    try {
      const mediaRecorder = await startRecording()
      const chunks: BlobPart[] = []
      const startTime = Date.now()

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        const duration = Date.now() - startTime

        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach((track) => track.stop())

        resolve({
          blob,
          duration,
          timestamp: new Date().toISOString(),
        })
      }

      mediaRecorder.onerror = (error) => {
        reject(error)
      }

      mediaRecorder.start()

      // Return the recorder so it can be stopped externally
      ;(mediaRecorder as any).stopRecording = () => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop()
        }
      }
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Transcribe audio using API
 */
export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
  try {
    const formData = new FormData()
    formData.append("audio", audioBlob, "recording.webm")

    const response = await fetch("/api/speech-to-text", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("[v0] Transcription error:", error)
    throw error
  }
}

/**
 * Use Web Speech API for real-time transcription (browser-based)
 */
export function startWebSpeechRecognition(
  onResult: (text: string, isFinal: boolean) => void,
  onError?: (error: any) => void,
): any | null {
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    console.error("[v0] Web Speech API not supported")
    return null
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()

  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = "en-US"

  recognition.onresult = (event: any) => {
    const result = event.results[event.results.length - 1]
    const transcript = result[0].transcript
    const isFinal = result.isFinal

    onResult(transcript, isFinal)
  }

  recognition.onerror = (event: any) => {
    console.error("[v0] Speech recognition error:", event.error)
    if (onError) onError(event.error)
  }

  recognition.start()

  return recognition
}
