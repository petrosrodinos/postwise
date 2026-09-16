import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useWorkspaceStore } from "@/stores/workspace";
import {
  addPostAttachment,
  createPost,
  deletePost,
  getPost,
  getPosts,
  publishPost,
  removePostAttachment,
  repurposePost,
  revisePost,
  schedulePost,
  updatePost,
} from "../services/posts.services";
import type {
  AddPostAttachmentDto,
  CreatePostDto,
  PostsQueryType,
  RepurposePostDto,
  RevisePostDto,
  SchedulePostDto,
  UpdatePostDto,
} from "../interfaces/posts.interfaces";

const POSTS_KEY = "posts";

export const usePosts = (query?: Omit<PostsQueryType, "organisation_id">) => {
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);
  const resolvedQuery = { ...query, organisation_id: activeOrganisationId! };

  return useQuery({
    queryKey: [POSTS_KEY, resolvedQuery],
    queryFn: () => getPosts(resolvedQuery),
    enabled: !!activeOrganisationId,
  });
};

export const usePost = (id?: string) => {
  return useQuery({
    queryKey: [POSTS_KEY, id],
    queryFn: () => getPost(id!),
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const activeOrganisationId = useWorkspaceStore((state) => state.active_organisation_id);

  return useMutation({
    mutationFn: (dto: Omit<CreatePostDto, "organisation_id">) =>
      createPost({ ...dto, organisation_id: activeOrganisationId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
      toast({ title: "Post created", description: "Your draft has been created.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not create post", description: error.message, variant: "error" });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePostDto }) => updatePost(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
      toast({ title: "Post updated", description: "Your changes have been saved.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not update post", description: error.message, variant: "error" });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
      toast({ title: "Post deleted", description: "The post has been removed.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not delete post", description: error.message, variant: "error" });
    },
  });
};

export const useSchedulePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: SchedulePostDto }) => schedulePost(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
      toast({ title: "Post scheduled", description: "It will publish automatically at the scheduled time.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not schedule post", description: error.message, variant: "error" });
    },
  });
};

export const usePublishPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
      toast({ title: "Post published", description: "Your post is on its way out.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not publish post", description: error.message, variant: "error" });
    },
  });
};

export const useRepurposePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RepurposePostDto }) => repurposePost(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
      toast({ title: "Post repurposed", description: "New drafts were generated from this post.", duration: 2500 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not repurpose post", description: error.message, variant: "error" });
    },
  });
};

export const useRevisePost = () => {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RevisePostDto }) => revisePost(id, dto),
    onError: (error: Error) => {
      toast({ title: "Could not revise post", description: error.message, variant: "error" });
    },
  });
};

export const useAddPostAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AddPostAttachmentDto }) => addPostAttachment(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
      toast({ title: "Attachment added", description: "The document was attached to this post.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not attach document", description: error.message, variant: "error" });
    },
  });
};

export const useRemovePostAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, attachmentId }: { id: string; attachmentId: string }) => removePostAttachment(id, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
      toast({ title: "Attachment removed", description: "The document was detached from this post.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not remove attachment", description: error.message, variant: "error" });
    },
  });
};
