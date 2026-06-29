import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteAccount } from "../../services/userService.js";

const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccount,

    onSuccess: () => {
      toast.success("Account deleted successfully");
      queryClient.clear();
      window.location.href = "/auth";
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete account",
      );
    },
  });
};

export default useDeleteAccountMutation;
