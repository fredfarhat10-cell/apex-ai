"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Label } from "@/components/ui/Label";
import { Heading } from "@/components/ui/Heading";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const articles = [
  {
    category: "Research",
    title: "The Board AI Readiness Index: 2025 Results",
    excerpt:
      "Our annual survey of 500+ board members reveals a widening gap between AI ambition and governance preparedness.",
    date: "March 2026",
    slug: "board-ai-readiness-index-2025",
  },
  {
    category: "Perspective",
    title: "Why ESG Oversight Belongs in the Audit Committee",
    excerpt:
      "A practical framework for embedding sustainability governance within existing board structures.",
    date: "February 2026",
    slug: "esg-oversight-audit-committee",
  },
  {
    category: "Case Study",
    title: "Building AI Governance at Scale: Lessons from 12 Multinationals",
    excerpt:
      "How leading companies moved from AI principles to operational governance frameworks.",
    date: "January 2026",
    slug: "ai-governance-at-scale",
  },
  {
    category: "Research",
    title: "The Chair's Guide to Algorithmic Accountability",
    excerpt:
      "What every board chair needs to know about overseeing algorithmic systems — and what questions to ask management.",
    date: "December 2025",
    slug: "chairs-guide-algorithmic-accountability",
  },
  {
    category: "Perspective",
    title: "From Shareholder to Stakeholder: The Governance Shift",
    excerpt:
      "How boards are redefining value creation for a multi-stakeholder world — and the governance mechanisms that make it stick.",
    date: "November 2025",
    slug: "shareholder-to-stakeholder",
  },
  {
    category: "Case Study",
    title: "Succession in the Digital Age: Three Board Journeys",
    excerpt:
      "Three boards, three approaches to succession planning in a world where the skills gap is widening faster than ever.",
    date: "October 2025",
    slug: "succession-digital-age",
  },
];

export default function InsightsPage() {
  return (
    <>
      <section className="bg-cream pt-32 pb-16 lg:pt-40 lg:pb-24">
        <Container>
          <motion.div {...fadeUp}>
            <Label>Insights</Label>
            <Heading level="h1" className="mt-3 max-w-2xl">
              Research, perspectives &amp; case studies
            </Heading>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">
              Original research and practitioner insights on governance, AI, and
              sustainability — from our team and global network of experts.
            </p>
          </motion.div>
        </Container>
      </section>

      <SectionWrapper bg="warm">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, i) => (
              <motion.a
                key={article.slug}
                href={`/insights/${article.slug}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group flex flex-col rounded-lg border border-mist bg-cream p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-sage/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-sage">
                    {article.category}
                  </span>
                  <span className="text-xs text-slate/60">{article.date}</span>
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-[var(--text-h3)] font-medium text-deep leading-snug">
                  {article.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate">
                  {article.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-forest transition-colors group-hover:text-sage">
                  Read more →
                </span>
              </motion.a>
            ))}
          </div>
        </Container>
      </SectionWrapper>
    </>
  );
}
