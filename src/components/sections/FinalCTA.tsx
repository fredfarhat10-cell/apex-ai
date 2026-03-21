"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
};

export function FinalCTA() {
  return (
    <SectionWrapper bg="forest" className="relative overflow-hidden">
      {/* Geometric accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full border border-cream/[0.06]" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full border border-cream/[0.04]" />
        <div className="absolute top-1/4 right-1/4 h-32 w-32 rotate-45 border border-cream/[0.03]" />
      </div>

      <Container className="relative z-10 text-center">
        <motion.h2
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-xl font-[family-name:var(--font-display)] text-[var(--text-h1)] font-semibold text-cream leading-tight"
        >
          The boardroom is changing.
          <br />
          Are you ready?
        </motion.h2>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-6 max-w-md text-lg text-cream/80"
        >
          Join 500+ governance leaders preparing for the AI era.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8"
        >
          <Button
            href="/contact"
            className="bg-cream text-deep hover:bg-cream/90 hover:shadow-lg"
          >
            Request a Conversation
          </Button>
        </motion.div>
      </Container>
    </SectionWrapper>
  );
}
