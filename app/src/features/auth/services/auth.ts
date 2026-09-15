import { formatAuthUser } from "../utils/auth.utils";
import axiosInstance from "@/config/api/axios";
import type { SignInUser, SignUpUser } from "../interfaces/auth.interface";
import { ApiRoutes } from "@/config/api/routes";
import type { LoggedInUser } from "@/features/user/interfaces/user.interface";
import { getApiErrorMessage } from "@/lib/api-error.utils";

export const signIn = async (
    { email, password }: SignInUser,
): Promise<LoggedInUser> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.auth.email.login, {
            email,
            password,
        });

        const auth_response = response.data;
        return formatAuthUser(auth_response);

    } catch (error) {
        throw new Error("Failed to sign in. Please try again.");
    }
};

export const signUp = async ({ name, email, password }: SignUpUser): Promise<LoggedInUser> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.auth.email.register, {
            name,
            email,
            password,
        });

        const auth_response = response.data;
        return formatAuthUser(auth_response);
    } catch (error) {
        throw new Error("Failed to sign up. Please try again.");
    }
};

export const refreshAccountToken = async (): Promise<LoggedInUser> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.auth.email.refresh_token);
        return formatAuthUser(response.data);
    } catch (error) {
        throw new Error(getApiErrorMessage(error, "Failed to refresh account token. Please try again."));
    }
};

export const adminLoginToAccount = async (account_uuid: string): Promise<LoggedInUser> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.auth.email.admin_login_to_account(account_uuid));
        return formatAuthUser(response.data);
    } catch (error) {
        throw new Error(getApiErrorMessage(error, "Failed to admin login to account. Please try again."));
    }
};

