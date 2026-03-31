export interface OAuthConfig {
  clientId: string
  redirectUri: string
  scope: string
  authUrl: string
  tokenUrl: string
}

export interface CalendarProvider {
  id: string
  name: string
  config: OAuthConfig
}

// OAuth configurations for different calendar providers
export const calendarProviders: Record<string, CalendarProvider> = {
  google: {
    id: "google",
    name: "Google Calendar",
    config: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      redirectUri: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "",
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
    },
  },
  microsoft: {
    id: "microsoft",
    name: "Microsoft Outlook",
    config: {
      clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || "",
      redirectUri: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "",
      scope: "Calendars.Read offline_access",
      authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    },
  },
  apple: {
    id: "apple",
    name: "Apple Calendar",
    config: {
      clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "",
      redirectUri: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "",
      scope: "calendar",
      authUrl: "https://appleid.apple.com/auth/authorize",
      tokenUrl: "https://appleid.apple.com/auth/token",
    },
  },
}

export function initiateOAuth(providerId: string): Promise<{ accessToken: string; refreshToken?: string }> {
  return new Promise((resolve, reject) => {
    const provider = calendarProviders[providerId]
    if (!provider) {
      reject(new Error("Provider not found"))
      return
    }

    const { config } = provider
    const state = Math.random().toString(36).substring(7)

    // Store state for verification
    sessionStorage.setItem("oauth_state", state)
    sessionStorage.setItem("oauth_provider", providerId)

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: "code",
      scope: config.scope,
      state,
      access_type: "offline",
      prompt: "consent",
    })

    const authUrl = `${config.authUrl}?${params.toString()}`

    // Open OAuth popup
    const width = 600
    const height = 700
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const popup = window.open(
      authUrl,
      "OAuth",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`,
    )

    if (!popup) {
      reject(new Error("Popup blocked"))
      return
    }

    // Listen for OAuth callback
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === "oauth_success") {
        window.removeEventListener("message", handleMessage)
        resolve({
          accessToken: event.data.accessToken,
          refreshToken: event.data.refreshToken,
        })
      } else if (event.data.type === "oauth_error") {
        window.removeEventListener("message", handleMessage)
        reject(new Error(event.data.error))
      }
    }

    window.addEventListener("message", handleMessage)

    // Check if popup was closed
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        window.removeEventListener("message", handleMessage)
        reject(new Error("OAuth cancelled"))
      }
    }, 1000)
  })
}

export async function fetchGoogleCalendarEvents(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100&orderBy=startTime&singleEvents=true&timeMin=" +
      new Date().toISOString(),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error("Failed to fetch Google Calendar events")
  }

  const data = await response.json()
  return data.items.map((item: any) => ({
    id: item.id,
    title: item.summary,
    startTime: item.start.dateTime || item.start.date,
    endTime: item.end.dateTime || item.end.date,
    category: "Synced",
    color: "#4A90E2",
    source: "google",
  }))
}

export async function fetchMicrosoftCalendarEvents(accessToken: string) {
  const response = await fetch(
    "https://graph.microsoft.com/v1.0/me/calendar/events?$top=100&$orderby=start/dateTime&$filter=start/dateTime ge '" +
      new Date().toISOString() +
      "'",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error("Failed to fetch Microsoft Calendar events")
  }

  const data = await response.json()
  return data.value.map((item: any) => ({
    id: item.id,
    title: item.subject,
    startTime: item.start.dateTime,
    endTime: item.end.dateTime,
    category: "Synced",
    color: "#4A90E2",
    source: "microsoft",
  }))
}
