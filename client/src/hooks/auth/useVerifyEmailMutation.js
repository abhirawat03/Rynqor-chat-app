import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyEmail } from "../../services/authService.js";
import toast from "react-hot-toast";

export const useVerifyEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, otp }) => verifyEmail(email, otp),
    onSuccess: (data) => {
      // Set the currentUser cache which logs the user in immediately
      queryClient.setQueryData(["currentUser"], data);
      toast.success("Email verified successfully!");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Verification failed";
      toast.error(message);
      if (import.meta.env.MODE !== "production") {
        console.error("Verification failed:", error);
      }
    },
  });
};
