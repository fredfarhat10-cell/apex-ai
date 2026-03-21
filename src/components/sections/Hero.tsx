"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { partners } from "@/lib/constants";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-cream overflow-hidden">
      {/* Background geometric shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[8%] h-64 w-64 rounded-full bg-forest/[0.04]"
        />
        <motion.div
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[35%] right-[20%] h-40 w-40 rotate-45 bg-sage/[0.06]"
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[5%] h-32 w-32 rounded-full border border-gold/20"
        />
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[60%] right-[30%] h-20 w-20 bg-gold/[0.06] rotate-12"
        />
        {/* Large decorative SVG */}
        <svg
          className="absolute right-0 top-1/2 -translate-y-1/2 h-[70vh] w-auto opacity-[0.03]"
          viewBox="0 0 400 400"
          fill="none"
        >
          <rect x="50" y="50" width="120" height="300" rx="4" fill="currentColor" />
          <rect x="200" y="100" width="80" height="200" rx="4" fill="currentColor" />
          <rect x="310" y="150" width="60" height="150" rx="4" fill="currentColor" />
        </svg>
      </div>

      <Container className="relative z-10 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-2xl">
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0 }}>
            <Label className="mb-6">
              Global Institute of Governance, AI &amp; Sustainability
            </Label>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-[family-name:var(--font-display)] text-[var(--text-display)] font-semibold text-deep leading-[1.05] tracking-tight"
          >
            Governance for
            <br />
            the AI era
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-slate"
          >
            GAINS equips boards and institutions with the governance frameworks,
            networks, and capabilities to lead responsibly through AI
            transformation and the net-zero transition.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Button href="/programs">Explore Our Programs</Button>
            <Button variant="ghost" href="/about">
              Watch 2-min intro →
            </Button>
          </motion.div>

          {/* Trust bar */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 border-t border-mist pt-6"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate/60">
              In partnership with
            </p>
            <div className="flex flex-wrap items-center gap-8">
              {partners.map((p) => (
                <span
                  key={p}
                  className="font-[family-name:var(--font-display)] text-base font-medium text-deep/40 transition-colors hover:text-deep/70"
                >
                  {p}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
