import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { getApiErrorMessage } from "@/lib/api-error.utils";
import type { PaginatedResponse } from "@/interfaces/pagination.interfaces";
import type {
  AttachStyleProfileDto,
  CreateProjectDto,
  GenerateProjectDetailsDto,
  Project,
  ProjectAiSuggestions,
  ProjectStyleProfileLink,
  ProjectsQueryType,
  UpdateProjectDto,
} from "../interfaces/projects.interfaces";

export const createProject = async (dto: CreateProjectDto): Promise<Project> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.projects.prefix, dto);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create project. Please try again.");
  }
};

export const generateProjectDetails = async (dto: GenerateProjectDetailsDto): Promise<ProjectAiSuggestions> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.projects.generate_details, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to generate suggestions. Please try again."));
  }
};

export const getProjects = async (query?: ProjectsQueryType): Promise<PaginatedResponse<Project>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.projects.prefix, { params: query });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch projects. Please try again.");
  }
};

export const getProject = async (id: string): Promise<Project> => {
  try {
    const response = await axiosInstance.get(`${ApiRoutes.projects.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch project. Please try again.");
  }
};

export const updateProject = async (id: string, dto: UpdateProjectDto): Promise<Project> => {
  try {
    const response = await axiosInstance.patch(`${ApiRoutes.projects.prefix}/${id}`, dto);
    return response.data;
  } catch (error) {
    throw new Error("Failed to update project. Please try again.");
  }
};

export const deleteProject = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`${ApiRoutes.projects.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete project. Please try again.");
  }
};

export const attachStyleProfile = async (id: string, dto: AttachStyleProfileDto): Promise<ProjectStyleProfileLink> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.projects.style_profiles(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to attach style profile. Please try again."));
  }
};

export const detachStyleProfile = async (id: string, styleProfileId: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(ApiRoutes.projects.style_profile(id, styleProfileId));
    return response.data;
  } catch (error) {
    throw new Error("Failed to detach style profile. Please try again.");
  }
};
