import { cn } from "@/lib/utils";

interface DnaBadgeProps {
  name: string;
  className?: string;
}

export function DnaBadge({ name, className }: DnaBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary py-1 pl-1.5 pr-2.5 text-xs font-semibold text-secondary-foreground", className)}>
      {name}
    </span>
  );
}
