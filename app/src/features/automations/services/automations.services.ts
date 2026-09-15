import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { PaginatedResponse } from "@/interfaces/pagination.interfaces";
import type { Automation, AutomationsQueryType, CreateAutomationDto, UpdateAutomationDto } from "../interfaces/automations.interfaces";

export const createAutomation = async (dto: CreateAutomationDto): Promise<Automation> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.automations.prefix, dto);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create automation. Please try again.");
  }
};

export const getAutomations = async (query: AutomationsQueryType): Promise<PaginatedResponse<Automation>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.automations.prefix, { params: query });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch automations. Please try again.");
  }
};

export const getAutomation = async (id: string): Promise<Automation> => {
  try {
    const response = await axiosInstance.get(`${ApiRoutes.automations.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch automation. Please try again.");
  }
};

export const updateAutomation = async (id: string, dto: UpdateAutomationDto): Promise<Automation> => {
  try {
    const response = await axiosInstance.patch(`${ApiRoutes.automations.prefix}/${id}`, dto);
    return response.data;
  } catch (error) {
    throw new Error("Failed to update automation. Please try again.");
  }
};

export const deleteAutomation = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`${ApiRoutes.automations.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete automation. Please try again.");
  }
};
