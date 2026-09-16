import { IntegrationProviders, type IntegrationProvider } from "@/features/integrations/interfaces/integrations.interfaces";

export const IntegrationProviderFormOptions: { id: IntegrationProvider; label: string }[] = [
  { id: IntegrationProviders.SANITY, label: "Sanity" },
  { id: IntegrationProviders.LINKEDIN, label: "LinkedIn" },
  { id: IntegrationProviders.TWITTER, label: "X" },
];

export function getIntegrationProviderLabel(provider: IntegrationProvider | string): string {
  return IntegrationProviderFormOptions.find((option) => option.id === provider)?.label ?? provider;
}
