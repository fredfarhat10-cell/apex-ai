import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Momentum - Accountability That Works",
  description: "Build habits that stick. Transform failure into fuel.",
}

export default function MomentumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F1F5F9]">
      {children}
    </div>
  )
}
