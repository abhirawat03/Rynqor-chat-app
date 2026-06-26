import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAvatar } from "../../services/userService";

const useDeleteAvatarMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAvatar,
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], (oldData) => ({
        ...oldData,
        ...data,
      }));
    },
  });
};

export default useDeleteAvatarMutation;
