import EmotionalPLDashboard from "@/components/emotional-pl-dashboard"

export default function EmotionalPLPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Emotional P&L Dashboard</h1>
        <p className="text-muted-foreground">Track your Regret Units saved vs. spent across all life domains</p>
      </div>
      <EmotionalPLDashboard />
    </div>
  )
}
