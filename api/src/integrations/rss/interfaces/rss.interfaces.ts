export interface ParsedFeedItem {
  guid: string;
  title: string;
  link?: string;
  summary?: string;
  content?: string;
  published_at?: Date;
}
