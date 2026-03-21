"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Label } from "@/components/ui/Label";
import { Heading } from "@/components/ui/Heading";
import { pillars } from "@/lib/constants";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
};

const icons = [
  // Board Governance — shield / grid
  <svg key="gov" viewBox="0 0 48 48" fill="none" className="h-10 w-10">
    <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
    <line x1="4" y1="18" x2="44" y2="18" stroke="currentColor" strokeWidth="2" />
    <line x1="24" y1="18" x2="24" y2="40" stroke="currentColor" strokeWidth="2" />
  </svg>,
  // Stewardship — growth / tree rings
  <svg key="stew" viewBox="0 0 48 48" fill="none" className="h-10 w-10">
    <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2" />
    <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1" opacity="0.3" />
  </svg>,
  // Succession — ascending steps
  <svg key="succ" viewBox="0 0 48 48" fill="none" className="h-10 w-10">
    <rect x="4" y="32" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="19" y="22" width="10" height="22" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="34" y="12" width="10" height="32" rx="1" stroke="currentColor" strokeWidth="2" />
  </svg>,
];

const cardStyles = [
  "sm:row-span-2", // tall
  "", // square
  "sm:col-span-1", // normal
];

export function Pillars() {
  return (
    <SectionWrapper bg="cream">
      <Container>
        <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="mb-12">
          <Label>What We Do</Label>
          <Heading level="h2" className="mt-3 max-w-md">
            Three pillars of governance excellence
          </Heading>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, i) => (
            <motion.a
              key={pillar.slug}
              href={`/programs/${pillar.slug}`}
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className={`group relative rounded-lg border border-mist bg-warm p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-sage/30 ${cardStyles[i]}`}
            >
              <div className="mb-6 text-forest">{icons[i]}</div>
              <p className="text-xs font-semibold uppercase tracking-widest text-sage mb-2">
                {pillar.tagline}
              </p>
              <h3 className="font-[family-name:var(--font-display)] text-[var(--text-h3)] font-medium text-deep">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                {pillar.description}
              </p>
              <span className="mt-6 inline-flex items-center text-sm font-medium text-forest opacity-0 transition-opacity group-hover:opacity-100">
                Learn more
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </motion.a>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
}
