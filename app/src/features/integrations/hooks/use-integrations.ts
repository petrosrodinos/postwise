import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useWorkspaceStore } from "@/stores/workspace";
import { createIntegration, deleteIntegration, getIntegrations, updateIntegration } from "../services/integrations.services";
import type { CreateIntegrationDto, IntegrationsQueryType, UpdateIntegrationDto } from "../interfaces/integrations.interfaces";

const INTEGRATIONS_KEY = "integrations";

export const useIntegrations = (query?: Omit<IntegrationsQueryType, "organisation_id">) => {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);
  const resolvedQuery = { ...query, organisation_id: activeOrganisationId! };

  return useQuery({
    queryKey: [INTEGRATIONS_KEY, resolvedQuery],
    queryFn: () => getIntegrations(resolvedQuery),
    enabled: !!activeOrganisationId,
  });
};

export const useCreateIntegration = () => {
  const queryClient = useQueryClient();
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);

  return useMutation({
    mutationFn: (dto: Omit<CreateIntegrationDto, "organisation_id">) =>
      createIntegration({ ...dto, organisation_id: activeOrganisationId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INTEGRATIONS_KEY] });
      toast({ title: "Integration connected", description: "Blog posts can now be published to it.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not connect integration", description: error.message, variant: "error" });
    },
  });
};

export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateIntegrationDto }) => updateIntegration(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INTEGRATIONS_KEY] });
      toast({ title: "Integration updated", description: "Your changes have been saved.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not update integration", description: error.message, variant: "error" });
    },
  });
};

export const useDeleteIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIntegration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INTEGRATIONS_KEY] });
      toast({ title: "Integration disconnected", description: "Posts will no longer publish to it.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not disconnect integration", description: error.message, variant: "error" });
    },
  });
};
