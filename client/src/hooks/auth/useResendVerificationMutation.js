import { useMutation } from "@tanstack/react-query";
import { resendVerification } from "../../services/authService.js";
import toast from "react-hot-toast";

export const useResendVerificationMutation = () => {
  return useMutation({
    mutationFn: ({ email }) => resendVerification(email),
    onSuccess: () => {
      toast.success("Verification code resent successfully!");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to resend verification code";
      toast.error(message);
      if (import.meta.env.MODE !== "production") {
        console.error("Resend verification failed:", error);
      }
    },
  });
};
