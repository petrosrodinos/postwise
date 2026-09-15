import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { getApiErrorMessage } from "@/lib/api-error.utils";
import type { PaginatedResponse } from "@/interfaces/pagination.interfaces";
import type {
  CreateRssFeedDto,
  FetchRssItemsDto,
  RssFeed,
  RssFeedItem,
  RssFeedsQueryType,
  UpdateRssFeedDto,
} from "../interfaces/rss-feeds.interfaces";

export const createRssFeed = async (dto: CreateRssFeedDto): Promise<RssFeed> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.rss_feeds.prefix, dto);
    return response.data;
  } catch (error) {
    throw new Error("Failed to add RSS feed. Please try again.");
  }
};

export const getRssFeeds = async (query: RssFeedsQueryType): Promise<PaginatedResponse<RssFeed>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.rss_feeds.prefix, { params: query });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch RSS feeds. Please try again.");
  }
};

export const getRssFeed = async (id: string): Promise<RssFeed> => {
  try {
    const response = await axiosInstance.get(`${ApiRoutes.rss_feeds.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch RSS feed. Please try again.");
  }
};

export const updateRssFeed = async (id: string, dto: UpdateRssFeedDto): Promise<RssFeed> => {
  try {
    const response = await axiosInstance.patch(`${ApiRoutes.rss_feeds.prefix}/${id}`, dto);
    return response.data;
  } catch (error) {
    throw new Error("Failed to update RSS feed. Please try again.");
  }
};

export const deleteRssFeed = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`${ApiRoutes.rss_feeds.prefix}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete RSS feed. Please try again.");
  }
};

export const fetchRssItems = async (id: string, dto: FetchRssItemsDto): Promise<RssFeedItem[]> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.rss_feeds.fetch_items(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch feed items. Please try again."));
  }
};
