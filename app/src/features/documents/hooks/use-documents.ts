import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useWorkspaceStore } from "@/stores/workspace";
import { deleteDocument, getDocument, getDocuments, updateDocument, uploadDocument } from "../services/documents.services";
import type { CreateDocumentDto, DocumentsQueryType, UpdateDocumentDto } from "../interfaces/documents.interfaces";

const DOCUMENTS_KEY = "documents";

export const useDocuments = (query?: Omit<DocumentsQueryType, "organisation_id">) => {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);
  const resolvedQuery = { ...query, organisation_id: activeOrganisationId! };

  return useQuery({
    queryKey: [DOCUMENTS_KEY, resolvedQuery],
    queryFn: () => getDocuments(resolvedQuery),
    enabled: !!activeOrganisationId,
  });
};

export const useDocument = (id?: string) => {
  return useQuery({
    queryKey: [DOCUMENTS_KEY, id],
    queryFn: () => getDocument(id!),
    enabled: !!id,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);

  return useMutation({
    mutationFn: (dto: Omit<CreateDocumentDto, "organisation_id">) =>
      uploadDocument({ ...dto, organisation_id: activeOrganisationId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
      toast({ title: "File uploaded", description: "Your document is ready to use.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not upload file", description: error.message, variant: "error" });
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDocumentDto }) => updateDocument(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
      toast({ title: "Document updated", description: "Your changes have been saved.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not update document", description: error.message, variant: "error" });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
      toast({ title: "Document deleted", description: "The file has been removed.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not delete document", description: error.message, variant: "error" });
    },
  });
};
