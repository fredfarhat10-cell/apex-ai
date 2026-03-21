import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  light?: boolean;
}

export function Logo({ className, light }: LogoProps) {
  return (
    <a
      href="/"
      className={cn(
        "inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight transition-opacity hover:opacity-80",
        light ? "text-cream" : "text-deep",
        className
      )}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        className="shrink-0"
      >
        <rect
          width="28"
          height="28"
          rx="4"
          fill={light ? "#FDFBF7" : "#1B4332"}
        />
        <path
          d="M8 10h4v8H8zM14 8h4v10h-4zM20 12h4v6h-4z"
          fill={light ? "#1B4332" : "#FDFBF7"}
          opacity="0.9"
        />
      </svg>
      GAINS
    </a>
  );
}
