import { Hero } from "@/components/sections/Hero";
import { Challenge } from "@/components/sections/Challenge";
import { Pillars } from "@/components/sections/Pillars";
import { GlobalImpact } from "@/components/sections/GlobalImpact";
import { FeaturedInsight } from "@/components/sections/FeaturedInsight";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Challenge />
      <Pillars />
      <GlobalImpact />
      <FeaturedInsight />
      <FinalCTA />
    </>
  );
}
