import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGenerateTitleVariations } from "@/features/tools/hooks/use-tools";
import type { ToolContentType } from "@/features/tools/interfaces/tools.interfaces";

interface TitleVariationsPanelProps {
  type: ToolContentType;
  title?: string;
  hook?: string;
  body?: string;
  styleProfileId?: string;
  onApply: (title: string) => void;
}

export function TitleVariationsPanel({ type, title, hook, body, styleProfileId, onApply }: TitleVariationsPanelProps) {
  const { mutate: generate, isPending } = useGenerateTitleVariations();
  const [titles, setTitles] = useState<string[]>([]);

  function handleGenerate() {
    generate(
      { type, title, hook, body, style_profile_id: styleProfileId, count: 5 },
      { onSuccess: (result) => setTitles(result) },
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button type="button" size="sm" variant="secondary" className="w-fit gap-1.5" loading={isPending} onClick={handleGenerate}>
        <Sparkles className="h-3.5 w-3.5" />
        Generate title variations
      </Button>

      {titles.length > 0 && (
        <ul className="flex flex-col gap-2">
          {titles.map((option, index) => (
            <li key={index} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate">{option}</span>
              <Button type="button" size="sm" variant="outline" className="h-7 flex-none text-xs" onClick={() => onApply(option)}>
                Use this title
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
