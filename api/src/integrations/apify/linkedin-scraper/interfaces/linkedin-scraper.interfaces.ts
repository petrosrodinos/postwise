export type LinkedInPostedLimit =
  | 'any'
  | '1h'
  | '24h'
  | 'week'
  | 'month'
  | '3months'
  | '6months'
  | 'year';

export type LinkedInCommentsPostedLimit =
  | 'any'
  | '1h'
  | '24h'
  | 'week'
  | 'month';

export type LinkedInContextCountry = 'any' | 'US' | 'GB' | 'DE' | 'FR';

export interface LinkedInScraperInput {
  targetUrls: string[];
  maxPosts?: number;
  postedLimit?: LinkedInPostedLimit;
  postedLimitDate?: string;
  includeQuotePosts?: boolean;
  includeReposts?: boolean;
  scrapeReactions?: boolean;
  maxReactions?: number;
  postNestedReactions?: boolean;
  scrapeComments?: boolean;
  maxComments?: number;
  commentsPostedLimit?: LinkedInCommentsPostedLimit;
  postNestedComments?: boolean;
  contextCountry?: LinkedInContextCountry;
}

export interface LinkedInScrapedPostAuthor {
  name?: string;
  publicIdentifier?: string;
  linkedinUrl?: string;
  [key: string]: unknown;
}

export interface LinkedInScrapedPostEngagement {
  likes?: number;
  comments?: number;
  shares?: number;
  [key: string]: unknown;
}

export interface LinkedInScrapedPostPostedAt {
  timestamp?: number;
  date?: string;
  postedAgoShort?: string;
  postedAgoText?: string;
  [key: string]: unknown;
}

/**
 * Shape inferred from the harvestapi/linkedin-profile-posts dataset output, which Apify
 * does not formally document — treat unlisted fields via the index signature as best-effort.
 * Note: the post text is in `content` (not `text`) and the post URL is `linkedinUrl` (not `url`).
 */
export interface LinkedInScrapedPost {
  id?: string;
  linkedinUrl?: string;
  type?: string;
  content?: string;
  postedAt?: LinkedInScrapedPostPostedAt;
  author?: LinkedInScrapedPostAuthor;
  engagement?: LinkedInScrapedPostEngagement;
  [key: string]: unknown;
}

export interface ApifyRunInfo {
  id: string;
  actId: string;
  userId: string;
  startedAt: string;
  finishedAt?: string;
  status: string;
  defaultDatasetId: string;
  defaultKeyValueStoreId: string;
  defaultRequestQueueId: string;
  [key: string]: unknown;
}

export interface ApifyRunResponse {
  data: ApifyRunInfo;
}
