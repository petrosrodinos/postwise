export const SocialChannels = {
  TWITTER: "TWITTER",
  LINKEDIN: "LINKEDIN",
} as const;
export type SocialChannel = (typeof SocialChannels)[keyof typeof SocialChannels];

export const SocialChannelConnectionStatuses = {
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  EXPIRED: "EXPIRED",
  ERROR: "ERROR",
} as const;
export type SocialChannelConnectionStatus = (typeof SocialChannelConnectionStatuses)[keyof typeof SocialChannelConnectionStatuses];

export interface SocialChannelConnection {
  id: string;
  organisation_id: string;
  channel: SocialChannel;
  status: SocialChannelConnectionStatus;
  external_account_id: string;
  external_account_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSocialChannelConnectionDto {
  channel: SocialChannel;
  external_account_id: string;
  external_account_name?: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  organisation_id: string;
}

export type UpdateSocialChannelConnectionDto = Partial<Omit<CreateSocialChannelConnectionDto, "channel" | "organisation_id">> & {
  status?: SocialChannelConnectionStatus;
};

export interface SocialChannelConnectionsQueryType {
  page?: number;
  limit?: number;
  organisation_id: string;
  channel?: SocialChannel;
}
