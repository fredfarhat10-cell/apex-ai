import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  bg?: "cream" | "warm" | "deep" | "forest";
  id?: string;
}

const bgMap = {
  cream: "bg-cream text-deep",
  warm: "bg-warm text-deep",
  deep: "bg-deep text-cream",
  forest: "bg-forest text-cream",
};

export function SectionWrapper({
  children,
  className,
  bg = "cream",
  id,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-[var(--space-section)]",
        bgMap[bg],
        className
      )}
    >
      {children}
    </section>
  );
}
