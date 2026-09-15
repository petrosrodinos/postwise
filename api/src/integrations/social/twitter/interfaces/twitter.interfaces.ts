export interface PublishTweetRequest {
  accessToken: string;
  text: string;
}

export interface PublishTweetResponse {
  external_post_id: string;
  external_post_url: string;
}
