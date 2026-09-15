import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth";
import { useWorkspaceStore } from "@/stores/workspace";
import {
  addOrganisationMember,
  createOrganisation,
  deleteOrganisation,
  getOrganisation,
  getOrganisationMembers,
  getOrganisations,
  removeOrganisationMember,
  resendOrganisationInvitation,
  updateOrganisation,
  updateOrganisationMemberRole,
} from "../services/organisations.services";
import type {
  AddOrganisationMemberDto,
  CreateOrganisationDto,
  Organisation,
  UpdateOrganisationDto,
  UpdateOrganisationMemberDto,
} from "../interfaces/organisations.interfaces";

const ORGANISATIONS_KEY = "organisations";
const ORGANISATION_MEMBERS_KEY = "organisation-members";

export const useOrganisations = () => {
  return useQuery({
    queryKey: [ORGANISATIONS_KEY],
    queryFn: () => getOrganisations(),
  });
};

const pickDefaultOrganisation = (organisations: Organisation[], userUuid: string | null) => {
  const ownCreated = organisations
    .filter((organisation) => organisation.created_by_user_id === userUuid)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (ownCreated[0]) return ownCreated[0];

  return [...organisations].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )[0];
};

// Ensures the workspace store always points at an organisation the user is
// still a member of, auto-selecting one (their own default workspace,
// falling back to their oldest membership) right after login or whenever
// the persisted selection turns out to be stale.
export const useEnsureActiveOrganisation = () => {
  const { data: organisations } = useOrganisations();
  const { user_uuid } = useAuthStore();
  const { active_organisation_id, setActiveWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (!organisations) return;

    const isActiveValid = organisations.some((organisation) => organisation.id === active_organisation_id);
    if (isActiveValid) return;

    const next = pickDefaultOrganisation(organisations, user_uuid);
    if (next) setActiveWorkspace({ id: next.id, name: next.name });
  }, [organisations, active_organisation_id, user_uuid, setActiveWorkspace]);
};

export const useOrganisation = (id?: string) => {
  return useQuery({
    queryKey: [ORGANISATIONS_KEY, id],
    queryFn: () => getOrganisation(id!),
    enabled: !!id,
  });
};

export const useCreateOrganisation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOrganisationDto) => createOrganisation(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANISATIONS_KEY] });
      toast({ title: "Organisation created", description: "Your new workspace is ready.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not create organisation", description: error.message, variant: "error" });
    },
  });
};

export const useUpdateOrganisation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOrganisationDto }) => updateOrganisation(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANISATIONS_KEY] });
      toast({ title: "Organisation updated", description: "Your changes have been saved.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not update organisation", description: error.message, variant: "error" });
    },
  });
};

export const useDeleteOrganisation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOrganisation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANISATIONS_KEY] });
      toast({ title: "Organisation deleted", description: "The workspace has been removed.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not delete organisation", description: error.message, variant: "error" });
    },
  });
};

export const useOrganisationMembers = (organisationId?: string) => {
  return useQuery({
    queryKey: [ORGANISATION_MEMBERS_KEY, organisationId],
    queryFn: () => getOrganisationMembers(organisationId!),
    enabled: !!organisationId,
  });
};

export const useAddOrganisationMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organisationId, dto }: { organisationId: string; dto: AddOrganisationMemberDto }) =>
      addOrganisationMember(organisationId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ORGANISATION_MEMBERS_KEY] });
      toast({
        title: "Member added",
        description:
          variables.dto.send_invite === false
            ? "Share their password with them directly — no invite email was sent."
            : "An invitation email has been sent so they can set their own password.",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Could not add member", description: error.message, variant: "error" });
    },
  });
};

export const useUpdateOrganisationMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      organisationId,
      memberId,
      dto,
    }: {
      organisationId: string;
      memberId: string;
      dto: UpdateOrganisationMemberDto;
    }) => updateOrganisationMemberRole(organisationId, memberId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANISATION_MEMBERS_KEY] });
      toast({ title: "Role updated", description: "The member's role has been changed.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not update role", description: error.message, variant: "error" });
    },
  });
};

export const useResendOrganisationInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organisationId, memberId }: { organisationId: string; memberId: string }) =>
      resendOrganisationInvitation(organisationId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANISATION_MEMBERS_KEY] });
      toast({ title: "Invitation resent", description: "A new invitation email has been sent.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not resend invitation", description: error.message, variant: "error" });
    },
  });
};

export const useRemoveOrganisationMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organisationId, memberId }: { organisationId: string; memberId: string }) =>
      removeOrganisationMember(organisationId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORGANISATION_MEMBERS_KEY] });
      toast({ title: "Member removed", description: "They no longer have access to this organisation.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not remove member", description: error.message, variant: "error" });
    },
  });
};
