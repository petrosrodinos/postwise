import { useState } from "react";
import { AiAssistPanel } from "@/components/shared/ai-assist-panel/ai-assist-panel";
import {
  useRepurposePost,
  useRevisePost,
} from "@/features/posts/hooks/use-posts";
import {
  type PostType,
  type RevisedPostDraft,
  type RevisePreset,
} from "@/features/posts/interfaces/posts.interfaces";
import { PostTypeFormOptions } from "@/config/constants/dropdowns/posts/post-type-form.options";

interface PostAiRevisePanelProps {
  postId: string;
  postType: PostType;
  hasContent: boolean;
  onRevised: (draft: RevisedPostDraft) => void;
}

export function PostAiRevisePanel({
  postId,
  postType,
  hasContent,
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
    <AiAssistPanel
      isRevising={isPending}
      activeReviseAction={activeAction}
      onRevise={runRevise}
      instructions={instructions}
      onInstructionsChange={setInstructions}
      hasContent={hasContent}
      repurposeTargets={repurposeTargets}
      isRepurposing={isRepurposing}
      activeRepurposeType={activeRepurposeType}
      onRepurpose={repurpose}
    />
  );
}
