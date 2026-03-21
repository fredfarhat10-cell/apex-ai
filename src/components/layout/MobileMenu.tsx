"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navigation } from "@/lib/constants";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="relative z-50 flex h-10 w-10 items-center justify-center text-deep"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <div className="flex w-5 flex-col gap-1.5">
          <span
            className={`block h-px w-full bg-current transition-transform duration-300 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-full bg-current transition-all duration-300 ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col bg-cream"
          >
            <div className="flex h-16 items-center px-[var(--container-padding)]">
              <Logo />
            </div>
            <nav className="flex flex-1 flex-col justify-center px-[var(--container-padding)]">
              <ul className="space-y-8">
                {navigation.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="font-[family-name:var(--font-display)] text-3xl font-medium text-deep hover:text-forest transition-colors"
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-12">
                <Button href="/contact" variant="primary">
                  Request a Conversation
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
