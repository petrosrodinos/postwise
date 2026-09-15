import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  addPostsToGenerationRun,
  createGenerationRun,
  createRssGenerationRun,
  getGenerationRun,
  getGenerationRuns,
} from "../services/generation-runs.services";
import type {
  AddPostsToGenerationRunDto,
  CreateGenerationRunDto,
  CreateRssGenerationRunDto,
  GenerationRunsQueryType,
} from "../interfaces/generation-runs.interfaces";

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

export const useAddPostsToGenerationRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AddPostsToGenerationRunDto }) => addPostsToGenerationRun(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GENERATION_RUNS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({ title: "Posts added", description: "New drafts have been added to this batch.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not generate more posts", description: error.message, variant: "error" });
    },
  });
};

export const useCreateRssGenerationRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRssGenerationRunDto) => createRssGenerationRun(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GENERATION_RUNS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({ title: "Batch generated", description: "New blog posts are ready to review.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not generate posts", description: error.message, variant: "error" });
    },
  });
};
