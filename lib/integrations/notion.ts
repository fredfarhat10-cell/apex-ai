import { getTokens } from "../token-storage"
import { updateSyncTime } from "../integration-manager"

export interface NotionPage {
  id: string
  title: string
  url: string
  createdTime: string
  lastEditedTime: string
  properties: Record<string, any>
}

export interface NotionDatabase {
  id: string
  title: string
  description?: string
  createdTime: string
  lastEditedTime: string
}

/**
 * Fetch Notion pages
 */
export async function fetchNotionPages(integrationId: string): Promise<NotionPage[]> {
  const tokens = await getTokens(integrationId)
  if (!tokens) throw new Error("No tokens found for integration")

  try {
    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "object",
          value: "page",
        },
        page_size: 50,
      }),
    })

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.statusText}`)
    }

    const data = await response.json()

    const pages: NotionPage[] = data.results.map((page: any) => ({
      id: page.id,
      title: page.properties?.title?.title?.[0]?.plain_text || "Untitled",
      url: page.url,
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time,
      properties: page.properties,
    }))

    await updateSyncTime(integrationId)
    return pages
  } catch (error) {
    console.error("[v0] Failed to fetch Notion pages:", error)
    throw error
  }
}

/**
 * Fetch Notion databases
 */
export async function fetchNotionDatabases(integrationId: string): Promise<NotionDatabase[]> {
  const tokens = await getTokens(integrationId)
  if (!tokens) throw new Error("No tokens found for integration")

  try {
    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "object",
          value: "database",
        },
        page_size: 50,
      }),
    })

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.statusText}`)
    }

    const data = await response.json()

    const databases: NotionDatabase[] = data.results.map((db: any) => ({
      id: db.id,
      title: db.title?.[0]?.plain_text || "Untitled Database",
      description: db.description?.[0]?.plain_text,
      createdTime: db.created_time,
      lastEditedTime: db.last_edited_time,
    }))

    await updateSyncTime(integrationId)
    return databases
  } catch (error) {
    console.error("[v0] Failed to fetch Notion databases:", error)
    throw error
  }
}

/**
 * Search Notion content
 */
export async function searchNotion(integrationId: string, query: string): Promise<NotionPage[]> {
  const tokens = await getTokens(integrationId)
  if (!tokens) throw new Error("No tokens found for integration")

  try {
    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        page_size: 20,
      }),
    })

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.statusText}`)
    }

    const data = await response.json()

    return data.results.map((page: any) => ({
      id: page.id,
      title: page.properties?.title?.title?.[0]?.plain_text || "Untitled",
      url: page.url,
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time,
      properties: page.properties,
    }))
  } catch (error) {
    console.error("[v0] Failed to search Notion:", error)
    throw error
  }
}
