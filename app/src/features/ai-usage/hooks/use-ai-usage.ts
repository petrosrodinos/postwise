import { useQuery } from "@tanstack/react-query";
import { getAiUsage, getAiUsageSummary } from "../services/ai-usage.services";
import type { AiUsageQueryType, AiUsageSummaryQueryType } from "../interfaces/ai-usage.interfaces";

const AI_USAGE_KEY = "ai-usage";
const AI_USAGE_SUMMARY_KEY = "ai-usage-summary";

export const useAiUsage = (organisationId?: string, query?: AiUsageQueryType) => {
  return useQuery({
    queryKey: [AI_USAGE_KEY, organisationId, query],
    queryFn: () => getAiUsage(organisationId!, query),
    enabled: !!organisationId,
  });
};

export const useAiUsageSummary = (organisationId?: string, query?: AiUsageSummaryQueryType) => {
  return useQuery({
    queryKey: [AI_USAGE_SUMMARY_KEY, organisationId, query],
    queryFn: () => getAiUsageSummary(organisationId!, query),
    enabled: !!organisationId,
  });
};
