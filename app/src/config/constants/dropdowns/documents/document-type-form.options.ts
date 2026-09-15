import { DocumentTypes, type DocumentType } from "@/features/documents/interfaces/documents.interfaces";

export const DocumentTypeFormOptions: { id: DocumentType; label: string }[] = [
  { id: DocumentTypes.LOGO, label: "Logo" },
  { id: DocumentTypes.BANNER, label: "Banner" },
  { id: DocumentTypes.IMAGE, label: "Image" },
  { id: DocumentTypes.VIDEO, label: "Video" },
  { id: DocumentTypes.AUDIO, label: "Audio" },
  { id: DocumentTypes.PDF, label: "PDF" },
  { id: DocumentTypes.DOCUMENT, label: "Document" },
  { id: DocumentTypes.OTHER, label: "Other" },
];

export function getDocumentTypeLabel(type: DocumentType | string): string {
  return DocumentTypeFormOptions.find((option) => option.id === type)?.label ?? type;
}
