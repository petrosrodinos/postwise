import { AutomationOutputStages, type AutomationOutputStage } from "@/features/automations/interfaces/automations.interfaces";

export const AutomationOutputStageFormOptions: { id: AutomationOutputStage; label: string; description: string }[] = [
  { id: AutomationOutputStages.DRAFT, label: "Save as draft", description: "Sit in Draft for review before anything goes out." },
  { id: AutomationOutputStages.REVIEW, label: "Send to pending review", description: "Notify a reviewer that new posts are waiting." },
  { id: AutomationOutputStages.PUBLISH, label: "Auto-publish", description: "Publish directly on schedule — no manual step." },
];

export function getAutomationOutputStageLabel(stage: AutomationOutputStage | string): string {
  return AutomationOutputStageFormOptions.find((option) => option.id === stage)?.label ?? stage;
}
