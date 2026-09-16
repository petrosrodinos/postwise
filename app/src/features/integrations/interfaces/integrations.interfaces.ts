export const IntegrationProviders = {
  SANITY: "SANITY",
  TWITTER: "TWITTER",
  LINKEDIN: "LINKEDIN",
} as const;
export type IntegrationProvider = (typeof IntegrationProviders)[keyof typeof IntegrationProviders];

export const IntegrationStatuses = {
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  ERROR: "ERROR",
} as const;
export type IntegrationStatus = (typeof IntegrationStatuses)[keyof typeof IntegrationStatuses];

export interface Integration {
  id: string;
  organisation_id: string;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  // Sanity
  external_project_id?: string | null;
  external_dataset?: string | null;
  document_type?: string | null;
  // Twitter/LinkedIn
  external_account_id?: string | null;
  external_account_name?: string | null;
  token_expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateIntegrationDto {
  provider: IntegrationProvider;
  name: string;
  organisation_id: string;
  external_project_id?: string;
  external_dataset?: string;
  document_type?: string;
  api_token?: string;
  external_account_id?: string;
  external_account_name?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
}

export type UpdateIntegrationDto = Partial<Omit<CreateIntegrationDto, "provider" | "organisation_id">> & {
  status?: IntegrationStatus;
};

export interface IntegrationsQueryType {
  page?: number;
  limit?: number;
  organisation_id: string;
  provider?: IntegrationProvider;
}
