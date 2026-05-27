import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../services/authService";

export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,

    retry: false,

    staleTime: 0,

    gcTime: 1000 * 60 * 5,

    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });
}