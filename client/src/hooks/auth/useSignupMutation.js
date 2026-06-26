import { useMutation } from "@tanstack/react-query";
import { signup } from "../../services/authService";
import toast from "react-hot-toast";

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
      // Do not set currentUser yet; the user must verify their email first.
    },
    onError: (error) => {
      toast.error("Signup failed");
      if (import.meta.env.MODE !== "production")
        console.error("Signup failed:", error);
    },
  });
};
