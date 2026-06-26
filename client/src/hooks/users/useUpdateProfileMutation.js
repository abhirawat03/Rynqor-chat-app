import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProfile } from "../../services/userService";

const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], (oldData) => ({
        ...oldData,
        ...data,
      }));
    },
  });
};

export default useUpdateProfileMutation;
