export interface Entity {
  type:
    | "person"
    | "organization"
    | "location"
    | "date"
    | "time"
    | "money"
    | "number"
    | "email"
    | "phone"
    | "url"
    | "custom"
  value: string
  startIndex: number
  endIndex: number
  confidence: number
}

export interface Intent {
  name: string
  confidence: number
  parameters?: Record<string, any>
}

export interface Sentiment {
  label: "positive" | "negative" | "neutral"
  score: number
  confidence: number
}

export interface NLUResult {
  text: string
  entities: Entity[]
  intents: Intent[]
  sentiment: Sentiment
  keywords: string[]
  topics: string[]
  language: string
  timestamp: string
}

export interface NLUStats {
  totalProcessed: number
  averageSentiment: number
  topIntents: Array<{ intent: string; count: number }>
  topEntities: Array<{ entity: string; count: number }>
  topTopics: Array<{ topic: string; count: number }>
}
