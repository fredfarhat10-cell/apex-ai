"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const challengeStats = [
  {
    value: 78,
    suffix: "%",
    label: "cite AI governance as a top board priority",
  },
  {
    value: 12,
    suffix: "%",
    label: "feel adequately prepared to oversee it",
  },
  {
    value: 3.2,
    isDecimal: true,
    suffix: " years",
    label: "average time to board-level AI readiness",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
};

export function Challenge() {
  return (
    <SectionWrapper bg="warm">
      <Container>
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-[50ch] text-center font-[family-name:var(--font-display)] text-[var(--text-h2)] font-semibold leading-snug text-deep"
        >
          78% of boards say AI governance is a top priority.{" "}
          <span className="text-sage">
            Only 12% feel prepared to oversee it.
          </span>
        </motion.p>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {challengeStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="rounded-lg border border-mist bg-cream p-8 text-center"
            >
              <span className="block font-[family-name:var(--font-display)] text-5xl font-semibold text-forest lg:text-6xl">
                {stat.isDecimal ? (
                  <>3.2{stat.suffix}</>
                ) : (
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                  />
                )}
              </span>
              <span className="mt-3 block text-sm leading-relaxed text-slate">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center text-xs text-slate/60"
        >
          Source: GAINS Global Board Survey 2025
        </motion.p>
      </Container>
    </SectionWrapper>
  );
}
