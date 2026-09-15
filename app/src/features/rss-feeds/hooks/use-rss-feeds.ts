import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useWorkspaceStore } from "@/stores/workspace";
import {
  createRssFeed,
  deleteRssFeed,
  fetchRssItems,
  getRssFeed,
  getRssFeeds,
  updateRssFeed,
} from "../services/rss-feeds.services";
import type { CreateRssFeedDto, FetchRssItemsDto, RssFeedsQueryType, UpdateRssFeedDto } from "../interfaces/rss-feeds.interfaces";

const RSS_FEEDS_KEY = "rss-feeds";

export const useRssFeeds = (query?: Omit<RssFeedsQueryType, "organisation_id">) => {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);
  const resolvedQuery = { ...query, organisation_id: activeOrganisationId! };

  return useQuery({
    queryKey: [RSS_FEEDS_KEY, resolvedQuery],
    queryFn: () => getRssFeeds(resolvedQuery),
    enabled: !!activeOrganisationId,
  });
};

export const useRssFeed = (id?: string) => {
  return useQuery({
    queryKey: [RSS_FEEDS_KEY, id],
    queryFn: () => getRssFeed(id!),
    enabled: !!id,
  });
};

export const useCreateRssFeed = () => {
  const queryClient = useQueryClient();
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);

  return useMutation({
    mutationFn: (dto: Omit<CreateRssFeedDto, "organisation_id">) =>
      createRssFeed({ ...dto, organisation_id: activeOrganisationId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RSS_FEEDS_KEY] });
      toast({ title: "RSS feed added", description: "You can now attach it to a project.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not add RSS feed", description: error.message, variant: "error" });
    },
  });
};

export const useUpdateRssFeed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRssFeedDto }) => updateRssFeed(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RSS_FEEDS_KEY] });
      toast({ title: "RSS feed updated", description: "Your changes have been saved.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not update RSS feed", description: error.message, variant: "error" });
    },
  });
};

export const useDeleteRssFeed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRssFeed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RSS_FEEDS_KEY] });
      toast({ title: "RSS feed deleted", description: "It has been removed.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not delete RSS feed", description: error.message, variant: "error" });
    },
  });
};

export const useFetchRssItems = () => {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: FetchRssItemsDto }) => fetchRssItems(id, dto),
    onError: (error: Error) => {
      toast({ title: "Could not fetch feed items", description: error.message, variant: "error" });
    },
  });
};
