"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Label } from "@/components/ui/Label";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { useParams } from "next/navigation";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

function formatSlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function InsightDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const title = formatSlug(slug);

  return (
    <>
      <section className="bg-cream pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Container>
          <motion.div {...fadeUp} className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Label>Research</Label>
              <span className="text-xs text-slate/60">March 2026</span>
            </div>
            <Heading level="h1" className="max-w-2xl">
              {title}
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-slate">
              An in-depth analysis exploring the current state and future
              trajectory of governance in an era defined by artificial
              intelligence and sustainability imperatives.
            </p>
          </motion.div>
        </Container>
      </section>

      <SectionWrapper bg="warm">
        <Container>
          <div className="mx-auto max-w-2xl">
            <motion.article {...fadeUp} className="prose-gains space-y-6 text-slate leading-relaxed">
              <p>
                The landscape of corporate governance is shifting faster than at
                any point since the post-Enron reforms. Artificial intelligence
                is no longer a technology question — it is a governance question.
                And boards that fail to recognise this distinction will find
                themselves on the wrong side of a widening readiness gap.
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-[var(--text-h3)] font-medium text-deep !mt-10">
                The Current State of Play
              </h2>
              <p>
                Our 2025 Global Board Survey — spanning 523 board members across
                42 countries — reveals three critical findings. First, AI has
                moved from a technology committee concern to a full-board
                strategic priority. Second, despite this elevation, few boards
                have developed the structural capacity to oversee AI
                effectively. Third, the boards that perform best share a common
                trait: they invest in governance capability before they invest in
                AI capability.
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-[var(--text-h3)] font-medium text-deep !mt-10">
                What the Leaders Do Differently
              </h2>
              <p>
                The top-performing boards in our index — those scoring above 80
                on the GAINS AI Readiness Scale — share three governance
                practices. They have established dedicated AI oversight
                structures (not simply added AI to an existing committee's
                remit). They invest in director education on AI fundamentals.
                And they have embedded AI-specific risk metrics into their
                existing risk frameworks.
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-[var(--text-h3)] font-medium text-deep !mt-10">
                Implications for Boards
              </h2>
              <p>
                The message is clear: governance readiness is not a technology
                project. It is an institutional capability that must be built
                deliberately, with the same rigour boards apply to financial
                oversight and strategic planning. The tools exist. The
                frameworks are proven. What remains is the commitment to act.
              </p>
            </motion.article>

            <motion.div {...fadeUp} className="mt-12 flex gap-4">
              <Button href="/insights" variant="secondary">
                ← All Insights
              </Button>
              <Button href="/contact">Discuss This Research</Button>
            </motion.div>
          </div>
        </Container>
      </SectionWrapper>
    </>
  );
}
