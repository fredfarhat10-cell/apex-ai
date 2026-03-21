"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Label } from "@/components/ui/Label";
import { Heading } from "@/components/ui/Heading";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
};

const insights = [
  {
    featured: true,
    category: "Research",
    title: "The Board AI Readiness Index: 2025 Results",
    excerpt:
      "Our annual survey of 500+ board members reveals a widening gap between AI ambition and governance preparedness. The top performers share three traits.",
    slug: "board-ai-readiness-index-2025",
  },
  {
    featured: false,
    category: "Perspective",
    title: "Why ESG Oversight Belongs in the Audit Committee",
    excerpt:
      "A practical framework for embedding sustainability governance within existing board structures.",
    slug: "esg-oversight-audit-committee",
  },
  {
    featured: false,
    category: "Case Study",
    title: "Building AI Governance at Scale: Lessons from 12 Multinationals",
    excerpt:
      "How leading companies moved from AI principles to operational governance frameworks.",
    slug: "ai-governance-at-scale",
  },
];

export function FeaturedInsight() {
  const [featured, ...secondary] = insights;

  return (
    <SectionWrapper bg="warm">
      <Container>
        <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="mb-12">
          <Label>Latest Insights</Label>
          <Heading level="h2" className="mt-3">
            Research & perspectives
          </Heading>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Featured card */}
          <motion.a
            href={`/insights/${featured.slug}`}
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group lg:col-span-3 rounded-lg border border-mist bg-cream p-8 lg:p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-sage">
              {featured.category}
            </span>
            <h3 className="mt-4 font-[family-name:var(--font-display)] text-[var(--text-h2)] font-semibold text-deep leading-tight">
              {featured.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-slate">
              {featured.excerpt}
            </p>
            <span className="mt-6 inline-flex items-center text-sm font-medium text-forest transition-colors group-hover:text-sage">
              Read the Report
              <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </motion.a>

          {/* Secondary cards */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {secondary.map((item, i) => (
              <motion.a
                key={item.slug}
                href={`/insights/${item.slug}`}
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="group flex-1 rounded-lg border border-mist bg-cream p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-sage">
                  {item.category}
                </span>
                <h4 className="mt-3 font-[family-name:var(--font-display)] text-[var(--text-h3)] font-medium text-deep leading-snug">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-slate line-clamp-2">
                  {item.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-forest transition-colors group-hover:text-sage">
                  Read more →
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
