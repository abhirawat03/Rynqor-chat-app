import { useQuery } from "@tanstack/react-query";

import { getUser } from "../../services/userService.js";

const useUserQuery = (id) => {
  return useQuery({
    queryKey: ["user", id],

    queryFn: () => getUser(id),

    enabled: !!id,
  });
};

export { useUserQuery };
