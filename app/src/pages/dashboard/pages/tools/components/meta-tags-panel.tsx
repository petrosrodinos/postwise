import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGenerateMetaTags } from "@/features/tools/hooks/use-tools";
import type { MetaTagsDraft, ToolContentType } from "@/features/tools/interfaces/tools.interfaces";

interface MetaTagsPanelProps {
  type: ToolContentType;
  title?: string;
  hook?: string;
  body?: string;
  excerpt?: string;
  onApply: (draft: MetaTagsDraft) => void;
}

export function MetaTagsPanel({ type, title, hook, body, excerpt, onApply }: MetaTagsPanelProps) {
  const { mutate: generate, isPending } = useGenerateMetaTags();
  const [draft, setDraft] = useState<MetaTagsDraft | null>(null);

  function handleGenerate() {
    generate({ type, title, hook, body, excerpt }, { onSuccess: (result) => setDraft(result) });
  }

  return (
    <div className="flex flex-col gap-3">
      <Button type="button" size="sm" variant="secondary" className="w-fit gap-1.5" loading={isPending} onClick={handleGenerate}>
        <Sparkles className="h-3.5 w-3.5" />
        Generate meta tags
      </Button>

      {draft && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">SEO title</span>
            <Input
              value={draft.seo_title}
              onChange={(e) => setDraft((d) => (d ? { ...d, seo_title: e.target.value } : d))}
              className="text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">SEO description</span>
            <Input
              value={draft.seo_description}
              onChange={(e) => setDraft((d) => (d ? { ...d, seo_description: e.target.value } : d))}
              className="text-xs"
            />
          </div>
          <Button type="button" size="sm" variant="outline" className="w-fit text-xs" onClick={() => onApply(draft)}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
