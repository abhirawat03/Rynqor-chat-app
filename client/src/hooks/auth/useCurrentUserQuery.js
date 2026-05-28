import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../services/authService";

export const useCurrentUserQuery = () => {
  const isAuthPage =

    window.location.pathname ===
    "/auth";
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,

    enabled: !isAuthPage,

    retry: false,

    staleTime: 0,

    gcTime: 1000 * 60 * 5,

    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  });
}