import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    promoteToAdmin,
    demoteAdmin,
    removeParticipant,
    updateGroupAvatar,
    deleteGroupAvatar,
    updateGroupName,
    addParticipants,
    leaveGroup,
    deleteGroup
} from "../../services/conversationService";

export const usePromoteToAdminMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: promoteToAdmin,
        onSuccess: (data, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });
};

export const useDemoteAdminMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: demoteAdmin,
        onSuccess: (data, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });
};

export const useRemoveParticipantMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeParticipant,
        onSuccess: (data, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });
};

export const useUpdateGroupAvatarMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateGroupAvatar,
        onSuccess: (data, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });
};

export const useDeleteGroupAvatarMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteGroupAvatar,
        onSuccess: (data, conversationId) => {
            queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });
};

export const useUpdateGroupNameMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateGroupName,
        onSuccess: (data, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });
};

export const useAddParticipantsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addParticipants,
        onSuccess: (data, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });
};

export const useLeaveGroupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: leaveGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });
};

export const useDeleteGroupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });
};
