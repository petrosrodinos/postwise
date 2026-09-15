import { useQuery } from "@tanstack/react-query";
import { getActivityLogs } from "../services/activity-logs.services";
import type { ActivityLogsQueryType } from "../interfaces/activity-logs.interfaces";

const ACTIVITY_LOGS_KEY = "activity-logs";

export const useActivityLogs = (organisationId?: string, query?: ActivityLogsQueryType) => {
  return useQuery({
    queryKey: [ACTIVITY_LOGS_KEY, organisationId, query],
    queryFn: () => getActivityLogs(organisationId!, query),
    enabled: !!organisationId,
  });
};
