import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { getApiErrorMessage } from "@/lib/api-error.utils";
import type { PaginatedResponse } from "@/interfaces/pagination.interfaces";
import type { ActivityLog, ActivityLogsQueryType } from "../interfaces/activity-logs.interfaces";

export const getActivityLogs = async (
  organisationId: string,
  query?: ActivityLogsQueryType,
): Promise<PaginatedResponse<ActivityLog>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.organisations.activity_logs(organisationId), { params: query });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch activity. Please try again."));
  }
};
