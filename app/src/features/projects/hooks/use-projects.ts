import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useWorkspaceStore } from "@/stores/workspace";
import {
  attachRssFeed,
  attachStyleProfile,
  createProject,
  deleteProject,
  detachRssFeed,
  detachStyleProfile,
  generateProjectDetails,
  getProject,
  getProjects,
  updateProject,
} from "../services/projects.services";
import type {
  AttachRssFeedDto,
  AttachStyleProfileDto,
  CreateProjectDto,
  GenerateProjectDetailsDto,
  ProjectsQueryType,
  UpdateProjectDto,
} from "../interfaces/projects.interfaces";

const PROJECTS_KEY = "projects";

export const useProjects = (query?: Omit<ProjectsQueryType, "organisation_id">) => {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);
  const resolvedQuery = { ...query, organisation_id: activeOrganisationId! };

  return useQuery({
    queryKey: [PROJECTS_KEY, resolvedQuery],
    queryFn: () => getProjects(resolvedQuery),
    enabled: !!activeOrganisationId,
  });
};

export const useProject = (id?: string) => {
  return useQuery({
    queryKey: [PROJECTS_KEY, id],
    queryFn: () => getProject(id!),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);

  return useMutation({
    mutationFn: (dto: Omit<CreateProjectDto, "organisation_id">) =>
      createProject({ ...dto, organisation_id: activeOrganisationId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      toast({ title: "Project created", description: "Your new project is ready.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not create project", description: error.message, variant: "error" });
    },
  });
};

export const useGenerateProjectDetails = () => {
  return useMutation({
    mutationFn: (dto: GenerateProjectDetailsDto) => generateProjectDetails(dto),
    onSuccess: () => {
      toast({ title: "Suggestions ready", description: "Pillars, ideas and instructions have been filled in — feel free to edit.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not generate suggestions", description: error.message, variant: "error" });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProjectDto }) => updateProject(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      toast({ title: "Project updated", description: "Your changes have been saved.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not update project", description: error.message, variant: "error" });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      toast({ title: "Project deleted", description: "The project has been removed.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not delete project", description: error.message, variant: "error" });
    },
  });
};

export const useAttachStyleProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AttachStyleProfileDto }) => attachStyleProfile(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      toast({ title: "Style profile attached", description: "This project will now draft using that voice.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not attach style profile", description: error.message, variant: "error" });
    },
  });
};

export const useDetachStyleProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, styleProfileId }: { id: string; styleProfileId: string }) => detachStyleProfile(id, styleProfileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      toast({ title: "Style profile detached", description: "It's no longer attached to this project.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not detach style profile", description: error.message, variant: "error" });
    },
  });
};

export const useAttachRssFeed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AttachRssFeedDto }) => attachRssFeed(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      toast({ title: "RSS feed attached", description: "This project can now generate posts from it.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not attach RSS feed", description: error.message, variant: "error" });
    },
  });
};

export const useDetachRssFeed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rssFeedId }: { id: string; rssFeedId: string }) => detachRssFeed(id, rssFeedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      toast({ title: "RSS feed detached", description: "It's no longer attached to this project.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not detach RSS feed", description: error.message, variant: "error" });
    },
  });
};
