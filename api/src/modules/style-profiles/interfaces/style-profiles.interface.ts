export interface ScrapedLinkedInPost {
  id: string;
  url?: string;
  text: string;
  posted_at?: string;
  author_name?: string;
  likes?: number;
  comments?: number;
}
