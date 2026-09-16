import { useState } from "react";
import { AiAssistPanel } from "@/components/shared/ai-assist-panel/ai-assist-panel";
import { useRepurposeToolContent, useReviseToolContent } from "@/features/tools/hooks/use-tools";
import type { RepurposedContentDraft, ToolContentType } from "@/features/tools/interfaces/tools.interfaces";
import type { RevisedPostDraft, RevisePreset } from "@/features/posts/interfaces/posts.interfaces";
import { TOOL_CONTENT_TYPE_META, TOOL_CONTENT_TYPE_OPTIONS } from "../constants/tool-content-type.constants";

interface ToolsContentSnapshot {
  type: ToolContentType;
  title?: string;
  hook?: string;
  body?: string;
  excerpt?: string;
}

interface ToolsAiAssistPanelProps {
  content: ToolsContentSnapshot;
  onRevised: (draft: RevisedPostDraft) => void;
  onRepurposed: (targetType: ToolContentType, draft: RepurposedContentDraft) => void;
}

// Stateless counterpart to PostAiRevisePanel — sends the current in-memory
// draft on every call instead of an entity id, and applies results in place
// (repurposing switches the working draft to the target channel rather than
// creating anything new).
export function ToolsAiAssistPanel({ content, onRevised, onRepurposed }: ToolsAiAssistPanelProps) {
  const { mutate: revise, isPending } = useReviseToolContent();
  const { mutate: repurpose, isPending: isRepurposing } = useRepurposeToolContent();
  const [instructions, setInstructions] = useState("");
  const [activeAction, setActiveAction] = useState<RevisePreset | "custom" | null>(null);
  const [activeRepurposeType, setActiveRepurposeType] = useState<ToolContentType | null>(null);

  const repurposeTargets = TOOL_CONTENT_TYPE_OPTIONS.filter((type) => type !== content.type).map((type) => ({
    id: type,
    label: TOOL_CONTENT_TYPE_META[type].label,
  }));

  function runRepurpose(targetType: ToolContentType) {
    setActiveRepurposeType(targetType);
    repurpose(
      { ...content, target_types: [targetType] },
      {
        onSuccess: ([result]) => {
          if (result) onRepurposed(result.type, result.draft);
        },
        onSettled: () => setActiveRepurposeType(null),
      },
    );
  }

  function runRevise(action: RevisePreset | "custom", dto: { preset?: RevisePreset; instructions?: string }) {
    setActiveAction(action);
    revise(
      { ...content, ...dto },
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
    <AiAssistPanel
      isRevising={isPending}
      activeReviseAction={activeAction}
      onRevise={runRevise}
      instructions={instructions}
      onInstructionsChange={setInstructions}
      repurposeTargets={repurposeTargets}
      isRepurposing={isRepurposing}
      activeRepurposeType={activeRepurposeType}
      onRepurpose={runRepurpose}
    />
  );
}
