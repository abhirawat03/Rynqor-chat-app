import {useMutation, useQueryClient} from "@tanstack/react-query";
import {login} from "../../services/authService.js";
import toast from "react-hot-toast";

export const useLoginMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            queryClient.setQueryData(["currentUser"], data);
            // queryClient.invalidateQueries({ queryKey:["currentUser"] });
        },
        onError: (error) => {
            toast.error("Login failed");
            if (import.meta.env.MODE !== "production") console.error("Login failed:", error);
        },
    })
}