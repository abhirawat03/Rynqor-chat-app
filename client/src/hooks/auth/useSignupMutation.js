import { useMutation, useQueryClient } from "@tanstack/react-query"
import { signup } from "../../services/authService";
import toast from "react-hot-toast";

export const useSignupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: signup,
        onSuccess: (data) => {
            queryClient.setQueryData(["currentUser"], data);
        },
        onError: (error) => {
            toast.error("Signup failed");
            if (import.meta.env.MODE !== "production") console.error("Signup failed:", error);
        },
    })
}