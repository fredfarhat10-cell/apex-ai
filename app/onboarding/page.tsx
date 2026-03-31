"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Mic, Send, HelpCircle, Brain, Lock, DollarSign, Settings, Search, Check, Dumbbell, Music, TrendingUp, Users, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EnhancedBrainWireframe } from "@/components/enhanced-brain-wireframe";
import { VoiceEngine } from "@/lib/voice-engine";
import { userContextManager } from "@/lib/user-context-manager";

// ======== UTILITY: LOCAL STORAGE MANAGEMENT ========
function getLocalData() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("apexGenesisData") || "{}");
  } catch {
    return {};
  }
}
function setLocalData(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem("apexGenesisData", JSON.stringify(data));
}

// ======== ROOT APPLICATION CONTROLLER ========
export default function ApexAppPage() {
  const [phase, setPhase] = useState("loading"); // loading | hero | onboarding | studio
  const [userPrefs, setUserPrefs] = useState(null);

  useEffect(() => {
    const data = getLocalData();
    if (data.user && data.onboardingComplete) {
      setUserPrefs(data.user);
      setPhase("studio");
    } else {
      setPhase("hero");
    }
  }, []);

  if (phase === "loading") {
    return <div className="h-screen w-full flex items-center justify-center bg-[#030014] text-white">Loading Apex Core...</div>;
  }
  
  if (phase === "hero") {
    return <HeroLanding onGetStarted={() => setPhase("onboarding")} onWatchDemo={() => alert("Demo coming soon!")} />;
  }

  if (phase === "onboarding") {
    return (
      <VoiceOnboarding
        onComplete={(prefs) => {
          const data = { user: prefs, onboardingComplete: true };
          setLocalData(data);
          setUserPrefs(prefs);
          setPhase("studio");
        }}
      />
    );
  }

  if (phase === "studio") {
    return <StudioDashboard userProfile={userPrefs} />;
  }

  return null;
}

// ======== 1. HERO LANDING PAGE (LOCKED) ========
function HeroLanding({ onGetStarted, onWatchDemo }) {
  const [ctaHovered, setCtaHovered] = useState(false);
  
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a] overflow-hidden flex items-center justify-center">
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
          <div className="space-y-8 animate-fadeIn">
            <h1 className="text-6xl lg:text-7xl font-bold leading-tight text-white font-orbitron">
              Meet <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Apex AI</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
              Your coach, creator, and companion — all in one private, intelligent system that orchestrates your life.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={onGetStarted}
                onMouseEnter={() => setCtaHovered(true)}
                onMouseLeave={() => setCtaHovered(false)}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105 group"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={onWatchDemo}
                size="lg"
                variant="outline"
                className="border-2 border-white/20 bg-transparent hover:bg-white/5 text-white px-8 py-6 text-lg rounded-xl backdrop-blur-sm transition-all"
              >
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="relative hidden lg:flex items-center justify-center">
            <EnhancedBrainWireframe ctaHovered={ctaHovered} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ======== 2. CONVERSATIONAL VOICE ONBOARDING ========
function VoiceOnboarding({ onComplete }) {
    // This is a placeholder for the full voice onboarding component
    // For now, we'll use a simplified version to ensure flow works.
    const [name, setName] = useState("");
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if(!name.trim()) return;
        const prefs = { name: name.trim(), country: 'USA', goal: 'Productivity' };
        onComplete(prefs);
    };

    return (
        <section className="flex flex-col items-center justify-center h-screen text-white px-4 py-6 animate-fadeIn bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]">
            <div className="w-40 h-40 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-blue-700 mb-8 shadow-lg shadow-blue-400/30 animate-pulse" />
            <h2 className="text-3xl font-bold mb-4 text-center">Welcome to Apex</h2>
            <p className="text-gray-400 mb-8 text-center">Let's get you set up. What should I call you?</p>
            <form onSubmit={handleSubmit} className="flex items-center w-full max-w-sm gap-2">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name..." className="bg-white/10 border-gray-700 text-white" autoFocus />
                <Button type="submit" size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 font-semibold">
                    <ArrowRight size={20} />
                </Button>
            </form>
        </section>
    );
}

// ======== 3. STUDIO DASHBOARD (PLACEHOLDER) ========
function StudioDashboard({ userProfile }) {
  // This is a placeholder for the full studio experience
  return (
    <div className="flex h-screen text-white bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]">
      <aside className="w-64 bg-black/30 p-6 border-r border-white/10">
        <h2 className="text-2xl font-bold font-orbitron mb-8 text-white">Apex Studio</h2>
        <nav className="space-y-2">
          {["Dashboard", "Financial", "Routines", "Help"].map(tab => (
            <Button key={tab} variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10">
              {tab}
            </Button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 animate-fadeIn">
        <h1 className="text-4xl font-bold text-white">Welcome, {userProfile?.name}!</h1>
        <p className="text-gray-400 mt-2">Your personalized studio is ready. The next phase will bring this space to life.</p>
      </main>
    </div>
  );
}
