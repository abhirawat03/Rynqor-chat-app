import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { searchUsers } from "../../services/userService.js";

const useSearchUsersQuery = (query) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  return useQuery({
    queryKey: ["search-users", debouncedQuery],

    queryFn: () => searchUsers(debouncedQuery),

    enabled: !!debouncedQuery.trim(),

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 10,
  });
};

export default useSearchUsersQuery;
