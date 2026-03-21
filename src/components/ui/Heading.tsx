import { cn } from "@/lib/utils";

type Level = "h1" | "h2" | "h3" | "h4";

interface HeadingProps {
  level?: Level;
  as?: Level;
  children: React.ReactNode;
  className?: string;
}

const styles: Record<Level, string> = {
  h1: "text-[var(--text-h1)] font-semibold",
  h2: "text-[var(--text-h2)] font-semibold",
  h3: "text-[var(--text-h3)] font-medium",
  h4: "text-lg font-medium",
};

export function Heading({
  level = "h2",
  as,
  children,
  className,
}: HeadingProps) {
  const Tag = as || level;
  return (
    <Tag
      className={cn(
        "font-[family-name:var(--font-display)]",
        styles[level],
        className
      )}
    >
      {children}
    </Tag>
  );
}
