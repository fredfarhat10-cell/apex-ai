"use client"

interface SimpleHeroProps {
  onStart: () => void
}

export default function SimpleHero({ onStart }: SimpleHeroProps) {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center text-white bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a] transition-opacity duration-700 px-6">
      {/* Headline */}
      <h1 className="text-5xl md:text-6xl font-bold mb-2">
        Meet <span className="bg-gradient-to-r from-pink-500 to-blue-400 bg-clip-text text-transparent">Apex AI</span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg max-w-lg text-gray-300 mb-8 leading-relaxed">
        Your coach, creator, and companion — all in one intelligent system. Apex learns your rhythm, adapts to your
        goals, and keeps your world in sync.
      </p>

      {/* Buttons — Only Get Started & Watch Demo */}
      <div className="flex gap-4">
        <button
          onClick={onStart}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 font-semibold hover:scale-105 transition-transform duration-300 shadow-lg shadow-purple-500/25"
        >
          Get Started →
        </button>

        <button
          onClick={() => alert("Demo mode coming soon.")}
          className="px-6 py-3 rounded-xl border border-white/30 font-semibold hover:bg-white/10 transition-colors duration-300"
        >
          Watch Demo
        </button>
      </div>

      {/* Tagline */}
      <p className="text-sm mt-8 text-green-400 flex items-center gap-2 flex-wrap justify-center">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Emotionally Intelligent
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Private Memory
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Adaptive Intelligence
        </span>
      </p>

      {/* Floating decorative elements */}
      <div className="absolute top-32 right-32 w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
      <div
        className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-pink-400 animate-pulse"
        style={{ animationDelay: "300ms" }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full bg-blue-400 animate-pulse"
        style={{ animationDelay: "700ms" }}
      />
    </main>
  )
}
