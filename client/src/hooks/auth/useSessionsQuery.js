import { useQuery } from "@tanstack/react-query";

import { getSessions } from "../../services/authService";

const useSessionsQuery = () => {
  return useQuery({
    queryKey: ["sessions"],

    queryFn: getSessions,

    staleTime: 1000 * 60, // 1 min

    gcTime: 1000 * 60 * 5,

    refetchOnWindowFocus: true,
  });
};

export default useSessionsQuery;
