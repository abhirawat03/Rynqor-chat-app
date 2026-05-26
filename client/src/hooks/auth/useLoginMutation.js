import {useMutation, useQueryClient} from "@tanstack/react-query";
import {login} from "../../services/authService.js";

export const useLoginMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            queryClient.setQueryData(["currentUser"], data);
            // queryClient.invalidateQueries({ queryKey:["currentUser"] });
        },
        onError: (error) => {
            console.error("Login failed:", error);
        },
    })
}