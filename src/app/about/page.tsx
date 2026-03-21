"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Label } from "@/components/ui/Label";
import { Heading } from "@/components/ui/Heading";
import { partners } from "@/lib/constants";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const team = [
  {
    name: "Dr. Sarah Chen",
    role: "Executive Director",
    bio: "Former McKinsey partner. 20 years in governance advisory across Asia-Pacific and Europe.",
  },
  {
    name: "Prof. James Okafor",
    role: "Director of Research",
    bio: "Oxford Saïd Business School faculty. Expert in AI governance frameworks and corporate accountability.",
  },
  {
    name: "Maria Gonzalez",
    role: "Director of Programs",
    bio: "Led board development initiatives across 30+ countries. Former INSEAD executive education lead.",
  },
  {
    name: "Dr. Wei Lin",
    role: "Director of Partnerships",
    bio: "Tsinghua SEM fellow. Bridges governance practice between Asian and Western markets.",
  },
];

const advisors = [
  { name: "Sir David Walker", affiliation: "Former Chair, Barclays" },
  { name: "Prof. Lynn Paine", affiliation: "Harvard Business School" },
  { name: "Dame Helen Alexander", affiliation: "Former President, CBI" },
  { name: "Prof. Yingyi Qian", affiliation: "Tsinghua University" },
  { name: "Jean-Pierre Garnier", affiliation: "Former CEO, GSK" },
  { name: "Prof. Navi Radjou", affiliation: "INSEAD" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-cream pt-32 pb-16 lg:pt-40 lg:pb-24">
        <Container>
          <motion.div {...fadeUp}>
            <Label>About GAINS</Label>
            <Heading level="h1" className="mt-3 max-w-2xl">
              Convening the world&apos;s governance leaders for the challenges
              ahead
            </Heading>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">
              The Global Institute of Governance, AI &amp; Sustainability was
              founded on a simple premise: the institutions that shape our world
              need governance frameworks that match the pace of change.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Mission */}
      <SectionWrapper bg="warm">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div {...fadeUp}>
              <Label>Our Mission</Label>
              <Heading level="h2" className="mt-3">
                Governance that keeps pace with transformation
              </Heading>
            </motion.div>
            <motion.div {...fadeUp} className="space-y-4 text-slate">
              <p>
                We work at the intersection of corporate governance, artificial
                intelligence, and sustainability — the three forces reshaping
                every boardroom on earth.
              </p>
              <p>
                Through rigorous research, executive programs, and a global peer
                network, we equip board members, chairs, and governance
                professionals with practical frameworks — not theory.
              </p>
              <p>
                Our programs are developed in partnership with Oxford Saïd,
                Stanford, INSEAD, Tsinghua SEM, and IESE, ensuring every
                framework is both academically grounded and immediately
                applicable.
              </p>
            </motion.div>
          </div>
        </Container>
      </SectionWrapper>

      {/* Team */}
      <SectionWrapper bg="cream" id="team">
        <Container>
          <motion.div {...fadeUp} className="mb-12">
            <Label>Leadership</Label>
            <Heading level="h2" className="mt-3">
              Our team
            </Heading>
          </motion.div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="mb-4 aspect-[4/5] rounded-lg bg-warm" />
                <h3 className="font-[family-name:var(--font-display)] text-lg font-medium">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-sage">{member.role}</p>
                <p className="mt-2 text-sm text-slate">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* Advisory Board */}
      <SectionWrapper bg="warm">
        <Container>
          <motion.div {...fadeUp} className="mb-12">
            <Label>Advisory Board</Label>
            <Heading level="h2" className="mt-3">
              Guided by global expertise
            </Heading>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {advisors.map((advisor, i) => (
              <motion.div
                key={advisor.name}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-lg border border-mist bg-cream p-6"
              >
                <h4 className="font-[family-name:var(--font-display)] text-lg font-medium">
                  {advisor.name}
                </h4>
                <p className="mt-1 text-sm text-slate">
                  {advisor.affiliation}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* Partners */}
      <SectionWrapper bg="deep" id="partners">
        <Container className="text-center">
          <motion.div {...fadeUp}>
            <Label className="text-mist/60">Academic Partners</Label>
            <Heading level="h2" className="mt-3 text-cream">
              Built with the world&apos;s leading institutions
            </Heading>
          </motion.div>
          <div className="mt-12 flex flex-wrap justify-center gap-12">
            {partners.map((p, i) => (
              <motion.span
                key={p}
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="font-[family-name:var(--font-display)] text-2xl font-medium text-cream/50"
              >
                {p}
              </motion.span>
            ))}
          </div>
        </Container>
      </SectionWrapper>
    </>
  );
}
