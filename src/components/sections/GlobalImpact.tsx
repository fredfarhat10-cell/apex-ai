"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { partners } from "@/lib/constants";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
};

export function GlobalImpact() {
  // Double the partners for seamless marquee
  const marqueeItems = [...partners, ...partners, ...partners, ...partners];

  return (
    <SectionWrapper bg="deep">
      <Container>
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Counter statement */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="max-w-lg text-center lg:text-left"
          >
            <span className="block font-[family-name:var(--font-display)] text-6xl font-semibold text-cream lg:text-7xl">
              <AnimatedCounter value={500} suffix="+" />
            </span>
            <p className="mt-4 text-xl leading-relaxed text-mist/80">
              board members across{" "}
              <span className="font-semibold text-cream">
                <AnimatedCounter value={40} suffix="+" />
              </span>{" "}
              countries trust GAINS to navigate AI governance.
            </p>
          </motion.div>

          {/* Right: Logo marquee */}
          <div className="w-full max-w-md overflow-hidden lg:max-w-sm">
            <div className="group relative">
              <div className="flex animate-marquee gap-12 group-hover:[animation-play-state:paused]">
                {marqueeItems.map((partner, i) => (
                  <span
                    key={`${partner}-${i}`}
                    className="shrink-0 font-[family-name:var(--font-display)] text-lg font-medium text-mist/40 whitespace-nowrap"
                  >
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </SectionWrapper>
  );
}
