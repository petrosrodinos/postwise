export interface RssFeed {
  id: string;
  organisation_id: string;
  name: string;
  url: string;
  last_fetched_at?: string | null;
  last_fetch_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RssFeedItem {
  id: string;
  rss_feed_id: string;
  guid: string;
  title: string;
  link?: string | null;
  summary?: string | null;
  content?: string | null;
  published_at?: string | null;
  is_used: boolean;
  fetched_at: string;
}

export interface CreateRssFeedDto {
  name: string;
  url: string;
  organisation_id: string;
}

export type UpdateRssFeedDto = Partial<Omit<CreateRssFeedDto, "organisation_id">>;

export interface FetchRssItemsDto {
  limit?: number;
  since?: string;
  unused_only?: boolean;
}

export interface RssFeedsQueryType {
  page?: number;
  limit?: number;
  organisation_id: string;
}
