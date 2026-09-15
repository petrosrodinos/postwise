export interface TwitterScraperInput {
  profileUrls: string[];
  resultsLimit?: number;
  skipPinnedPosts?: boolean;
}

export interface TwitterScrapedPostAuthor {
  id?: string;
  name?: string;
  userName?: string;
  url?: string;
  isVerified?: boolean;
  profileImageUrl?: string;
  [key: string]: unknown;
}

export interface TwitterScrapedPostEngagement {
  likeCount?: number;
  replyCount?: number;
  retweetCount?: number;
  quoteCount?: number;
  viewCount?: number;
  bookmarkCount?: number;
  [key: string]: unknown;
}

/**
 * Shape inferred from the scraper_one/x-profile-posts-scraper dataset output, which Apify
 * does not formally document — treat unlisted fields via the index signature as best-effort.
 */
export interface TwitterScrapedPost {
  id?: string;
  url?: string;
  type?: string;
  text?: string;
  createdAt?: string;
  isPinned?: boolean;
  isRetweet?: boolean;
  isQuote?: boolean;
  isReply?: boolean;
  author?: TwitterScrapedPostAuthor;
  engagement?: TwitterScrapedPostEngagement;
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
