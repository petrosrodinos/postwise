import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ToolContentTypes, type ToolContentType } from "@/features/tools/interfaces/tools.interfaces";
import { countWords } from "../utils/count-words";

export interface ToolDraftFields {
  type: ToolContentType;
  title: string;
  hook: string;
  excerpt: string;
  body: string;
}

interface AiResultPanelProps<T extends ToolDraftFields> {
  label: string;
  current: T; // what the page's own fields hold right now (the "before")
  after: T;
  onAfterChange: (after: T) => void;
  onAccept: () => void;
  onDiscard: () => void;
}

const isLong = (type: ToolContentType) => type === ToolContentTypes.BLOG || type === ToolContentTypes.EMAIL;
const FIELD_LABEL = "text-xs font-semibold uppercase text-muted-foreground";

// The "after" half of the before/after view. It sits next to the page's own
// Body field (which stays the "before"), so only the AI result is rendered
// here: any title/hook/excerpt it changed, then the body, each with a word
// count, plus Apply / Discard.
export function AiResultPanel<T extends ToolDraftFields>({
  label,
  current,
  after,
  onAfterChange,
  onAccept,
  onDiscard,
}: AiResultPanelProps<T>) {
  const set = (patch: Partial<ToolDraftFields>) => onAfterChange({ ...after, ...patch });
  const afterLong = isLong(after.type);

  const rows: { key: "title" | "hook" | "excerpt"; label: string }[] = [
    { key: "title", label: after.type === ToolContentTypes.EMAIL ? "Subject line" : "Title" },
    { key: "hook", label: "Hook" },
    { key: "excerpt", label: "Excerpt" },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className={FIELD_LABEL}>
          {label}
          <span className="ml-2 font-normal normal-case tabular-nums">{countWords(after.body, afterLong)} words</span>
        </span>
        <div className="flex gap-2">
          <Button type="button" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={onAccept}>
            <Check className="h-3.5 w-3.5" />
            Apply
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={onDiscard}>
            <X className="h-3.5 w-3.5" />
            Discard
          </Button>
        </div>
      </div>

      {rows
        .filter((row) => current[row.key] !== after[row.key])
        .map((row) => (
          <div key={row.key} className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">
              {row.label}
              <span className="ml-2 font-normal normal-case tabular-nums">{countWords(after[row.key])} words</span>
            </span>
            <Input value={after[row.key]} onChange={(e) => set({ [row.key]: e.target.value })} className="text-sm" />
          </div>
        ))}

      {afterLong ? (
        <RichTextEditor value={after.body} onChange={(body) => set({ body })} placeholder="Body" />
      ) : (
        <Textarea
          value={after.body}
          onChange={(e) => set({ body: e.target.value })}
          rows={10}
          className="text-sm leading-relaxed"
        />
      )}
    </div>
  );
}
