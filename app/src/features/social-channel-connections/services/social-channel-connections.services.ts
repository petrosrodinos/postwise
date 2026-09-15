import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { getApiErrorMessage } from "@/lib/api-error.utils";
import type { PaginatedResponse } from "@/interfaces/pagination.interfaces";
import type {
  CreateSocialChannelConnectionDto,
  SocialChannelConnection,
  SocialChannelConnectionsQueryType,
  UpdateSocialChannelConnectionDto,
} from "../interfaces/social-channel-connections.interfaces";

export const createSocialChannelConnection = async (dto: CreateSocialChannelConnectionDto): Promise<SocialChannelConnection> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.social_channel_connections.prefix, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to connect channel. Please try again."));
  }
};

export const getSocialChannelConnections = async (
  query?: SocialChannelConnectionsQueryType,
): Promise<PaginatedResponse<SocialChannelConnection>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.social_channel_connections.prefix, { params: query });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch connected channels. Please try again.");
  }
};

export const updateSocialChannelConnection = async (
  id: string,
  dto: UpdateSocialChannelConnectionDto,
): Promise<SocialChannelConnection> => {
  try {
    const response = await axiosInstance.patch(`${ApiRoutes.social_channel_connections.prefix}/${id}`, dto);
    return response.data;
  } catch (error) {
    throw new Error("Failed to update channel connection. Please try again.");
  }
};

export const deleteSocialChannelConnection = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`${ApiRoutes.social_channel_connections.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to disconnect channel. Please try again.");
  }
};
