function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface ReplyConfig {
  tone?: "motivating" | "friendly" | "professional"
}

interface TaskEvent {
  type: "task_completed" | "task_added" | "task_deleted"
  task: any
}

const replies: Record<string, Record<string, string[]>> = {
  motivating: {
    task_completed: [
      "Nice — that's done. Momentum is your friend!",
      "Another one off the list. Keep building that streak!",
      "Progress looks great today — keep it up!",
      "Excellent work! You're on fire today.",
      "That's the spirit! One step closer to your goals.",
    ],
    task_added: [
      "Got it! Let's make it happen.",
      "Added to your list. You've got this!",
      "New task locked in. Time to conquer it!",
    ],
  },
  friendly: {
    task_completed: [
      "Awesome job! 💪",
      "Done! Apex is impressed 👏",
      "You're crushing it today!",
      "Nice work! Keep the momentum going!",
    ],
    task_added: ["Added! Let's do this! 🚀", "On your list now! 📝", "Got it! Ready when you are!"],
  },
  professional: {
    task_completed: [
      "Task completed successfully.",
      "Marked as complete. Well done.",
      "Completed. Moving forward efficiently.",
      "Task finalized. Excellent progress.",
    ],
    task_added: ["Task added to your queue.", "New task registered.", "Added to your task list."],
  },
}

export function getReply(event: TaskEvent, config?: ReplyConfig) {
  const tone = config?.tone || "motivating"
  const pool = replies[tone]?.[event.type] || []
  return pick(pool) || "Task complete."
}
