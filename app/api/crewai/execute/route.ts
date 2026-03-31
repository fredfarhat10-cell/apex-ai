import { type NextRequest, NextResponse } from "next/server"
import type { VoiceCommand, VoiceCommandExecution } from "@/lib/types/voice-command"
import { openDB } from "idb"
import { crewAIClient } from "@/lib/crewai-client"

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

export async function POST(request: NextRequest) {
  try {
    const command: VoiceCommand = await request.json()

    // Generate task ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create execution record
    const execution: VoiceCommandExecution = {
      taskId,
      command,
      status: "pending",
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // Store in IndexedDB
    const db = await getDB()
    await db.put(STORE_NAME, execution)

    // Start async execution (call CrewAI backend)
    executeCommandAsync(taskId, command)

    return NextResponse.json({
      success: true,
      taskId,
      message: "Command execution started",
    })
  } catch (error) {
    console.error("[v0] Voice command execution error:", error)
    return NextResponse.json({ success: false, error: "Failed to execute command" }, { status: 500 })
  }
}

async function executeCommandAsync(taskId: string, command: VoiceCommand) {
  const db = await getDB()

  try {
    // Update status to processing
    await updateExecution(db, taskId, {
      status: "processing",
      progress: 10,
      currentStep: "Analyzing command...",
    })

    const result = await crewAIClient.executeVoiceCommand(
      command.userId,
      command.rawText,
      command.intent,
      command.parameters,
    )

    // Check if clarification is needed
    if (result.needs_clarification) {
      await updateExecution(db, taskId, {
        status: "needs_clarification",
        progress: 50,
        clarificationQuestion: result.question,
      })
      return
    }

    // Update with result
    await updateExecution(db, taskId, {
      status: "completed",
      progress: 100,
      currentStep: "Action completed",
      result: result.output,
    })
  } catch (error) {
    console.error("[v0] Command execution failed:", error)
    await updateExecution(db, taskId, {
      status: "failed",
      progress: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

async function updateExecution(db: any, taskId: string, updates: Partial<VoiceCommandExecution>) {
  const execution = await db.get(STORE_NAME, taskId)
  if (execution) {
    Object.assign(execution, updates, { updatedAt: Date.now() })
    await db.put(STORE_NAME, execution)
  }
}
