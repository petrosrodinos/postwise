export interface SanityCredentials {
  projectId: string;
  dataset: string;
  apiToken: string;
}

export interface PublishSanityDocumentRequest extends SanityCredentials {
  documentType: string;
  documentId: string;
  title?: string | null;
  bodyHtml?: string | null;
  excerpt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  coverImageUrl?: string | null;
}

export interface PublishSanityDocumentResponse {
  external_id: string;
  external_url: string;
}
