import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { getApiErrorMessage } from "@/lib/api-error.utils";
import type { PaginatedResponse } from "@/interfaces/pagination.interfaces";
import type { CreateIntegrationDto, Integration, IntegrationsQueryType, UpdateIntegrationDto } from "../interfaces/integrations.interfaces";

export const createIntegration = async (dto: CreateIntegrationDto): Promise<Integration> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.integrations.prefix, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to connect integration. Please try again."));
  }
};

export const getIntegrations = async (query?: IntegrationsQueryType): Promise<PaginatedResponse<Integration>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.integrations.prefix, { params: query });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch integrations. Please try again.");
  }
};

export const updateIntegration = async (id: string, dto: UpdateIntegrationDto): Promise<Integration> => {
  try {
    const response = await axiosInstance.patch(`${ApiRoutes.integrations.prefix}/${id}`, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update integration. Please try again."));
  }
};

export const deleteIntegration = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`${ApiRoutes.integrations.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to disconnect integration. Please try again.");
  }
};
