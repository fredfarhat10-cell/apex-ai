import { getTokens } from "../token-storage"
import { updateSyncTime } from "../integration-manager"

export interface GoogleEmail {
  id: string
  threadId: string
  subject: string
  from: string
  to: string
  snippet: string
  date: string
  labels: string[]
  isUnread: boolean
}

export interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  size: number
  modifiedTime: string
  webViewLink: string
  thumbnailLink?: string
}

/**
 * Fetch Gmail messages
 */
export async function fetchGmailMessages(integrationId: string, maxResults = 20): Promise<GoogleEmail[]> {
  const tokens = await getTokens(integrationId)
  if (!tokens) throw new Error("No tokens found for integration")

  try {
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.statusText}`)
    }

    const data = await response.json()
    const messages: GoogleEmail[] = []

    // Fetch details for each message
    for (const message of data.messages || []) {
      const detailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      })

      if (detailResponse.ok) {
        const detail = await detailResponse.json()
        const headers = detail.payload.headers

        messages.push({
          id: detail.id,
          threadId: detail.threadId,
          subject: headers.find((h: any) => h.name === "Subject")?.value || "No Subject",
          from: headers.find((h: any) => h.name === "From")?.value || "",
          to: headers.find((h: any) => h.name === "To")?.value || "",
          snippet: detail.snippet,
          date: new Date(Number.parseInt(detail.internalDate)).toISOString(),
          labels: detail.labelIds || [],
          isUnread: detail.labelIds?.includes("UNREAD") || false,
        })
      }
    }

    await updateSyncTime(integrationId)
    return messages
  } catch (error) {
    console.error("[v0] Failed to fetch Gmail messages:", error)
    throw error
  }
}

/**
 * Fetch Google Drive files
 */
export async function fetchGoogleDriveFiles(integrationId: string, maxResults = 50): Promise<GoogleDriveFile[]> {
  const tokens = await getTokens(integrationId)
  if (!tokens) throw new Error("No tokens found for integration")

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?pageSize=${maxResults}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink)`,
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.statusText}`)
    }

    const data = await response.json()

    await updateSyncTime(integrationId)
    return data.files || []
  } catch (error) {
    console.error("[v0] Failed to fetch Google Drive files:", error)
    throw error
  }
}

/**
 * Search Gmail messages
 */
export async function searchGmail(integrationId: string, query: string): Promise<GoogleEmail[]> {
  const tokens = await getTokens(integrationId)
  if (!tokens) throw new Error("No tokens found for integration")

  try {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.statusText}`)
    }

    const data = await response.json()
    const messages: GoogleEmail[] = []

    for (const message of (data.messages || []).slice(0, 10)) {
      const detailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      })

      if (detailResponse.ok) {
        const detail = await detailResponse.json()
        const headers = detail.payload.headers

        messages.push({
          id: detail.id,
          threadId: detail.threadId,
          subject: headers.find((h: any) => h.name === "Subject")?.value || "No Subject",
          from: headers.find((h: any) => h.name === "From")?.value || "",
          to: headers.find((h: any) => h.name === "To")?.value || "",
          snippet: detail.snippet,
          date: new Date(Number.parseInt(detail.internalDate)).toISOString(),
          labels: detail.labelIds || [],
          isUnread: detail.labelIds?.includes("UNREAD") || false,
        })
      }
    }

    return messages
  } catch (error) {
    console.error("[v0] Failed to search Gmail:", error)
    throw error
  }
}
