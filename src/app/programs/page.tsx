"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Label } from "@/components/ui/Label";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const programs = [
  {
    title: "Board AI Governance Program",
    pillar: "Board Governance",
    duration: "6 months",
    format: "Hybrid",
    description:
      "A comprehensive program for board directors to develop practical AI oversight capabilities, from risk assessment to strategic value creation.",
    slug: "board-ai-governance",
  },
  {
    title: "AI Risk & Ethics for Directors",
    pillar: "Board Governance",
    duration: "3 days",
    format: "In-person",
    description:
      "Intensive workshop on algorithmic risk, data ethics, and AI accountability frameworks for non-technical board members.",
    slug: "ai-risk-ethics",
  },
  {
    title: "Sustainability Stewardship Certificate",
    pillar: "Stewardship & Value",
    duration: "4 months",
    format: "Online",
    description:
      "A structured certificate program for chairs and NEDs embedding ESG, stakeholder capitalism, and long-term value into board practice.",
    slug: "sustainability-stewardship",
  },
  {
    title: "Chair's Leadership Forum",
    pillar: "Stewardship & Value",
    duration: "Ongoing",
    format: "Peer network",
    description:
      "An exclusive peer network for chairs navigating governance transformation, with quarterly convenings and year-round advisory.",
    slug: "chairs-leadership-forum",
  },
  {
    title: "Next-Generation Board Leaders",
    pillar: "Succession & Development",
    duration: "12 months",
    format: "Hybrid",
    description:
      "A board-readiness development program for emerging leaders, designed with Oxford Saïd and INSEAD.",
    slug: "next-gen-board-leaders",
  },
  {
    title: "Succession Planning Masterclass",
    pillar: "Succession & Development",
    duration: "2 days",
    format: "In-person",
    description:
      "Practical frameworks for board succession planning, talent pipeline development, and diversity-driven board composition.",
    slug: "succession-planning",
  },
];

export default function ProgramsPage() {
  return (
    <>
      <section className="bg-cream pt-32 pb-16 lg:pt-40 lg:pb-24">
        <Container>
          <motion.div {...fadeUp}>
            <Label>Programs</Label>
            <Heading level="h1" className="mt-3 max-w-2xl">
              Governance programs for the AI era
            </Heading>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">
              From intensive workshops to year-long development programs, every
              GAINS offering is designed with our academic partners and grounded
              in real board practice.
            </p>
          </motion.div>
        </Container>
      </section>

      <SectionWrapper bg="warm">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program, i) => (
              <motion.a
                key={program.slug}
                href={`/programs/${program.slug}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group flex flex-col rounded-lg border border-mist bg-cream p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-sage/30"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-sage">
                    {program.pillar}
                  </span>
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-[var(--text-h3)] font-medium text-deep">
                  {program.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate">
                  {program.description}
                </p>
                <div className="mt-4 flex items-center gap-3 text-xs text-slate/70">
                  <span>{program.duration}</span>
                  <span className="h-1 w-1 rounded-full bg-mist" />
                  <span>{program.format}</span>
                </div>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-forest transition-colors group-hover:text-sage">
                  Learn more →
                </span>
              </motion.a>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper bg="forest">
        <Container className="text-center">
          <motion.div {...fadeUp}>
            <Heading level="h2" className="text-cream">
              Not sure which program is right?
            </Heading>
            <p className="mx-auto mt-4 max-w-md text-cream/80">
              Our advisory team can help match your governance needs to the right
              program.
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
