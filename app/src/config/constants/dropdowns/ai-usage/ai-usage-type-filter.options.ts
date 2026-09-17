import { AiUsageTypes, type AiUsageType } from "@/features/ai-usage/interfaces/ai-usage.interfaces";

export const AiUsageTypeFilterOptions: { id: AiUsageType | "all"; label: string }[] = [
  { id: "all", label: "All types" },
  { id: AiUsageTypes.TEXT, label: "Text" },
  { id: AiUsageTypes.IMAGE, label: "Image" },
];

export function getAiUsageTypeLabel(type: AiUsageType | string): string {
  return AiUsageTypeFilterOptions.find((option) => option.id === type)?.label ?? type;
}
