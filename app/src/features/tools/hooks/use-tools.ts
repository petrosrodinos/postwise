import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useWorkspaceStore } from "@/stores/workspace";
import {
  generateMetaTags,
  generateTitleVariations,
  generateToolImages,
  repurposeToolContent,
  reviseToolContent,
} from "../services/tools.services";
import type {
  GenerateMetaTagsDto,
  GenerateTitleVariationsDto,
  GenerateToolImagesDto,
  RepurposeToolContentDto,
  ReviseToolContentDto,
} from "../interfaces/tools.interfaces";

// Every hook here injects the active organisation and otherwise just calls
// the stateless AI endpoint with whatever content the page currently holds
// in local state — there is nothing to cache or invalidate.

export const useReviseToolContent = () => {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);

  return useMutation({
    mutationFn: (dto: Omit<ReviseToolContentDto, "organisation_id">) =>
      reviseToolContent({ ...dto, organisation_id: activeOrganisationId! }),
    onError: (error: Error) => {
      toast({ title: "Could not revise content", description: error.message, variant: "error" });
    },
  });
};

export const useRepurposeToolContent = () => {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);

  return useMutation({
    mutationFn: (dto: Omit<RepurposeToolContentDto, "organisation_id">) =>
      repurposeToolContent({ ...dto, organisation_id: activeOrganisationId! }),
    onError: (error: Error) => {
      toast({ title: "Could not repurpose content", description: error.message, variant: "error" });
    },
  });
};

export const useGenerateTitleVariations = () => {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);

  return useMutation({
    mutationFn: (dto: Omit<GenerateTitleVariationsDto, "organisation_id">) =>
      generateTitleVariations({ ...dto, organisation_id: activeOrganisationId! }),
    onError: (error: Error) => {
      toast({ title: "Could not generate title variations", description: error.message, variant: "error" });
    },
  });
};

export const useGenerateMetaTags = () => {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);

  return useMutation({
    mutationFn: (dto: Omit<GenerateMetaTagsDto, "organisation_id">) =>
      generateMetaTags({ ...dto, organisation_id: activeOrganisationId! }),
    onError: (error: Error) => {
      toast({ title: "Could not generate meta tags", description: error.message, variant: "error" });
    },
  });
};

export const useGenerateToolImages = () => {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);

  return useMutation({
    mutationFn: (dto: Omit<GenerateToolImagesDto, "organisation_id">) =>
      generateToolImages({ ...dto, organisation_id: activeOrganisationId! }),
    onError: (error: Error) => {
      toast({ title: "Could not generate images", description: error.message, variant: "error" });
    },
  });
};
