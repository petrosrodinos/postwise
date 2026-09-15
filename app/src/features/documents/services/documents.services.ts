import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { PaginatedResponse } from "@/interfaces/pagination.interfaces";
import type { CreateDocumentDto, Document, DocumentsQueryType, UpdateDocumentDto } from "../interfaces/documents.interfaces";

export const uploadDocument = async (dto: CreateDocumentDto): Promise<Document> => {
  try {
    const formData = new FormData();
    formData.append("file", dto.file);
    if (dto.type) formData.append("type", dto.type);
    if (dto.organisation_id) formData.append("organisation_id", dto.organisation_id);

    const response = await axiosInstance.post(ApiRoutes.documents.prefix, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to upload document. Please try again.");
  }
};

export const getDocuments = async (query?: DocumentsQueryType): Promise<PaginatedResponse<Document>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.documents.prefix, { params: query });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch documents. Please try again.");
  }
};

export const getDocument = async (id: string): Promise<Document> => {
  try {
    const response = await axiosInstance.get(`${ApiRoutes.documents.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch document. Please try again.");
  }
};

export const updateDocument = async (id: string, dto: UpdateDocumentDto): Promise<Document> => {
  try {
    const response = await axiosInstance.patch(`${ApiRoutes.documents.prefix}/${id}`, dto);
    return response.data;
  } catch (error) {
    throw new Error("Failed to update document. Please try again.");
  }
};

export const deleteDocument = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`${ApiRoutes.documents.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete document. Please try again.");
  }
};
