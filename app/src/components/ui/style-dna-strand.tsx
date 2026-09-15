import { cn } from "@/lib/utils";

export interface StyleTraits {
  tone_score?: number | null;
  structure_score?: number | null;
  hooks_score?: number | null;
  vocabulary_score?: number | null;
  rhythm_score?: number | null;
}

const TRAITS: { key: keyof StyleTraits; label: string; className: string }[] = [
  { key: "tone_score", label: "Tone", className: "bg-brass" },
  { key: "structure_score", label: "Structure", className: "bg-teal" },
  { key: "hooks_score", label: "Hooks", className: "bg-coral" },
  { key: "vocabulary_score", label: "Vocabulary", className: "bg-violet" },
  { key: "rhythm_score", label: "Rhythm", className: "bg-rhythm" },
];

interface StyleDnaStrandProps {
  traits: StyleTraits;
  className?: string;
  segmentClassName?: string;
}

export function StyleDnaStrand({ traits, className, segmentClassName }: StyleDnaStrandProps) {
  const values = TRAITS.map((trait) => ({ ...trait, value: Math.max(traits[trait.key] ?? 0, 4) }));
  const total = values.reduce((sum, trait) => sum + trait.value, 0) || 1;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {values.map((trait) => (
        <div
          key={trait.key}
          className={cn("h-2 rounded-full", trait.className, segmentClassName)}
          style={{ width: `${(trait.value / total) * 100}%` }}
          title={`${trait.label}: ${traits[trait.key] ?? 0}`}
        />
      ))}
    </div>
  );
}

interface StyleDnaLegendProps {
  traits: StyleTraits;
  showValues?: boolean;
  className?: string;
}

export function StyleDnaLegend({ traits, showValues = false, className }: StyleDnaLegendProps) {
  return (
    <div className={cn("mt-2.5 flex flex-wrap gap-3.5", className)}>
      {TRAITS.map((trait) => (
        <div key={trait.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("inline-block h-2 w-2 rounded-sm", trait.className)} />
          {trait.label}
          {showValues && <span className="font-semibold text-foreground">{traits[trait.key] ?? 0}</span>}
        </div>
      ))}
    </div>
  );
}
