import { isAxiosError } from "axios";

export function getApiErrorMessage(
  err: unknown,
  fallback = "Something went wrong"
): string {
  if (isAxiosError(err) && typeof err.response?.data?.error === "string") {
    return err.response.data.error;
  }
  return fallback;
}
