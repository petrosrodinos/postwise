import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { getApiErrorMessage } from "@/lib/api-error.utils";
import type { PaginatedResponse } from "@/interfaces/pagination.interfaces";
import type { AiUsageEvent, AiUsageQueryType, AiUsageSummary, AiUsageSummaryQueryType } from "../interfaces/ai-usage.interfaces";

export const getAiUsage = async (
  organisationId: string,
  query?: AiUsageQueryType,
): Promise<PaginatedResponse<AiUsageEvent>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.organisations.ai_usage(organisationId), { params: query });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch AI usage. Please try again."));
  }
};

export const getAiUsageSummary = async (
  organisationId: string,
  query?: AiUsageSummaryQueryType,
): Promise<AiUsageSummary> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.organisations.ai_usage_summary(organisationId), { params: query });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch AI usage summary. Please try again."));
  }
};
