import { isAxiosError } from "axios";

export function getApiErrorMessage(
  err: unknown,
  fallback = "Algo salió mal"
): string {
  if (isAxiosError(err) && typeof err.response?.data?.error === "string") {
    return err.response.data.error;
  }
  return fallback;
}
