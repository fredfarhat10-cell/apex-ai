import { cn } from "@/lib/utils";

interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

export function Label({ children, className }: LabelProps) {
  return (
    <span
      className={cn(
        "inline-block text-xs font-semibold uppercase tracking-[0.15em] text-sage",
        className
      )}
    >
      {children}
    </span>
  );
}
