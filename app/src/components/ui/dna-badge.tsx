import { cn } from "@/lib/utils";
import { StyleDnaStrand, type StyleTraits } from "@/components/ui/style-dna-strand";

interface DnaBadgeProps {
  name: string;
  traits: StyleTraits;
  className?: string;
}

export function DnaBadge({ name, traits, className }: DnaBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary py-1 pl-1.5 pr-2.5 text-xs font-semibold text-secondary-foreground", className)}>
      <StyleDnaStrand traits={traits} className="w-11" segmentClassName="h-1.5" />
      {name}
    </span>
  );
}
