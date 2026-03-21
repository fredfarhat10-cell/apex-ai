"use client";

import { useState } from "react";
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

const inputClasses =
  "w-full rounded-sm border border-mist bg-cream px-4 py-3 text-sm text-deep placeholder:text-slate/40 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage/30 transition-colors";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <section className="bg-cream pt-32 pb-16 lg:pt-40 lg:pb-24">
        <Container>
          <motion.div {...fadeUp}>
            <Label>Contact</Label>
            <Heading level="h1" className="mt-3 max-w-xl">
              Start a conversation
            </Heading>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate">
              Whether you&apos;re exploring a program, seeking a partnership, or
              want to discuss governance challenges — we&apos;d welcome a
              conversation.
            </p>
          </motion.div>
        </Container>
      </section>

      <SectionWrapper bg="warm">
        <Container>
          <div className="grid gap-16 lg:grid-cols-5">
            {/* Form */}
            <motion.div {...fadeUp} className="lg:col-span-3">
              {submitted ? (
                <div className="rounded-lg border border-success/20 bg-success/5 p-8 text-center">
                  <Heading level="h3" className="text-forest">
                    Thank you for reaching out
                  </Heading>
                  <p className="mt-3 text-slate">
                    We&apos;ll respond within two business days.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="space-y-6"
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-deep">
                        First name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        required
                        className={inputClasses}
                        placeholder="Jane"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-deep">
                        Last name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        required
                        className={inputClasses}
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-deep">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      className={inputClasses}
                      placeholder="jane@company.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="organization" className="mb-1.5 block text-sm font-medium text-deep">
                      Organization
                    </label>
                    <input
                      id="organization"
                      type="text"
                      className={inputClasses}
                      placeholder="Your organization"
                    />
                  </div>
                  <div>
                    <label htmlFor="interest" className="mb-1.5 block text-sm font-medium text-deep">
                      Area of interest
                    </label>
                    <select id="interest" className={inputClasses}>
                      <option value="">Select an area</option>
                      <option value="board-governance">Board Governance Programs</option>
                      <option value="stewardship">Stewardship &amp; Value</option>
                      <option value="succession">Succession &amp; Development</option>
                      <option value="research">Research Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-deep">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className={inputClasses}
                      placeholder="Tell us about your governance needs..."
                    />
                  </div>
                  <Button type="submit">Send Message</Button>
                </form>
              )}
            </motion.div>

            {/* Contact info */}
            <motion.aside {...fadeUp} className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-sage mb-3">
                  London Office
                </h3>
                <p className="text-sm text-slate leading-relaxed">
                  10 St James&apos;s Square
                  <br />
                  London SW1Y 4LE
                  <br />
                  United Kingdom
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-sage mb-3">
                  General Enquiries
                </h3>
                <p className="text-sm text-slate">
                  info@gainsinstitute.org
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-sage mb-3">
                  Program Enquiries
                </h3>
                <p className="text-sm text-slate">
                  programs@gainsinstitute.org
                </p>
              </div>
              <div className="rounded-lg border border-mist bg-cream p-6">
                <h4 className="font-[family-name:var(--font-display)] text-lg font-medium text-deep">
                  Prefer a direct conversation?
                </h4>
                <p className="mt-2 text-sm text-slate">
                  Book a 30-minute call with our advisory team to discuss your
                  governance needs.
                </p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  href="/contact"
                >
                  Book a Call
                </Button>
              </div>
            </motion.aside>
          </div>
        </Container>
      </SectionWrapper>
    </>
  );
}
