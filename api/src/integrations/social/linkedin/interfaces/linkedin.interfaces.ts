export interface PublishLinkedInPostRequest {
  accessToken: string;
  authorUrn: string;
  text: string;
}

export interface PublishLinkedInPostResponse {
  external_post_id: string;
  external_post_url: string;
}
