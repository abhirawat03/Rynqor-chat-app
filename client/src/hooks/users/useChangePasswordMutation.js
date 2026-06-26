import { useMutation } from "@tanstack/react-query";

import toast from "react-hot-toast";

import { changePassword } from "../../services/userService.js";

const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: changePassword,

    onSuccess: (data) => {
      toast.success(data?.message || "Password changed successfully");
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to change password",
      );
    },
  });
};

export default useChangePasswordMutation;
