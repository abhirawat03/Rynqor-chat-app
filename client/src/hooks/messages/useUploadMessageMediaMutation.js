import { useMutation } from "@tanstack/react-query";
import { uploadMessageMedia } from "../../services/messageService";

export const useUploadMessageMediaMutation = () => {
    return useMutation({
        mutationFn: uploadMessageMedia,
    })
}