import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api";

export const queryKeys = {
  session: ["session"] as const,
  currentPeriod: (startDate: string, endDate: string) => ["current-period", startDate, endDate] as const
};

const retryTransientRequest = (failureCount: number, error: unknown) => {
  if (failureCount >= 1) return false;
  return !(error instanceof ApiError) || error.status >= 500;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: retryTransientRequest
    },
    mutations: { retry: false }
  }
});
