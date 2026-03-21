"use client";

import { Logo } from "./Logo";
import { Container } from "@/components/ui/Container";
import { footerLinks } from "@/lib/constants";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-deep text-cream">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo & mission */}
          <div className="lg:col-span-1">
            <Logo light />
            <p className="mt-4 text-sm leading-relaxed text-mist/80">
              Equipping boards and institutions with governance frameworks for
              the AI era.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://linkedin.com"
                aria-label="LinkedIn"
                className="text-mist/60 transition-colors hover:text-gold"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                aria-label="X (Twitter)"
                className="text-mist/60 transition-colors hover:text-gold"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Programs */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-mist/50 mb-4">
              Programs
            </h4>
            <ul className="space-y-3">
              {footerLinks.programs.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-mist/80 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Institute */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-mist/50 mb-4">
              Institute
            </h4>
            <ul className="space-y-3">
              {footerLinks.institute.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-mist/80 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-mist/50 mb-4">
              Connect
            </h4>
            <p className="text-sm text-mist/80 mb-3">
              Stay informed on governance insights.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmail("");
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-sm border border-mist/20 bg-transparent px-3 py-2 text-sm text-cream placeholder:text-mist/40 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-sm bg-forest px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-sage"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-mist/10 pt-8 sm:flex-row">
          <p className="text-xs text-mist/50">
            &copy; {new Date().getFullYear()} GAINS Institute. All rights
            reserved.
          </p>
          <div className="flex gap-6 text-xs text-mist/50">
            <a href="/privacy" className="hover:text-gold transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-gold transition-colors">
              Terms
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
