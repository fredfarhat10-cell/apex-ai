import { type NextRequest, NextResponse } from "next/server"
import { openDB } from "idb"

const DB_NAME = "apex-voice-commands"
const STORE_NAME = "executions"

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "taskId" })
      }
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("task_id")

    if (!taskId) {
      return NextResponse.json({ success: false, error: "Missing task_id parameter" }, { status: 400 })
    }

    const db = await getDB()
    const execution = await db.get(STORE_NAME, taskId)

    if (!execution) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      execution,
    })
  } catch (error) {
    console.error("[v0] Status check error:", error)
    return NextResponse.json({ success: false, error: "Failed to check status" }, { status: 500 })
  }
}
