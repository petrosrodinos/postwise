import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { getApiErrorMessage } from "@/lib/api-error.utils";
import type { PaginatedResponse } from "@/interfaces/pagination.interfaces";
import type {
  AnalyzeStyleProfileDto,
  CreateStyleProfileDto,
  ScrapePostsDto,
  ScrapedPost,
  StyleProfile,
  StyleProfilesQueryType,
  UpdateStyleProfileDto,
} from "../interfaces/style-profiles.interfaces";

export const createStyleProfile = async (dto: CreateStyleProfileDto): Promise<StyleProfile> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.style_profiles.prefix, dto);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create style profile. Please try again.");
  }
};

export const getStyleProfiles = async (query?: StyleProfilesQueryType): Promise<PaginatedResponse<StyleProfile>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.style_profiles.prefix, { params: query });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch style profiles. Please try again.");
  }
};

export const getStyleProfile = async (id: string): Promise<StyleProfile> => {
  try {
    const response = await axiosInstance.get(`${ApiRoutes.style_profiles.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch style profile. Please try again.");
  }
};

export const updateStyleProfile = async (id: string, dto: UpdateStyleProfileDto): Promise<StyleProfile> => {
  try {
    const response = await axiosInstance.patch(`${ApiRoutes.style_profiles.prefix}/${id}`, dto);
    return response.data;
  } catch (error) {
    throw new Error("Failed to update style profile. Please try again.");
  }
};

export const deleteStyleProfile = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`${ApiRoutes.style_profiles.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete style profile. Please try again.");
  }
};

export const analyzeStyleProfile = async (id: string, dto: AnalyzeStyleProfileDto): Promise<StyleProfile> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.style_profiles.analyze(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to analyze style profile. Please try again."));
  }
};

export const scrapePosts = async (
  id: string,
  dto: ScrapePostsDto,
): Promise<ScrapedPost[]> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.style_profiles.scrape_posts(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch posts. Please try again."));
  }
};
