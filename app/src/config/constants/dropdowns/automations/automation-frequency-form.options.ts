import { AutomationFrequencies, type AutomationFrequency } from "@/features/automations/interfaces/automations.interfaces";

export const AutomationFrequencyFormOptions: { id: AutomationFrequency; label: string }[] = [
  { id: AutomationFrequencies.WEEKLY, label: "Weekly" },
  { id: AutomationFrequencies.DAILY, label: "Daily" },
  { id: AutomationFrequencies.WEEKDAYS, label: "Weekdays" },
];

export function getAutomationFrequencyLabel(frequency: AutomationFrequency | string): string {
  return AutomationFrequencyFormOptions.find((option) => option.id === frequency)?.label ?? frequency;
}
