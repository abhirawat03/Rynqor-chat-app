import {
  useQuery,
} from "@tanstack/react-query";

import {
  searchUsers,
} from "../../services/userService.js";

const useSearchUsersQuery =
  (query) => {

    return useQuery({

      queryKey: [
        "search-users",
        query,
      ],

      queryFn: () =>
        searchUsers(query),

      enabled:
        !!query.trim(),

      staleTime:
        1000 * 60 * 5,

      gcTime:
        1000 * 60 * 10,

    });

  };

export default useSearchUsersQuery;