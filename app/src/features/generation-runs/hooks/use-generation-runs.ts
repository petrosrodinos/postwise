import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { createGenerationRun, getGenerationRun, getGenerationRuns } from "../services/generation-runs.services";
import type { CreateGenerationRunDto, GenerationRunsQueryType } from "../interfaces/generation-runs.interfaces";

const GENERATION_RUNS_KEY = "generation-runs";

export const useGenerationRuns = (query: GenerationRunsQueryType) => {
  return useQuery({
    queryKey: [GENERATION_RUNS_KEY, query],
    queryFn: () => getGenerationRuns(query),
    enabled: !!query.project_id,
  });
};

export const useGenerationRun = (id?: string) => {
  return useQuery({
    queryKey: [GENERATION_RUNS_KEY, id],
    queryFn: () => getGenerationRun(id!),
    enabled: !!id,
  });
};

export const useCreateGenerationRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateGenerationRunDto) => createGenerationRun(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GENERATION_RUNS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({ title: "Batch generated", description: "New drafts are ready to review.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not generate posts", description: error.message, variant: "error" });
    },
  });
};
