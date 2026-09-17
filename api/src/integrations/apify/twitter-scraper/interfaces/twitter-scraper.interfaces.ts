export interface TwitterScraperInput {
  profileUrls: string[];
  resultsLimit?: number;
  skipPinnedPosts?: boolean;
}

export interface TwitterScrapedPostAuthor {
  name?: string;
  screenName?: string;
  followersCount?: number;
  favouritesCount?: number;
  friendsCount?: number;
  description?: string;
  profileImageUrl?: string;
  [key: string]: unknown;
}

export interface TwitterScrapedPostMedia {
  id?: string;
  type?: string;
  mediaUrlHttps?: string;
  [key: string]: unknown;
}

/**
 * Shape of the scraper_one/x-profile-posts-scraper dataset output (verified against a
 * live run), which Apify does not formally document — treat unlisted fields via the
 * index signature as best-effort.
 */
export interface TwitterScrapedPost {
  postId?: string;
  postUrl?: string;
  profileUrl?: string;
  postText?: string;
  timestamp?: number;
  conversationId?: string;
  media?: TwitterScrapedPostMedia[];
  author?: TwitterScrapedPostAuthor;
  replyCount?: number;
  quoteCount?: number;
  repostCount?: number;
  favouriteCount?: number;
  viewCount?: number;
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
