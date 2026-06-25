import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { ImSearch } from "react-icons/im";
import useSearchUsersQuery from "../../hooks/users/useSearchUsersQuery.js";
import { createGroupConversation } from "../../services/conversationService.js";
import { useSocket } from "../../services/socket/useSocket.js";
import { useCurrentUserQuery } from "../../hooks/auth/useCurrentUserQuery.js";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { getSocket } = useSocket();

  const { data: currentUser } = useCurrentUserQuery();
  const { data: searchResults = [], isLoading } = useSearchUsersQuery(userSearch.trim());

  const filteredSearchResults = searchResults.filter((u) => u._id !== currentUser?._id);

  if (!isOpen) return null;

  const handleToggleUser = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers((prev) => prev.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedUsers.length < 2) {
      toast.error("Please select at least 2 participants");
      return;
    }

    try {
      setIsSubmitting(true);
      const participantIds = selectedUsers.map((u) => u._id);
      const group = await createGroupConversation({
        name: groupName.trim(),
        participants: participantIds,
      });

      if (!group?._id) throw new Error("Invalid response from server");

      // Join room
      getSocket()?.emit("join_conversation", group._id);

      // Invalidate conversations list to show the new chat in the sidebar
      await queryClient.invalidateQueries(["conversations"]);

      toast.success("Group created successfully!");
      onClose();
      navigate(`/chat/${group._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create group");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div 
        className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Create Group Chat</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-hover text-muted hover:text-foreground transition-colors duration-200"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* GROUP NAME */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
              Group Name
            </label>
            <input
              type="text"
              placeholder="e.g., Design Team, Weekend Plans..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-2xl text-foreground text-sm placeholder-muted focus:outline-hidden focus:border-accent transition-colors duration-200"
              maxLength={40}
            />
          </div>

          {/* SELECTED USERS CHIPS */}
          {selectedUsers.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                Participants ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1 bg-surface-secondary border border-border border-dashed rounded-2xl">
                {selectedUsers.map((user) => (
                  <div 
                    key={user._id}
                    className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-sm text-foreground select-none"
                  >
                    {user.avatar?.url ? (
                      <img 
                        src={user.avatar.url} 
                        alt={user.fullName} 
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate max-w-20">{user.fullName}</span>
                    <button 
                      onClick={() => handleRemoveUser(user._id)}
                      className="p-0.5 rounded-full hover:bg-hover text-muted hover:text-foreground transition-colors duration-200"
                    >
                      <IoClose size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEARCH USERS */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
              Add Members
            </label>
            <div className="relative">
              <ImSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={14} />
              <input
                type="text"
                placeholder="Search by name or username..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-secondary border border-border rounded-2xl text-foreground text-sm placeholder-muted focus:outline-hidden focus:border-accent transition-colors duration-200"
              />
            </div>
          </div>

          {/* SEARCH RESULTS */}
          <div className="space-y-1">
            {userSearch.trim() && (
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredSearchResults.length > 0 ? (
                  filteredSearchResults.map((user) => {
                    const isSelected = selectedUsers.some((u) => u._id === user._id);
                    return (
                      <div 
                        key={user._id}
                        onClick={() => handleToggleUser(user)}
                        className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-colors duration-200 ${
                          isSelected ? "bg-hover border border-border" : "hover:bg-hover/50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                            {user.avatar?.url ? (
                              <img src={user.avatar.url} alt={user.fullName} className="w-full h-full object-cover" />
                            ) : (
                              user.fullName?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{user.fullName}</p>
                            <p className="text-xs text-muted truncate">@{user.username}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Handled by onClick of parent
                          className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30 cursor-pointer"
                        />
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-4 text-sm text-muted">No users found</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-surface-secondary">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-hover transition-colors duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-accent-foreground rounded-xl text-sm font-medium transition-colors duration-200 flex items-center gap-2"
            disabled={isSubmitting || !groupName.trim() || selectedUsers.length < 2}
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
            )}
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
