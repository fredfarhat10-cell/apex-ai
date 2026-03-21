"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-forest text-cream hover:bg-forest/90 shadow-sm hover:shadow-md",
  secondary:
    "bg-cream text-deep border border-mist hover:border-sage hover:text-forest",
  ghost:
    "text-sage hover:text-forest underline-offset-4 hover:underline",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", href, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-sm px-7 py-3 text-sm font-medium font-[family-name:var(--font-body)] tracking-wide transition-all duration-300 ease-out cursor-pointer",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
      variants[variant],
      className
    );

    if (href) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
