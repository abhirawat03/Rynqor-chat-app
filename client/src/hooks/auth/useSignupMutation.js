import { useMutation, useQueryClient } from "@tanstack/react-query"
import { signup } from "../../services/authService";

export const useSignupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: signup,
        onSuccess: (data) => {
            queryClient.setQueryData(["currentUser"], data.user);
        },
        onError: (error) => {
            console.error("Signup failed:", error);
        },
    })
}