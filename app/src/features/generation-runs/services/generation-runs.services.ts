import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { getApiErrorMessage } from "@/lib/api-error.utils";
import type { PaginatedResponse } from "@/interfaces/pagination.interfaces";
import type {
  CreateGenerationRunDto,
  CreateRssGenerationRunDto,
  GenerationRun,
  GenerationRunsQueryType,
} from "../interfaces/generation-runs.interfaces";

export const createGenerationRun = async (dto: CreateGenerationRunDto): Promise<GenerationRun> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.generation_runs.prefix, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to start generation. Please try again."));
  }
};

export const createRssGenerationRun = async (dto: CreateRssGenerationRunDto): Promise<GenerationRun> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.generation_runs.from_rss, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to generate posts from RSS. Please try again."));
  }
};

export const getGenerationRuns = async (query: GenerationRunsQueryType): Promise<PaginatedResponse<GenerationRun>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.generation_runs.prefix, { params: query });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch generations. Please try again.");
  }
};

export const getGenerationRun = async (id: string): Promise<GenerationRun> => {
  try {
    const response = await axiosInstance.get(`${ApiRoutes.generation_runs.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch generation. Please try again.");
  }
};
