import type { ActionItem } from "./types/action-item"

export const mockActionItems: ActionItem[] = [
  {
    id: "1",
    type: "email",
    title: "Q4 Budget Review Meeting",
    sender: "Sarah Chen",
    source: "sarah.chen@company.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    content: `Hi Team,

I wanted to schedule our Q4 budget review meeting for next week. Based on our current spending patterns, we need to discuss:

1. Marketing budget allocation for the holiday season
2. Engineering headcount planning for Q1
3. Infrastructure costs optimization

Please review the attached spreadsheet before the meeting and come prepared with your department's projections.

Looking forward to a productive discussion.

Best regards,
Sarah`,
    priority: 8,
    summary:
      "Sarah Chen requests Q4 budget review meeting to discuss marketing allocation, Q1 headcount, and infrastructure optimization. Requires spreadsheet review before meeting.",
    suggestedAction:
      "Review attached spreadsheet and prepare your department's Q4 spending analysis and Q1 projections before the meeting.",
    status: "action",
    metadata: {
      threadId: "thread-001",
    },
  },
  {
    id: "2",
    type: "calendar",
    title: "1:1 with Alex - Career Development",
    sender: "Alex Rodriguez",
    source: "Google Calendar",
    timestamp: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
    content: `Meeting: 1:1 with Alex Rodriguez
Time: Today at 3:00 PM - 3:30 PM
Location: Conference Room B

Agenda:
- Q4 Performance Review
- Career Development Goals
- Skill Development Opportunities
- Feedback Session

Alex has requested to discuss your career trajectory and potential growth opportunities within the organization.`,
    priority: 7,
    summary:
      "Career development 1:1 with Alex Rodriguez in 2 hours. Topics: Q4 performance, career goals, skill development, and growth opportunities.",
    suggestedAction:
      "Prepare Q4 accomplishments list, 2-3 career growth questions, and your skill development goals for discussion.",
    status: "action",
    metadata: {
      eventId: "event-001",
    },
  },
  {
    id: "3",
    type: "notion",
    title: "Complete Product Roadmap Document",
    sender: "Product Team",
    source: "Notion",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    content: `Task: Complete Product Roadmap Document
Due: Tomorrow
Priority: High
Assigned by: Product Team

Description:
We need to finalize the Q1 2025 product roadmap document. This should include:

- Feature prioritization matrix
- Resource allocation plan
- Timeline and milestones
- Success metrics and KPIs
- Risk assessment

Please collaborate with engineering and design teams to ensure alignment.`,
    priority: 9,
    summary:
      "High-priority task: Finalize Q1 2025 product roadmap by tomorrow. Requires feature prioritization, resource planning, timeline, KPIs, and risk assessment.",
    suggestedAction:
      "Schedule sync with engineering and design teams today to align on roadmap components. Block 3 hours for document completion.",
    status: "action",
    metadata: {
      taskId: "task-001",
    },
  },
  {
    id: "4",
    type: "apex-insight",
    title: "Proactive Insight: Meeting Preparation",
    sender: "Apex AI",
    source: "Apex Intelligence",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    content: `🎯 Meeting Preparation Insight

Your meeting with Alex Rodriguez is in 2 hours. Based on your recent email exchanges and calendar history, here's what you should know:

Key Context:
- You've been working on the authentication system redesign for 3 weeks
- Alex mentioned interest in your leadership potential in your last 1:1
- Your team shipped 2 major features this quarter

Suggested Talking Points:
1. Highlight the authentication system's 40% performance improvement
2. Express interest in the Tech Lead position that opens in Q1
3. Request mentorship on system architecture decisions

Recommended Preparation:
- Review your Q4 accomplishments document (5 min)
- Prepare 2-3 questions about career growth
- Have your skill development goals ready to discuss`,
    priority: 6,
    summary:
      "AI-generated meeting prep for Alex 1:1. Key context: auth system redesign, leadership potential, Q4 accomplishments. Includes talking points and preparation checklist.",
    suggestedAction:
      "Spend 10 minutes reviewing Q4 wins and preparing 3 specific questions about the Tech Lead role and architecture mentorship.",
    status: "action",
  },
  {
    id: "5",
    type: "email",
    title: "Invoice #2847 - Payment Reminder",
    sender: "Accounting",
    source: "accounting@vendor.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    content: `Dear Customer,

This is a friendly reminder that Invoice #2847 for $1,250.00 is now overdue by 5 days.

Invoice Details:
- Invoice Number: #2847
- Amount Due: $1,250.00
- Original Due Date: January 15, 2025
- Services: Cloud Infrastructure - December 2024

Please process this payment at your earliest convenience to avoid any service interruptions.

If you have already sent payment, please disregard this notice.

Thank you,
Accounting Department`,
    priority: 8,
    summary:
      "OVERDUE: Invoice #2847 for $1,250 (cloud infrastructure) is 5 days past due. Payment required to avoid service interruption.",
    suggestedAction:
      "Forward to accounting department immediately for payment processing. Verify payment status if already sent.",
    status: "action",
    metadata: {
      threadId: "thread-002",
    },
  },
]
