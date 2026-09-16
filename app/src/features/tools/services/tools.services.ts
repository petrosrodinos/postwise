import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { getApiErrorMessage } from "@/lib/api-error.utils";
import type { RevisedPostDraft } from "@/features/posts/interfaces/posts.interfaces";
import type {
  GenerateMetaTagsDto,
  GenerateTitleVariationsDto,
  GenerateToolImagesDto,
  GeneratedImage,
  MetaTagsDraft,
  RepurposeToolContentDto,
  RepurposeToolContentResult,
  ReviseToolContentDto,
} from "../interfaces/tools.interfaces";

export const reviseToolContent = async (dto: ReviseToolContentDto): Promise<RevisedPostDraft> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.tools.revise, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to revise content. Please try again."));
  }
};

export const repurposeToolContent = async (dto: RepurposeToolContentDto): Promise<RepurposeToolContentResult[]> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.tools.repurpose, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to repurpose content. Please try again."));
  }
};

export const generateTitleVariations = async (dto: GenerateTitleVariationsDto): Promise<string[]> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.tools.title_variations, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to generate title variations. Please try again."));
  }
};

export const generateMetaTags = async (dto: GenerateMetaTagsDto): Promise<MetaTagsDraft> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.tools.meta_tags, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to generate meta tags. Please try again."));
  }
};

export const generateToolImages = async (dto: GenerateToolImagesDto): Promise<GeneratedImage[]> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.tools.images, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to generate images. Please try again."));
  }
};
