import { isAxiosError } from "axios";

// Extracts the API's `message` field from an Axios error, falling back to a
// human-readable default when the response doesn't include one.
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return fallback;
}
