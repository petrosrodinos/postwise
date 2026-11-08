import { useState } from "react";
import { LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormatToolContent } from "@/features/tools/hooks/use-tools";
import { ToolContentTypes, type ToolContentType } from "@/features/tools/interfaces/tools.interfaces";

interface FormatPanelProps {
  type: ToolContentType;
  hook?: string;
  body?: string;
  onApply: (body: string) => void;
}

// Restructures the document (headings, paragraphs, lists) without changing
// its wording. For short-form channels the hook is folded into the formatted
// body. The result is reviewed before/after on the page before it's applied.
export function FormatPanel({ type, hook, body, onApply }: FormatPanelProps) {
  const { mutate: format, isPending } = useFormatToolContent();
  const [instructions, setInstructions] = useState("");

  const isLongForm = type === ToolContentTypes.BLOG || type === ToolContentTypes.EMAIL;
  const hasContent = !!((body ?? "").replace(/<[^>]*>/g, "").trim() || (!isLongForm && hook?.trim()));

  function handleFormat() {
    format(
      { type, hook: isLongForm ? undefined : hook, body, instructions: instructions.trim() || undefined },
      { onSuccess: (result) => onApply(result.body) },
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Adds headings, paragraphs and lists to your document. The wording and language stay exactly as written.
      </p>
      <Input
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder='Optional: e.g. "use a numbered list for the steps"'
        className="text-xs"
      />
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="w-fit gap-1.5"
        loading={isPending}
        disabled={!hasContent}
        onClick={handleFormat}
      >
        <LayoutList className="h-3.5 w-3.5" />
        Format document
      </Button>
    </div>
  );
}
