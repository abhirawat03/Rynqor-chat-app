import { useQuery } from "@tanstack/react-query";

import { getUser } from "../../services/userService.js";

const useUserQuery = (id) => {
  return useQuery({
    queryKey: ["user", id],

    queryFn: () => getUser(id),

    enabled: !!id,
    // User profiles only change on explicit update — match server Redis TTL
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export { useUserQuery };
