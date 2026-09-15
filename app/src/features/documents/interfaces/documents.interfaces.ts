export const DocumentTypes = {
  LOGO: "LOGO",
  BANNER: "BANNER",
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  AUDIO: "AUDIO",
  PDF: "PDF",
  DOCUMENT: "DOCUMENT",
  OTHER: "OTHER",
} as const;
export type DocumentType = (typeof DocumentTypes)[keyof typeof DocumentTypes];

export interface Document {
  id: string;
  user_uuid?: string | null;
  organisation_id?: string | null;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  path: string;
  type: DocumentType;
  created_at: string;
}

export interface CreateDocumentDto {
  file: File;
  type?: DocumentType;
  organisation_id?: string;
}

export interface UpdateDocumentDto {
  filename?: string;
  type?: DocumentType;
}

export interface DocumentsQueryType {
  page?: number;
  limit?: number;
  organisation_id?: string;
  type?: DocumentType;
}
