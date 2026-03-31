import type React from "react"
import type { Metadata } from "next"
import "./gains.css"

export const metadata: Metadata = {
  title: "GAINS Institute — Governance, AI Stewardship & Sustainability",
  description:
    "GAINS Institute advances responsible governance, AI stewardship, and sustainability through executive education, strategic advisory, and applied research for boards, institutions, and senior leaders.",
  keywords: [
    "governance",
    "AI stewardship",
    "sustainability",
    "executive education",
    "board advisory",
    "institutional governance",
    "ESG",
    "responsible AI",
    "strategic advisory",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "GAINS Institute — Governance, AI Stewardship & Sustainability",
    description:
      "Advancing responsible governance, AI stewardship, and sustainability through executive education, strategic advisory, and applied research.",
    siteName: "GAINS Institute",
  },
}

export default function GAINSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gains-body">
      {children}
    </div>
  )
}
