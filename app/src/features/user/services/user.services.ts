import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { getApiErrorMessage } from "@/lib/api-error.utils";
import type { UpdatePasswordDto, UpdateUserDto, User } from "../interfaces/user.interface";

export const getMe = async (): Promise<User> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.users.me);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch your profile. Please try again.");
  }
};

export const updateMe = async (dto: UpdateUserDto): Promise<User> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.users.me, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update your profile. Please try again."));
  }
};

export const updateMyPassword = async (dto: UpdatePasswordDto): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.users.me_password, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update your password. Please try again."));
  }
};
