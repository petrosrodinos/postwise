import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { getApiErrorMessage } from "@/lib/api-error.utils";
import { formatAuthUser } from "@/features/auth/utils/auth.utils";
import type { LoggedInUser } from "@/features/user/interfaces/user.interface";
import type {
  AcceptInvitationDto,
  AddOrganisationMemberDto,
  CreateOrganisationDto,
  InvitationDetails,
  Organisation,
  OrganisationMember,
  UpdateOrganisationDto,
  UpdateOrganisationMemberDto,
} from "../interfaces/organisations.interfaces";

export const createOrganisation = async (dto: CreateOrganisationDto): Promise<Organisation> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.organisations.prefix, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create organisation. Please try again."));
  }
};

export const getOrganisations = async (): Promise<Organisation[]> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.organisations.prefix);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch organisations. Please try again.");
  }
};

export const getOrganisation = async (id: string): Promise<Organisation> => {
  try {
    const response = await axiosInstance.get(`${ApiRoutes.organisations.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch organisation. Please try again.");
  }
};

export const updateOrganisation = async (id: string, dto: UpdateOrganisationDto): Promise<Organisation> => {
  try {
    const response = await axiosInstance.patch(`${ApiRoutes.organisations.prefix}/${id}`, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update organisation. Please try again."));
  }
};

export const deleteOrganisation = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`${ApiRoutes.organisations.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete organisation. Please try again."));
  }
};

export const getOrganisationMembers = async (organisationId: string): Promise<OrganisationMember[]> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.organisations.members(organisationId));
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch organisation members. Please try again.");
  }
};

export const addOrganisationMember = async (organisationId: string, dto: AddOrganisationMemberDto): Promise<OrganisationMember> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.organisations.members(organisationId), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to add member. Please try again."));
  }
};

export const updateOrganisationMemberRole = async (
  organisationId: string,
  memberId: string,
  dto: UpdateOrganisationMemberDto,
): Promise<OrganisationMember> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.organisations.member(organisationId, memberId), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update member role. Please try again."));
  }
};

export const removeOrganisationMember = async (organisationId: string, memberId: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(ApiRoutes.organisations.member(organisationId, memberId));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to remove member. Please try again."));
  }
};

export const resendOrganisationInvitation = async (organisationId: string, memberId: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.organisations.resend_invitation(organisationId, memberId));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to resend invitation. Please try again."));
  }
};

export const getInvitationDetails = async (token: string): Promise<InvitationDetails> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.organisation_invitations.prefix, { params: { token } });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "This invitation link is invalid or has expired."));
  }
};

export const acceptOrganisationInvitation = async (dto: AcceptInvitationDto): Promise<LoggedInUser> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.organisation_invitations.accept, dto);
    return formatAuthUser(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "This invitation link is invalid or has expired."));
  }
};
