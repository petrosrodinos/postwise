import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useWorkspaceStore } from "@/stores/workspace";
import {
  createSocialChannelConnection,
  deleteSocialChannelConnection,
  getSocialChannelConnections,
  updateSocialChannelConnection,
} from "../services/social-channel-connections.services";
import type {
  CreateSocialChannelConnectionDto,
  SocialChannelConnectionsQueryType,
  UpdateSocialChannelConnectionDto,
} from "../interfaces/social-channel-connections.interfaces";

const CONNECTIONS_KEY = "social-channel-connections";

export const useSocialChannelConnections = (query?: Omit<SocialChannelConnectionsQueryType, "organisation_id">) => {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);
  const resolvedQuery = { ...query, organisation_id: activeOrganisationId ?? undefined };

  return useQuery({
    queryKey: [CONNECTIONS_KEY, resolvedQuery],
    queryFn: () => getSocialChannelConnections(resolvedQuery),
  });
};

export const useCreateSocialChannelConnection = () => {
  const queryClient = useQueryClient();
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);

  return useMutation({
    mutationFn: (dto: Omit<CreateSocialChannelConnectionDto, "organisation_id">) =>
      createSocialChannelConnection({ ...dto, organisation_id: activeOrganisationId ?? undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONNECTIONS_KEY] });
      toast({ title: "Channel connected", description: "Posts can now be scheduled to this account.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not connect channel", description: error.message, variant: "error" });
    },
  });
};

export const useUpdateSocialChannelConnection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSocialChannelConnectionDto }) => updateSocialChannelConnection(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONNECTIONS_KEY] });
      toast({ title: "Connection updated", description: "Your changes have been saved.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not update connection", description: error.message, variant: "error" });
    },
  });
};

export const useDeleteSocialChannelConnection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSocialChannelConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONNECTIONS_KEY] });
      toast({ title: "Channel disconnected", description: "Posts will no longer publish to this account.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not disconnect channel", description: error.message, variant: "error" });
    },
  });
};
