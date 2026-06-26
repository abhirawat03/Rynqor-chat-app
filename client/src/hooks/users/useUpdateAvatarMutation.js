import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAvatar } from "../../services/userService";

const useUpdateAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAvatar,
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], (oldData) => ({
        ...oldData,
        ...data,
      }));
    },
  });
};

export default useUpdateAvatarMutation;
