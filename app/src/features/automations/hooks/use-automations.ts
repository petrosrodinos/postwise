import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { getProjects } from "@/features/projects/services/projects.services";
import { useWorkspaceStore } from "@/stores/workspace";
import { createAutomation, deleteAutomation, getAutomation, getAutomations, updateAutomation } from "../services/automations.services";
import type { CreateAutomationDto, UpdateAutomationDto } from "../interfaces/automations.interfaces";

const AUTOMATIONS_KEY = "automations";
const ALL_AUTOMATIONS_KEY = "automations-all";

export const useProjectAutomations = (projectId?: string) => {
  return useQuery({
    queryKey: [AUTOMATIONS_KEY, projectId],
    queryFn: () => getAutomations({ project_id: projectId!, limit: 100 }),
    enabled: !!projectId,
  });
};

// The Automation page shows every automation across the active workspace's
// projects — the API scopes automations by project_id, so this fans out one
// request per project and flattens the results.
export const useAllAutomations = () => {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);

  const projectsQuery = useQuery({
    queryKey: ["projects", { organisation_id: activeOrganisationId ?? undefined, limit: 100 }],
    queryFn: () => getProjects({ organisation_id: activeOrganisationId ?? undefined, limit: 100 }),
  });

  const projects = projectsQuery.data?.data ?? [];

  const automationQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: [AUTOMATIONS_KEY, project.id],
      queryFn: () => getAutomations({ project_id: project.id, limit: 100 }),
      enabled: !!projectsQuery.data,
    })),
  });

  const isLoading = projectsQuery.isLoading || (projects.length > 0 && automationQueries.some((query) => query.isLoading));
  const automations = automationQueries.flatMap((query) => query.data?.data ?? []);

  return {
    data: automations,
    projects,
    isLoading,
    queryKey: [ALL_AUTOMATIONS_KEY, activeOrganisationId],
  };
};

export const useAutomation = (id?: string) => {
  return useQuery({
    queryKey: [AUTOMATIONS_KEY, "detail", id],
    queryFn: () => getAutomation(id!),
    enabled: !!id,
  });
};

export const useCreateAutomation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAutomationDto) => createAutomation(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTOMATIONS_KEY] });
      toast({ title: "Automation created", description: "It will run automatically on schedule.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not create automation", description: error.message, variant: "error" });
    },
  });
};

export const useUpdateAutomation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAutomationDto }) => updateAutomation(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTOMATIONS_KEY] });
      toast({ title: "Automation updated", description: "Your changes have been saved.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not update automation", description: error.message, variant: "error" });
    },
  });
};

export const useDeleteAutomation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAutomation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTOMATIONS_KEY] });
      toast({ title: "Automation deleted", description: "It has been removed.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not delete automation", description: error.message, variant: "error" });
    },
  });
};
