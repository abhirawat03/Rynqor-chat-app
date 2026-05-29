import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../services/authService";

export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,

    retry: false,

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,
  });
};