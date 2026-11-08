import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RICH_TEXT_CONTENT_CLASSNAME, RichTextEditor } from "@/components/ui/rich-text-editor";
import { ToolContentTypes, type ToolContentType } from "@/features/tools/interfaces/tools.interfaces";
import { countWords } from "../utils/count-words";

export interface ToolDraftFields {
  type: ToolContentType;
  title: string;
  hook: string;
  excerpt: string;
  body: string;
}

interface ChangePreviewProps<T extends ToolDraftFields> {
  label: string;
  before: T;
  after: T;
  onAfterChange: (after: T) => void;
  onAccept: () => void;
  onDiscard: () => void;
}

const isLong = (type: ToolContentType) => type === ToolContentTypes.BLOG || type === ToolContentTypes.EMAIL;

const FIELD_LABEL = "text-xs font-semibold uppercase text-muted-foreground";

function FieldLabel({ side, name, text, html }: { side: string; name: string; text: string; html?: boolean }) {
  const words = countWords(text, html);
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={FIELD_LABEL}>
        {side}: {name}
      </span>
      <span className="text-[11px] tabular-nums text-muted-foreground">
        {words} {words === 1 ? "word" : "words"}
      </span>
    </div>
  );
}

// Shows what an AI tool produced next to what was there before, one row per
// changed field (before on the left, editable result on the right), so the
// user can review/tweak it before it replaces the working draft.
export function ChangePreview<T extends ToolDraftFields>({
  label,
  before,
  after,
  onAfterChange,
  onAccept,
  onDiscard,
}: ChangePreviewProps<T>) {
  const set = (patch: Partial<ToolDraftFields>) => onAfterChange({ ...after, ...patch });

  const beforeLong = isLong(before.type);
  const afterLong = isLong(after.type);

  const textRows: { key: "title" | "hook" | "excerpt"; label: string }[] = [
    { key: "title", label: after.type === ToolContentTypes.EMAIL ? "Subject line" : "Title" },
    { key: "hook", label: "Hook" },
    { key: "excerpt", label: "Excerpt" },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-brass-ink/40 bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">{label}: review the result</span>
        <div className="flex gap-2">
          <Button type="button" size="sm" className="gap-1.5" onClick={onAccept}>
            <Check className="h-3.5 w-3.5" />
            Apply
          </Button>
          <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={onDiscard}>
            <X className="h-3.5 w-3.5" />
            Discard
          </Button>
        </div>
      </div>

      {textRows
        .filter((row) => before[row.key] !== after[row.key])
        .map((row) => (
          <div key={row.key} className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <FieldLabel side="Before" name={row.label} text={before[row.key]} />
              <Input value={before[row.key]} readOnly className="text-sm opacity-80" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel side="After" name={row.label} text={after[row.key]} />
              <Input value={after[row.key]} onChange={(e) => set({ [row.key]: e.target.value })} className="text-sm" />
            </div>
          </div>
        ))}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <FieldLabel side="Before" name="Body" text={before.body} html={beforeLong} />
          {beforeLong ? (
            <div
              className={`${RICH_TEXT_CONTENT_CLASSNAME} max-h-[480px] overflow-auto rounded-md border border-border bg-card opacity-80`}
              dangerouslySetInnerHTML={{ __html: before.body }}
            />
          ) : (
            <Textarea value={before.body} readOnly rows={10} className="text-sm leading-relaxed opacity-80" />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <FieldLabel side="After" name="Body" text={after.body} html={afterLong} />
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
      </div>
    </div>
  );
}
