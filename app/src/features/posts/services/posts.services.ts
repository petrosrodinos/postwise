import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { getApiErrorMessage } from "@/lib/api-error.utils";
import type { PaginatedResponse } from "@/interfaces/pagination.interfaces";
import type {
  AddPostAttachmentDto,
  AddPostChannelDto,
  CreatePostDto,
  Post,
  PostAttachment,
  PostChannel,
  PostsQueryType,
  RepurposePostDto,
  RevisePostDto,
  RevisedPostDraft,
  SchedulePostDto,
  UpdatePostDto,
} from "../interfaces/posts.interfaces";

export const createPost = async (dto: CreatePostDto): Promise<Post> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.posts.prefix, dto);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create post. Please try again.");
  }
};

export const getPosts = async (query?: PostsQueryType): Promise<PaginatedResponse<Post>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.posts.prefix, { params: query });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch posts. Please try again.");
  }
};

export const getPost = async (id: string): Promise<Post> => {
  try {
    const response = await axiosInstance.get(`${ApiRoutes.posts.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch post. Please try again.");
  }
};

export const updatePost = async (id: string, dto: UpdatePostDto): Promise<Post> => {
  try {
    const response = await axiosInstance.patch(`${ApiRoutes.posts.prefix}/${id}`, dto);
    return response.data;
  } catch (error) {
    throw new Error("Failed to update post. Please try again.");
  }
};

export const deletePost = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`${ApiRoutes.posts.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete post. Please try again.");
  }
};

export const schedulePost = async (id: string, dto: SchedulePostDto): Promise<Post> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.posts.schedule(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to schedule post. Please try again."));
  }
};

export const publishPost = async (id: string): Promise<Post> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.posts.publish(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to publish post. Please try again."));
  }
};

export const repurposePost = async (id: string, dto: RepurposePostDto): Promise<Post[]> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.posts.repurpose(id), dto);
    return response.data;
  } catch (error) {
    throw new Error("Failed to repurpose post. Please try again.");
  }
};

export const revisePost = async (id: string, dto: RevisePostDto): Promise<RevisedPostDraft> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.posts.revise(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to revise post. Please try again."));
  }
};

export const addPostAttachment = async (id: string, dto: AddPostAttachmentDto): Promise<PostAttachment> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.posts.attachments(id), dto);
    return response.data;
  } catch (error) {
    throw new Error("Failed to attach document to post. Please try again.");
  }
};

export const removePostAttachment = async (id: string, attachmentId: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(ApiRoutes.posts.attachment(id, attachmentId));
    return response.data;
  } catch (error) {
    throw new Error("Failed to remove attachment. Please try again.");
  }
};

export const addPostChannel = async (id: string, dto: AddPostChannelDto): Promise<PostChannel> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.posts.channels(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to add channel target. Please try again."));
  }
};

export const removePostChannel = async (id: string, channelId: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(ApiRoutes.posts.channel(id, channelId));
    return response.data;
  } catch (error) {
    throw new Error("Failed to remove channel target. Please try again.");
  }
};
