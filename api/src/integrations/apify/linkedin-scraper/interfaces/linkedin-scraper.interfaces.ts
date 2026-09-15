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
  publicId?: string;
  urn?: string;
  url?: string;
  [key: string]: unknown;
}

export interface LinkedInScrapedPostEngagement {
  likes?: number;
  comments?: number;
  reposts?: number;
  [key: string]: unknown;
}

/**
 * Shape inferred from the harvestapi/linkedin-profile-posts dataset output, which Apify
 * does not formally document — treat unlisted fields via the index signature as best-effort.
 */
export interface LinkedInScrapedPost {
  id?: string;
  urn?: string;
  url?: string;
  type?: string;
  text?: string;
  postedAt?: string;
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
