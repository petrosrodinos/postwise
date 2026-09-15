import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useWorkspaceStore } from "@/stores/workspace";
import {
  analyzeStyleProfile,
  createStyleProfile,
  deleteStyleProfile,
  getStyleProfile,
  getStyleProfiles,
  scrapeLinkedInPosts,
  updateStyleProfile,
} from "../services/style-profiles.services";
import type {
  AnalyzeStyleProfileDto,
  CreateStyleProfileDto,
  ScrapeLinkedInPostsDto,
  StyleProfilesQueryType,
  UpdateStyleProfileDto,
} from "../interfaces/style-profiles.interfaces";

const STYLE_PROFILES_KEY = "style-profiles";

export const useStyleProfiles = (query?: Omit<StyleProfilesQueryType, "organisation_id">) => {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);
  const resolvedQuery = { ...query, organisation_id: activeOrganisationId! };

  return useQuery({
    queryKey: [STYLE_PROFILES_KEY, resolvedQuery],
    queryFn: () => getStyleProfiles(resolvedQuery),
    enabled: !!activeOrganisationId,
  });
};

export const useStyleProfile = (id?: string) => {
  return useQuery({
    queryKey: [STYLE_PROFILES_KEY, id],
    queryFn: () => getStyleProfile(id!),
    enabled: !!id,
  });
};

export const useCreateStyleProfile = () => {
  const queryClient = useQueryClient();
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);

  return useMutation({
    mutationFn: (dto: Omit<CreateStyleProfileDto, "organisation_id">) =>
      createStyleProfile({ ...dto, organisation_id: activeOrganisationId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STYLE_PROFILES_KEY] });
      toast({ title: "Style profile created", description: "Add sample posts and analyze it to build its Style DNA.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not create style profile", description: error.message, variant: "error" });
    },
  });
};

export const useUpdateStyleProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateStyleProfileDto }) => updateStyleProfile(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STYLE_PROFILES_KEY] });
      toast({ title: "Style profile updated", description: "Your changes have been saved.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not update style profile", description: error.message, variant: "error" });
    },
  });
};

export const useDeleteStyleProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStyleProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STYLE_PROFILES_KEY] });
      toast({ title: "Style profile deleted", description: "It has been removed.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not delete style profile", description: error.message, variant: "error" });
    },
  });
};

export const useAnalyzeStyleProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AnalyzeStyleProfileDto }) => analyzeStyleProfile(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STYLE_PROFILES_KEY] });
      toast({ title: "Style DNA ready", description: "Tone, hooks and vocabulary have been extracted.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not analyze style profile", description: error.message, variant: "error" });
    },
  });
};

export const useScrapeLinkedInPosts = () => {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ScrapeLinkedInPostsDto }) => scrapeLinkedInPosts(id, dto),
    onError: (error: Error) => {
      toast({ title: "Could not fetch LinkedIn posts", description: error.message, variant: "error" });
    },
  });
};
