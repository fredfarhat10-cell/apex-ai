"use client";

import { useEffect, useState } from "react";
import { navigation } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-cream/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[var(--container-max)] items-center justify-between px-[var(--container-padding)] lg:h-20">
        <Logo />

        <nav className="hidden lg:flex items-center gap-8">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-sm font-medium text-slate hover:text-deep transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-forest after:transition-all hover:after:w-full"
            >
              {item.label}
            </a>
          ))}
          <Button href="/contact" variant="primary" className="ml-2">
            Request a Conversation
          </Button>
        </nav>

        <MobileMenu />
      </div>
    </header>
  );
}
