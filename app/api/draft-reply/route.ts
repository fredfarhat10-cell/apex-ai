import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { emailContent, senderEmail, emailSubject, itemId } = body

    if (!emailContent || !senderEmail) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

    if (isDemoMode) {
      // Generate a mock contextual reply in demo mode
      const mockReply = generateMockReply(emailContent, senderEmail, emailSubject)
      return NextResponse.json({
        success: true,
        draft: mockReply,
        source: "demo",
      })
    }

    // In live mode, call the CrewAI backend
    const crewaiUrl = process.env.NEXT_PUBLIC_CREWAI_API_URL || "http://localhost:5000"

    const response = await fetch(`${crewaiUrl}/api/tasks/draft_contextual_reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_content: emailContent,
        sender_email: senderEmail,
        email_subject: emailSubject,
        user_id: request.headers.get("x-user-id") || "default-user",
      }),
    })

    if (!response.ok) {
      throw new Error(`CrewAI backend error: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      draft: data.draft || "",
      context: data.context || {},
      confidence: data.confidence || "medium",
      source: "live",
    })
  } catch (error) {
    console.error("[v0] Error drafting reply:", error)

    // Fallback to mock reply on error
    const { emailContent, senderEmail, emailSubject } = await request.json()
    const mockReply = generateMockReply(emailContent, senderEmail, emailSubject)

    return NextResponse.json({
      success: true,
      draft: mockReply,
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

function generateMockReply(emailContent: string, senderEmail: string, emailSubject: string): string {
  // Extract sender name from email
  const senderName = senderEmail
    .split("@")[0]
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())

  // Detect if it's a meeting request
  const isMeetingRequest =
    emailContent.toLowerCase().includes("meeting") ||
    emailContent.toLowerCase().includes("schedule") ||
    emailContent.toLowerCase().includes("discuss")

  // Detect if it's a sales pitch
  const isSalesPitch =
    emailContent.toLowerCase().includes("offer") ||
    emailContent.toLowerCase().includes("pricing") ||
    emailContent.toLowerCase().includes("purchase") ||
    emailContent.toLowerCase().includes("buy")

  if (isMeetingRequest) {
    return `Hi ${senderName},

Thanks for reaching out about ${emailSubject.toLowerCase().replace(/^re:\s*/i, "")}.

Based on my calendar, I'm available:
- Tuesday at 2:00 PM
- Thursday at 10:00 AM  
- Friday at 3:00 PM

Let me know which time works best for you, and I'll send over a calendar invite.

Looking forward to connecting!

Best regards`
  }

  if (isSalesPitch) {
    return `Hi ${senderName},

Thank you for sharing information about ${emailSubject.toLowerCase().replace(/^re:\s*/i, "")}.

This looks interesting, but it's not within our current budget allocation for this quarter. I'll keep it in mind for future consideration when we review our Q2 priorities.

I appreciate you thinking of us!

Best regards`
  }

  // Generic professional reply
  return `Hi ${senderName},

Thank you for your email regarding ${emailSubject.toLowerCase().replace(/^re:\s*/i, "")}.

I've reviewed your message and will get back to you with a detailed response by end of week. If this is time-sensitive, please let me know and I'll prioritize accordingly.

Best regards`
}
