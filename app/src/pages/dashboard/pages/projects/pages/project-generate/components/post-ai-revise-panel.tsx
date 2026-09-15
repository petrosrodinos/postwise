import { useState } from "react";
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
import {
  useRepurposePost,
  useRevisePost,
} from "@/features/posts/hooks/use-posts";
import {
  RevisePresets,
  type PostType,
  type RevisedPostDraft,
  type RevisePreset,
} from "@/features/posts/interfaces/posts.interfaces";
import { PostTypeFormOptions } from "@/config/constants/dropdowns/posts/post-type-form.options";

const QUICK_ACTIONS: {
  preset: RevisePreset;
  label: string;
  icon: typeof Smile;
}[] = [
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

interface PostAiRevisePanelProps {
  postId: string;
  postType: PostType;
  onRevised: (draft: RevisedPostDraft) => void;
}

export function PostAiRevisePanel({
  postId,
  postType,
  onRevised,
}: PostAiRevisePanelProps) {
  const { mutate: revise, isPending } = useRevisePost();
  const { mutate: repurposePost, isPending: isRepurposing } =
    useRepurposePost();
  const [instructions, setInstructions] = useState("");
  const [activeAction, setActiveAction] = useState<
    RevisePreset | "custom" | null
  >(null);
  const [activeRepurposeType, setActiveRepurposeType] =
    useState<PostType | null>(null);

  const repurposeTargets = PostTypeFormOptions.filter(
    (option) => option.id !== postType,
  );

  function repurpose(targetType: PostType) {
    setActiveRepurposeType(targetType);
    repurposePost(
      { id: postId, dto: { target_types: [targetType] } },
      { onSettled: () => setActiveRepurposeType(null) },
    );
  }

  function runRevise(
    action: RevisePreset | "custom",
    dto: { preset?: RevisePreset; instructions?: string },
  ) {
    setActiveAction(action);
    revise(
      { id: postId, dto },
      {
        onSuccess: (draft) => {
          onRevised(draft);
          if (action === "custom") setInstructions("");
        },
        onSettled: () => setActiveAction(null),
      },
    );
  }

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
            disabled={isPending}
            loading={isPending && activeAction === preset}
            onClick={() => runRevise(preset, { preset })}
          >
            {!(isPending && activeAction === preset) && (
              <Icon className="h-3.5 w-3.5" />
            )}
            {label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Give the AI instructions to modify this post…"
          rows={2}
          className="bg-background text-xs"
          disabled={isPending}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="w-fit gap-1.5 text-xs"
          disabled={isPending || !instructions.trim()}
          loading={isPending && activeAction === "custom"}
          onClick={() =>
            runRevise("custom", { instructions: instructions.trim() })
          }
        >
          <Sparkles className="h-3.5 w-3.5" />
          Apply instructions
        </Button>
      </div>

      {repurposeTargets.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-violet/20 pt-3">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground">
            Repurpose into
          </span>
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
                onClick={() => repurpose(id)}
              >
                {!(isRepurposing && activeRepurposeType === id) && (
                  <Repeat2 className="h-3.5 w-3.5" />
                )}
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
