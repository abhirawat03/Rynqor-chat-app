import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutSession } from "../../services/authService";

const useLogoutSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn:
        logoutSession,

    onSuccess: () => {

        queryClient.invalidateQueries({
            queryKey:
                ["sessions"],
        });

    },
});
};

export default useLogoutSessionMutation;