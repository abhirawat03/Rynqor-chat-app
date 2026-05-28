import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../../services/authService";

const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      // remove all cached data
      queryClient.clear();

      // redirect
      window.location.href = "/auth";
    },
    onError: () => {

      queryClient.clear();

      window.location.href =
        "/auth";

    }
  });
};

export default useLogoutMutation;