import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../services/authService";

export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,

    // Allow 1 retry so the Axios token-refresh interceptor has time to
    // refresh the access token and re-fetch before React Query marks it failed.
    retry: 1,

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,
  });
};
