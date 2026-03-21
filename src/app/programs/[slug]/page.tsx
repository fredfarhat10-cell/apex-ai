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

export default function ProgramDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const title = formatSlug(slug);

  return (
    <>
      <section className="bg-cream pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Container>
          <motion.div {...fadeUp}>
            <Label>Program</Label>
            <Heading level="h1" className="mt-3 max-w-2xl">
              {title}
            </Heading>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">
              A comprehensive governance program developed in partnership with
              world-leading academic institutions and grounded in real board
              practice.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/contact">Apply Now</Button>
              <Button variant="secondary" href="/programs">
                ← All Programs
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>

      <SectionWrapper bg="warm">
        <Container>
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <motion.div {...fadeUp}>
                <Heading level="h2">Program Overview</Heading>
                <p className="mt-4 text-slate leading-relaxed">
                  This program equips board directors and senior governance
                  professionals with practical frameworks for navigating the
                  intersection of AI, sustainability, and corporate
                  accountability. Participants engage in structured learning
                  modules, peer discussions, and real-world case analysis.
                </p>
                <p className="mt-4 text-slate leading-relaxed">
                  Developed with our academic partners, the curriculum balances
                  emerging research with immediately applicable governance tools.
                  Graduates join the GAINS alumni network of 500+ board members
                  across 40+ countries.
                </p>
              </motion.div>

              <motion.div {...fadeUp}>
                <Heading level="h3" className="mt-8">
                  What You&apos;ll Learn
                </Heading>
                <ul className="mt-4 space-y-3">
                  {[
                    "Practical AI risk assessment frameworks for board-level oversight",
                    "Governance structures that enable responsible AI adoption",
                    "ESG integration into corporate strategy and board reporting",
                    "Stakeholder engagement models for the AI era",
                    "Succession planning in a rapidly transforming landscape",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-slate">
                      <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-forest" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <motion.aside {...fadeUp} className="space-y-6">
              <div className="rounded-lg border border-mist bg-cream p-6">
                <h4 className="text-sm font-semibold uppercase tracking-widest text-sage mb-4">
                  Program Details
                </h4>
                <dl className="space-y-4">
                  {[
                    ["Duration", "6 months"],
                    ["Format", "Hybrid (online + 3 residentials)"],
                    ["Cohort Size", "30 participants"],
                    ["Next Start", "September 2026"],
                    ["Investment", "Contact for details"],
                  ].map(([dt, dd]) => (
                    <div key={dt}>
                      <dt className="text-xs font-medium text-slate/60">{dt}</dt>
                      <dd className="mt-0.5 text-sm font-medium text-deep">{dd}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-lg border border-mist bg-cream p-6">
                <h4 className="text-sm font-semibold uppercase tracking-widest text-sage mb-3">
                  Academic Partners
                </h4>
                <p className="text-sm text-slate">
                  Oxford Saïd Business School, INSEAD, Tsinghua SEM
                </p>
              </div>
            </motion.aside>
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper bg="forest">
        <Container className="text-center">
          <motion.div {...fadeUp}>
            <Heading level="h2" className="text-cream">
              Ready to transform your board&apos;s governance?
            </Heading>
            <p className="mx-auto mt-4 max-w-md text-cream/80">
              Spaces are limited. Apply now or speak to our team.
            </p>
            <div className="mt-8">
              <Button
                href="/contact"
                className="bg-cream text-deep hover:bg-cream/90"
              >
                Request a Conversation
              </Button>
            </div>
          </motion.div>
        </Container>
      </SectionWrapper>
    </>
  );
}
