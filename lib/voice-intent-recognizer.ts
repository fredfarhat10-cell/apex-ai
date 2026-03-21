import type { VoiceIntent } from "./types/voice-command"

/**
 * Enhanced intent recognition for voice commands
 * Maps natural language to specific CrewAI tasks and 3D navigation
 */
export function recognizeVoiceIntent(text: string): VoiceIntent {
  const lowerText = text.toLowerCase()

  // Navigate to Financial Guild
  if (
    (lowerText.includes("show") || lowerText.includes("open") || lowerText.includes("go to")) &&
    (lowerText.includes("financial") || lowerText.includes("finance") || lowerText.includes("money"))
  ) {
    return {
      name: "navigate_financial_guild",
      confidence: 0.95,
      parameters: {},
    }
  }

  // Navigate to Wellness Guild
  if (
    (lowerText.includes("show") || lowerText.includes("open") || lowerText.includes("go to")) &&
    (lowerText.includes("wellness") || lowerText.includes("health") || lowerText.includes("recovery"))
  ) {
    return {
      name: "navigate_wellness_guild",
      confidence: 0.95,
      parameters: {},
    }
  }

  // Navigate to Career Guild
  if (
    (lowerText.includes("show") || lowerText.includes("open") || lowerText.includes("go to")) &&
    (lowerText.includes("career") || lowerText.includes("work") || lowerText.includes("job"))
  ) {
    return {
      name: "navigate_career_guild",
      confidence: 0.95,
      parameters: {},
    }
  }

  // Check recovery score
  if (lowerText.includes("recovery") && (lowerText.includes("score") || lowerText.includes("what"))) {
    return {
      name: "check_recovery_score",
      confidence: 0.9,
      parameters: {},
    }
  }

  // Run simulation
  if (
    (lowerText.includes("run") || lowerText.includes("simulate")) &&
    (lowerText.includes("simulation") || lowerText.includes("what if"))
  ) {
    return {
      name: "run_simulation",
      confidence: 0.85,
      parameters: { query: text },
    }
  }

  // Show life constellation
  if (lowerText.includes("life constellation") || lowerText.includes("show me my life")) {
    return {
      name: "show_life_constellation",
      confidence: 0.95,
      parameters: {},
    }
  }

  // Book ride intent
  if (
    lowerText.includes("book") &&
    (lowerText.includes("uber") || lowerText.includes("lyft") || lowerText.includes("ride"))
  ) {
    return {
      name: "book_ride",
      confidence: 0.9,
      parameters: extractRideParameters(text),
    }
  }

  // Search flights intent
  if (
    (lowerText.includes("find") || lowerText.includes("search")) &&
    (lowerText.includes("flight") || lowerText.includes("plane"))
  ) {
    return {
      name: "search_flights",
      confidence: 0.85,
      parameters: extractFlightParameters(text),
    }
  }

  // Book hotel intent
  if (
    (lowerText.includes("book") || lowerText.includes("find")) &&
    (lowerText.includes("hotel") || lowerText.includes("accommodation"))
  ) {
    return {
      name: "book_hotel",
      confidence: 0.85,
      parameters: extractHotelParameters(text),
    }
  }

  // Plan trip intent
  if (lowerText.includes("plan") && (lowerText.includes("trip") || lowerText.includes("vacation"))) {
    return {
      name: "plan_trip",
      confidence: 0.9,
      parameters: extractTripParameters(text),
    }
  }

  // Generate alpha brief intent
  if (
    (lowerText.includes("research") || lowerText.includes("analyze")) &&
    (lowerText.includes("stock") || lowerText.includes("ticker"))
  ) {
    return {
      name: "generate_alpha_brief",
      confidence: 0.85,
      parameters: extractStockParameters(text),
    }
  }

  // Check calendar intent
  if (lowerText.includes("calendar") || lowerText.includes("schedule") || lowerText.includes("meeting")) {
    return {
      name: "check_calendar",
      confidence: 0.8,
      parameters: extractCalendarParameters(text),
    }
  }

  // Check budget intent
  if (lowerText.includes("budget") || lowerText.includes("spending") || lowerText.includes("money")) {
    return {
      name: "check_budget",
      confidence: 0.8,
      parameters: {},
    }
  }

  // Check energy intent
  if (lowerText.includes("energy") || lowerText.includes("recovery") || lowerText.includes("wellness")) {
    return {
      name: "check_energy",
      confidence: 0.8,
      parameters: {},
    }
  }

  return {
    name: "unknown",
    confidence: 0.3,
    parameters: {},
  }
}

function extractRideParameters(text: string): Record<string, any> {
  const params: Record<string, any> = {}

  // Check for calendar event references
  if (text.toLowerCase().includes("next meeting") || text.toLowerCase().includes("my meeting")) {
    params.destination = "CALENDAR_LOOKUP_NEXT_MEETING"
    params.needsCalendarLookup = true
  } else if (text.match(/\d{1,2}\s*(am|pm|:)/i)) {
    // Extract time-based meeting reference (e.g., "5 PM meeting", "3:30 meeting")
    const timeMatch = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*meeting/i)
    if (timeMatch) {
      params.destination = `CALENDAR_LOOKUP_TIME_${timeMatch[1]}`
      params.meetingTime = timeMatch[1]
      params.needsCalendarLookup = true
    }
  } else {
    // Extract explicit destination
    const toMatch = text.match(/to\s+(?:the\s+)?([^,.]+)/i)
    if (toMatch) {
      params.destination = toMatch[1].trim()
    }
  }

  // Extract service preference
  if (text.toLowerCase().includes("uber")) params.service = "uber"
  if (text.toLowerCase().includes("lyft")) params.service = "lyft"

  if (text.toLowerCase().includes("running late") || text.toLowerCase().includes("urgent")) {
    params.urgent = true
  }

  return params
}

function extractFlightParameters(text: string): Record<string, any> {
  const params: Record<string, any> = {}

  // Extract destination
  const toMatch = text.match(/to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
  if (toMatch) {
    params.destination = toMatch[1].trim()
  }

  // Extract origin
  const fromMatch = text.match(/from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
  if (fromMatch) {
    params.origin = fromMatch[1].trim()
  }

  return params
}

function extractHotelParameters(text: string): Record<string, any> {
  const params: Record<string, any> = {}

  // Extract location
  const inMatch = text.match(/in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
  if (inMatch) {
    params.location = inMatch[1].trim()
  }

  return params
}

function extractTripParameters(text: string): Record<string, any> {
  const params: Record<string, any> = {}

  // Extract destination
  const toMatch = text.match(/to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
  if (toMatch) {
    params.destination = toMatch[1].trim()
  }

  return params
}

function extractStockParameters(text: string): Record<string, any> {
  const params: Record<string, any> = {}

  // Extract ticker symbol (uppercase letters)
  const tickerMatch = text.match(/\b([A-Z]{1,5})\b/)
  if (tickerMatch) {
    params.ticker = tickerMatch[1]
  }

  return params
}

function extractCalendarParameters(text: string): Record<string, any> {
  const params: Record<string, any> = {}

  // Extract time references
  if (text.toLowerCase().includes("today")) params.timeframe = "today"
  if (text.toLowerCase().includes("tomorrow")) params.timeframe = "tomorrow"
  if (text.toLowerCase().includes("this week")) params.timeframe = "week"

  return params
}
