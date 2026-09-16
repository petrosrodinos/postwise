import {
  Briefcase,
  Coffee,
  Feather,
  Maximize,
  Repeat2,
  Scissors,
  Smile,
  Sparkles,
  SpellCheck,
  Wand2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RevisePresets, type RevisePreset } from "@/features/posts/interfaces/posts.interfaces";

const QUICK_ACTIONS: { preset: RevisePreset; label: string; icon: typeof Smile }[] = [
  { preset: RevisePresets.FRIENDLIER, label: "Friendlier", icon: Smile },
  { preset: RevisePresets.MORE_FORMAL, label: "More formal", icon: Briefcase },
  { preset: RevisePresets.LESS_FORMAL, label: "Less formal", icon: Coffee },
  { preset: RevisePresets.SHORTER, label: "Shorter", icon: Scissors },
  { preset: RevisePresets.LONGER, label: "Extend it", icon: Maximize },
  { preset: RevisePresets.SIMPLIFY, label: "Simplify", icon: Feather },
  { preset: RevisePresets.PUNCHIER, label: "Punchier", icon: Zap },
  { preset: RevisePresets.FIX_GRAMMAR, label: "Fix grammar", icon: SpellCheck },
  { preset: RevisePresets.HUMANIZE, label: "Humanize", icon: Wand2 },
];

export interface AiAssistRepurposeTarget<T extends string> {
  id: T;
  label: string;
}

// Generic over the repurpose target's key type `T` — the component never
// inspects it, just echoes it back via onRepurpose/activeRepurposeType, so
// Posts can pass its PostType and Tools its own separate ToolContentType
// (which includes EMAIL) without this component needing to know about
// either.
export interface AiAssistPanelProps<T extends string> {
  isRevising: boolean;
  activeReviseAction: RevisePreset | "custom" | null;
  onRevise: (action: RevisePreset | "custom", dto: { preset?: RevisePreset; instructions?: string }) => void;
  repurposeTargets?: AiAssistRepurposeTarget<T>[];
  isRepurposing?: boolean;
  activeRepurposeType?: T | null;
  onRepurpose?: (targetType: T) => void;
  instructions: string;
  onInstructionsChange: (value: string) => void;
}

// Purely presentational/controlled — no feature-specific hooks or API calls
// — so it can drive both a persisted Post and the stateless Tools page (or
// anything else shaped like revisable/repurposable content) from a thin
// per-feature wrapper.
export function AiAssistPanel<T extends string>({
  isRevising,
  activeReviseAction,
  onRevise,
  repurposeTargets = [],
  isRepurposing = false,
  activeRepurposeType = null,
  onRepurpose,
  instructions,
  onInstructionsChange,
}: AiAssistPanelProps<T>) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-violet/40 bg-violet/5 p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-violet">
        <Sparkles className="h-3.5 w-3.5" />
        AI assist
      </div>

      <div className="flex flex-wrap gap-1.5">
        {QUICK_ACTIONS.map(({ preset, label, icon: Icon }) => (
          <Button
            key={preset}
            type="button"
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 bg-background px-2.5 text-xs"
            disabled={isRevising}
            loading={isRevising && activeReviseAction === preset}
            onClick={() => onRevise(preset, { preset })}
          >
            {!(isRevising && activeReviseAction === preset) && <Icon className="h-3.5 w-3.5" />}
            {label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Textarea
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          placeholder="Give the AI instructions to modify this…"
          rows={2}
          className="bg-background text-xs"
          disabled={isRevising}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="w-fit gap-1.5 text-xs"
          disabled={isRevising || !instructions.trim()}
          loading={isRevising && activeReviseAction === "custom"}
          onClick={() => onRevise("custom", { instructions: instructions.trim() })}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Apply instructions
        </Button>
      </div>

      {onRepurpose && repurposeTargets.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-violet/20 pt-3">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground">Repurpose into</span>
          <div className="flex flex-wrap gap-1.5">
            {repurposeTargets.map(({ id, label }) => (
              <Button
                key={id}
                type="button"
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 bg-background px-2.5 text-xs"
                disabled={isRepurposing}
                loading={isRepurposing && activeRepurposeType === id}
                onClick={() => onRepurpose(id)}
              >
                {!(isRepurposing && activeRepurposeType === id) && <Repeat2 className="h-3.5 w-3.5" />}
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
