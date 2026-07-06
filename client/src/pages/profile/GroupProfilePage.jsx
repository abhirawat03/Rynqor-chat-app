import { BsPeopleFill } from "react-icons/bs";

import { IoClose, IoCamera } from "react-icons/io5";
import { useDisclosure } from "../../hooks/useDisclosure.js";
import Modal from "../../components/common/Modal.jsx";

import {
  Pencil,
  UserMinus,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useConversationByIdQuery } from "../../hooks/conversations/useConversationByIdQuery.js";

import useConversationMedia from "../../hooks/conversations/useConversationMediaQuery.js";

import { useSocket } from "../../services/socket/useSocket.js";

import { useCurrentUserQuery } from "../../hooks/auth/useCurrentUserQuery.js";

import useSearchUsersQuery from "../../hooks/users/useSearchUsersQuery.js";

import {
  usePromoteToAdminMutation,
  useDemoteAdminMutation,
  useRemoveParticipantMutation,
  useUpdateGroupAvatarMutation,
  useDeleteGroupAvatarMutation,
  useUpdateGroupNameMutation,
  useAddParticipantsMutation,
  useLeaveGroupMutation,
  useDeleteGroupMutation,
} from "../../hooks/conversations/useGroupMutationHooks.js";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";

const GroupProfilePage = ({ conversationId, onClose, onMemberClick }) => {
  const {
    data: group,
    isLoading,
    isError,
  } = useConversationByIdQuery(conversationId);

  const { data: media = [], isLoading: mediaLoading } =
    useConversationMedia(conversationId);

  const { presence } = useSocket();

  const { data: currentUser } = useCurrentUserQuery();

  const currentUserId = currentUser?._id;

  const isCurrentUserAdmin = group?.admins?.some(
    (adminId) => String(adminId) === String(currentUserId),
  );

  const isCurrentUserCreator =
    group?.admins &&
    group.admins.length > 0 &&
    String(currentUserId) === String(group.admins[0]);

  const creator = group?.participants?.find(
    (p) => String(p._id) === String(group?.admins?.[0]),
  );
  const creatorName = creator
    ? String(creator._id) === String(currentUserId)
      ? "You"
      : creator.fullName
    : "Unknown";

  const [isEditingName, setIsEditingName] = useState(false);

  const [nameInput, setNameInput] = useState("");

  const [showAddMember, setShowAddMember] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  const [confirmConfig, setConfirmConfig] = useState(null);

  const { data: searchResults = [], isLoading: searchLoading } =
    useSearchUsersQuery(searchQuery);

  const navigate = useNavigate();

  const { mutate: promoteToAdminMutate } = usePromoteToAdminMutation();
  const { mutate: demoteAdminMutate, isPending: isDemoting } =
    useDemoteAdminMutation();
  const { mutate: removeParticipantMutate, isPending: isRemoving } =
    useRemoveParticipantMutation();
  const { mutate: updateGroupAvatarMutate, isPending: isUpdatingAvatar } =
    useUpdateGroupAvatarMutation();
  const { mutate: deleteGroupAvatarMutate, isPending: isDeletingAvatar } =
    useDeleteGroupAvatarMutation();
  const { mutate: updateGroupNameMutate, isPending: isUpdatingName } =
    useUpdateGroupNameMutation();
  const { mutate: addParticipantsMutate } = useAddParticipantsMutation();
  const { mutate: leaveGroupMutate, isPending: isLeaving } =
    useLeaveGroupMutation();
  const { mutate: deleteGroupMutate, isPending: isDeletingGroup } =
    useDeleteGroupMutation();

  const handleLeaveGroup = () => {
    setConfirmConfig({
      title: "Leave Group",
      message: "Are you sure you want to leave this group?",
      confirmText: "Leave",
      type: "danger",
      onConfirm: () => {
        leaveGroupMutate(conversationId, {
          onSuccess: () => {
            setConfirmConfig(null);
            navigate("/");
          },
          onError: () => {
            setConfirmConfig(null);
          },
        });
      },
    });
  };

  const handleDeleteGroup = () => {
    setConfirmConfig({
      title: "Delete Group",
      message:
        "Are you sure you want to delete this group? This will permanently delete all messages and media for everyone.",
      confirmText: "Delete",
      type: "danger",
      onConfirm: () => {
        deleteGroupMutate(conversationId, {
          onSuccess: () => {
            setConfirmConfig(null);
            navigate("/");
          },
          onError: () => {
            setConfirmConfig(null);
          },
        });
      },
    });
  };

  const handleRemoveParticipant = (member) => {
    setConfirmConfig({
      title: "Remove Member",
      message: `Are you sure you want to remove ${member.fullName} from this group?`,
      confirmText: "Remove",
      type: "danger",
      onConfirm: () => {
        removeParticipantMutate(
          { conversationId, participantId: member._id },
          {
            onSuccess: () => {
              setConfirmConfig(null);
            },
            onError: () => {
              setConfirmConfig(null);
            },
          },
        );
      },
    });
  };

  const handleDemoteAdmin = (member) => {
    setConfirmConfig({
      title: "Dismiss Admin",
      message: `Are you sure you want to dismiss ${member.fullName} as Admin?`,
      confirmText: "Dismiss",
      type: "danger",
      onConfirm: () => {
        demoteAdminMutate(
          { conversationId, adminId: member._id },
          {
            onSuccess: () => {
              setConfirmConfig(null);
            },
            onError: () => {
              setConfirmConfig(null);
            },
          },
        );
      },
    });
  };

  const avatarModal = useDisclosure();

  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    if (group) {
      setNameInput(group.name);
    }
  }, [group]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    updateGroupAvatarMutate({ conversationId, file });
  };

  // LOADING
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-surface text-muted">
        Loading profile...
      </div>
    );
  }

  // ERROR
  if (isError || !group || group.type !== "group") {
    return (
      <div className="flex items-center justify-center w-full h-full text-red-500 bg-surface">
        Group not found
      </div>
    );
  }

  return (
    <>
      <div
        className="
          scrollbar-hide

          h-full
          w-full

          overflow-y-auto

          border-l
          border-border

          bg-surface

          transition-transform
          duration-300

          xl:w-105
          max-w-full
        "
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 border-b border-border bg-surface/90 backdrop-blur-xl">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Group Info
            </h1>

            <p
              className="
                mt-0.5

                text-xs

                text-muted
              "
            >
              Group profile
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              cursor-pointer

              rounded-xl

              text-lg

              text-muted

              transition-all
              duration-200

              hover:bg-hover
              hover:text-foreground

              active:scale-[0.96]
            "
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 px-4 py-5 overflow-y-auto scrollbar-hide">
          {/* PROFILE HERO */}
          <div className="flex flex-col items-center pb-6 border-b border-border">
            {/* AVATAR */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (group?.avatar?.url) {
                    avatarModal.onOpen();
                  }
                }}
                className="
                  transition-transform
                  duration-200
                  cursor-pointer
                  outline-none
                  focus:outline-none

                  hover:scale-[1.02]
                  active:scale-[0.98]
                "
              >
                {group.avatar?.url ? (
                  <img
                    src={group.avatar.url}
                    alt={group.name}
                    className="object-cover rounded-full h-28 w-28 ring-4 ring-surface-secondary"
                  />
                ) : (
                  <div className="flex items-center justify-center rounded-full h-28 w-28 bg-surface-secondary">
                    <BsPeopleFill size={60} className=" text-muted" />
                  </div>
                )}
              </button>

              {/* CAMERA OVERLAY FOR ADMINS */}
              {isCurrentUserAdmin && (
                <label
                  onClick={(e) => e.stopPropagation()}
                  className={`
                    absolute
                    bottom-0
                    right-0

                    flex
                    h-9
                    w-9
                    items-center
                    justify-center

                    rounded-full
                    bg-accent
                    text-white
                    shadow-lg
                    transition-all
                    duration-200

                    ${
                      isUpdatingAvatar || isDeletingAvatar
                        ? "cursor-not-allowed opacity-70"
                        : "cursor-pointer hover:scale-105 active:scale-95"
                    }
                  `}
                >
                  <IoCamera size={16} />
                  <input
                    id="group-avatar-file"
                    type="file"
                    accept="image/*"
                    disabled={isUpdatingAvatar || isDeletingAvatar}
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* EDITABLE NAME / DISPLAY NAME */}
            {isEditingName ? (
              <div className="flex items-center gap-2 mt-4 w-full px-4">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  disabled={isUpdatingName}
                  className="flex-1 px-3 py-1.5 text-sm font-semibold border rounded-xl bg-background text-foreground border-border outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                />
                <button
                  type="button"
                  disabled={isUpdatingName || !nameInput.trim()}
                  onClick={() => {
                    updateGroupNameMutate(
                      { conversationId, name: nameInput },
                      {
                        onSuccess: () => setIsEditingName(false),
                      },
                    );
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-accent text-white hover:opacity-90 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(group.name);
                    setIsEditingName(false);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-hover text-muted hover:text-foreground active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 mt-4 w-full px-4">
                <h2 className="text-2xl font-bold text-foreground text-center truncate max-w-[80%]">
                  {group.name}
                </h2>
                {isCurrentUserAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(group.name);
                      setIsEditingName(true);
                    }}
                    className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-hover transition-colors cursor-pointer"
                    title="Change Group Name"
                  >
                    <Pencil size={15} />
                  </button>
                )}
              </div>
            )}

            {/* DELETE AVATAR OPTION FOR ADMINS */}
            {isCurrentUserAdmin && group.avatar?.url && (
              <button
                type="button"
                onClick={() => deleteGroupAvatarMutate(conversationId)}
                disabled={isDeletingAvatar || isUpdatingAvatar}
                className="mt-2 text-xs font-medium transition-all duration-200 cursor-pointer text-accent hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeletingAvatar ? "Removing photo..." : "Remove group photo"}
              </button>
            )}

            {/* SUBTITLE */}
            <p className="mt-1 text-sm text-muted">
              Group &bull; {group.participants?.length || 0} members
            </p>
            {creator && (
              <p className="mt-1 text-xs text-muted-foreground/75 select-none">
                Created by{" "}
                <span className="font-semibold text-foreground/80">
                  {creatorName}
                </span>
              </p>
            )}
          </div>

          {/* MEMBERS LIST */}
          <div className="mt-6 p-5 rounded-2xl bg-background border border-border/40">
            {/* MEMBERS HEADER WITH ADD BUTTON */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-muted">
                Members
              </h3>
              {isCurrentUserAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMember(!showAddMember);
                    setSearchQuery("");
                  }}
                  className="text-xs font-bold text-accent hover:opacity-80 flex items-center gap-1 cursor-pointer"
                >
                  {showAddMember ? "Cancel" : "+ Add Member"}
                </button>
              )}
            </div>

            {/* ADD MEMBER SEARCH BOX */}
            {showAddMember && (
              <div className="mb-4 pr-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users to add..."
                  className="w-full px-3 py-2 text-xs border rounded-xl bg-surface text-foreground border-border outline-none focus:border-accent"
                />

                {searchQuery.trim() && (
                  <div className="mt-2 max-h-45 overflow-y-auto border border-border/40 rounded-xl bg-surface-secondary/40 p-2 divide-y divide-border/20 scrollbar-hide">
                    {searchLoading ? (
                      <p className="text-xs text-muted text-center p-2 animate-pulse">
                        Searching...
                      </p>
                    ) : searchResults.length === 0 ? (
                      <p className="text-xs text-muted text-center p-2">
                        No users found
                      </p>
                    ) : (
                      searchResults.map((user) => {
                        const isAlreadyMember = group.participants?.some(
                          (p) => String(p._id) === String(user._id),
                        );
                        if (isAlreadyMember) return null;

                        return (
                          <div
                            key={user._id}
                            className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {user.avatar?.url ? (
                                <img
                                  src={user.avatar.url}
                                  alt={user.fullName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface text-xs font-semibold">
                                  {user.fullName?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate">
                                  {user.fullName}
                                </p>
                                <p className="text-[10px] text-muted truncate">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                addParticipantsMutate(
                                  {
                                    conversationId,
                                    participantIds: [user._id],
                                  },
                                  {
                                    onSuccess: () => {
                                      setSearchQuery("");
                                      setShowAddMember(false);
                                    },
                                  },
                                );
                              }}
                              className="text-xs font-semibold text-accent hover:opacity-85 px-2.5 py-1 bg-accent/10 rounded-lg cursor-pointer"
                            >
                              + Add
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* MEMBER SEARCH FILTER */}
            {!showAddMember && (
              <div className="mb-3 pr-1">
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  placeholder="Filter members..."
                  className="w-full px-3 py-1.5 text-xs border rounded-xl bg-surface text-foreground border-border outline-none focus:border-accent"
                />
              </div>
            )}

            <div className="grid gap-4 max-h-80 overflow-y-auto scrollbar-hide pr-1">
              {group.participants
                ?.filter((member) => {
                  if (!memberSearchQuery.trim()) return true;
                  const query = memberSearchQuery.toLowerCase();
                  return (
                    member.fullName?.toLowerCase().includes(query) ||
                    member.username?.toLowerCase().includes(query)
                  );
                })
                .map((member) => {
                  const isAdmin = group.admins?.some(
                    (adminId) => String(adminId) === String(member._id),
                  );

                  const isCreator =
                    group.admins &&
                    group.admins.length > 0 &&
                    String(member._id) === String(group.admins[0]);

                  const isMemberOnline =
                    String(member._id) !== String(currentUserId) &&
                    (presence?.[member._id]?.online || false);

                  return (
                    <div
                      key={member._id}
                      className="flex items-center justify-between gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => onMemberClick?.(member._id)}
                        className="flex items-center gap-3 min-w-0 text-left cursor-pointer hover:opacity-80 transition-opacity flex-1"
                      >
                        {/* MEMBER AVATAR */}
                        <div className="relative shrink-0">
                          {member.avatar?.url ? (
                            <img
                              src={member.avatar.url}
                              alt={member.fullName}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-surface-secondary"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-secondary text-foreground text-sm font-semibold">
                              {member.fullName?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}

                          {isMemberOnline && (
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                          )}
                        </div>

                        {/* MEMBER INFO */}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {member.fullName}
                          </p>

                          <p className="text-xs text-muted truncate">
                            @{member.username}
                          </p>
                        </div>
                      </button>

                      {/* ACTION BADGES / BUTTONS */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isAdmin && (
                          <span className="px-2 py-0.5 text-[9px] font-bold text-accent bg-accent/10 border border-accent/20 rounded-full uppercase tracking-wider">
                            Admin
                          </span>
                        )}

                        {isCurrentUserAdmin && (
                          <div className="flex items-center gap-0.5">
                            {/* MAKE ADMIN BUTTON */}
                            {!isAdmin && (
                              <button
                                type="button"
                                title="Make Admin"
                                onClick={() =>
                                  promoteToAdminMutate({
                                    conversationId,
                                    targetUserId: member._id,
                                  })
                                }
                                className="p-1.5 rounded-lg text-muted hover:text-green-500 hover:bg-green-500/10 transition-colors cursor-pointer"
                              >
                                <ShieldCheck size={14} />
                              </button>
                            )}

                            {/* DISMISS AS ADMIN BUTTON */}
                            {isAdmin &&
                              !isCreator &&
                              String(member._id) !== String(currentUserId) && (
                                <button
                                  type="button"
                                  title="Dismiss as Admin"
                                  onClick={() => handleDemoteAdmin(member)}
                                  className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                >
                                  <ShieldOff size={14} />
                                </button>
                              )}

                            {/* REMOVE PARTICIPANT BUTTON */}
                            {String(member._id) !== String(currentUserId) &&
                              !isCreator && (
                                <button
                                  type="button"
                                  title="Remove Member"
                                  onClick={() =>
                                    handleRemoveParticipant(member)
                                  }
                                  className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                >
                                  <UserMinus size={14} />
                                </button>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* GROUP ACTIONS */}
          <div className="mt-6 flex flex-col gap-2 p-5 rounded-2xl bg-background border border-border/40">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-muted mb-2">
              Group Actions
            </h3>
            <button
              type="button"
              disabled={isLeaving || isDeletingGroup}
              onClick={handleLeaveGroup}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold border border-red-500/20 text-red-500 hover:bg-red-500/10 active:scale-[0.98] transition-all cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:outline-none"
            >
              {isLeaving ? "Leaving..." : "Leave Group"}
            </button>
            {isCurrentUserCreator && (
              <button
                type="button"
                disabled={isLeaving || isDeletingGroup}
                onClick={handleDeleteGroup}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] transition-all cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:outline-none"
              >
                {isDeletingGroup ? "Deleting..." : "Delete Group"}
              </button>
            )}
          </div>

          {/* SHARED MEDIA */}
          <div className="mt-8 ">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Shared Media
            </h3>

            {mediaLoading ? (
              <div className="p-6 text-sm text-center border rounded-2xl border-border bg-background text-muted">
                Loading media...
              </div>
            ) : media.length === 0 ? (
              <div className="p-10 text-sm text-center border rounded-2xl border-border bg-background text-muted">
                No shared media yet
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 ">
                {media.map((message) =>
                  message.media?.map((item) => (
                    <div
                      key={item.publicId}
                      className="overflow-hidden border rounded-xl border-border bg-background"
                    >
                      {/* IMAGE */}
                      {item.type === "image" && (
                        <button
                          type="button"
                          onClick={() => setSelectedMedia(item)}
                          className="block w-full h-full "
                        >
                          <img
                            src={item.url}
                            alt={item.name || "media"}
                            loading="lazy"
                            decoding="async"
                            className="object-cover w-full h-full transition-transform duration-300 cursor-pointer aspect-square hover:scale-105"
                          />
                        </button>
                      )}

                      {/* VIDEO */}
                      {item.type === "video" && (
                        <button
                          type="button"
                          onClick={() => setSelectedMedia(item)}
                          className="relative block w-full h-full overflow-hidden cursor-pointer group"
                        >
                          <video
                            src={item.url}
                            preload="metadata"
                            className="object-cover w-full h-full aspect-square"
                          />

                          {/* OVERLAY */}
                          <div className="absolute inset-0 flex items-center justify-center transition-colors duration-200 bg-black/30 group-hover:bg-black/40">
                            <div className="flex items-center justify-center w-12 h-12 text-xl rounded-full bg-white/90">
                              ▶
                            </div>
                          </div>
                        </button>
                      )}

                      {/* AUDIO */}
                      {item.type === "audio" && (
                        <button
                          type="button"
                          onClick={() => setSelectedMedia(item)}
                          className="relative flex flex-col items-center justify-center w-full gap-3 p-4 overflow-hidden cursor-pointer group aspect-square bg-linear-to-br from-zinc-800 to-zinc-900"
                        >
                          {/* ICON */}
                          <div className="flex items-center justify-center text-2xl text-white transition-transform duration-200 rounded-full h-14 w-14 bg-white/10 group-hover:scale-110">
                            🎵
                          </div>

                          {/* NAME */}
                          <p className="max-w-full text-xs text-center line-clamp-2 text-white/90">
                            {item.name || "Audio"}
                          </p>
                        </button>
                      )}

                      {/* FILE */}
                      {item.type === "file" && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          title={item.name}
                          className="flex flex-col items-center justify-center gap-2 p-3 text-center transition-colors duration-200 hover:bg-hover min-h-24 h-full w-full"
                        >
                          <div className="text-4xl ">📄</div>

                          <p className="text-xs text-foreground break-all">
                            {item.name || "File"}
                          </p>
                        </a>
                      )}
                    </div>
                  )),
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AVATAR MODAL */}
      <Modal isOpen={avatarModal.isOpen} onClose={avatarModal.onClose} raw>
        <img
          src={group?.avatar?.url}
          alt={group?.name}
          className="max-h-[90vh] max-w-[90vw] object-contain"
        />
      </Modal>

      {/* MEDIA MODAL */}
      <Modal isOpen={!!selectedMedia} onClose={() => setSelectedMedia(null)} raw>
        {selectedMedia && (
          <>
            {/* IMAGE */}
            {selectedMedia.type === "image" && (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.name}
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
            )}

            {/* VIDEO */}
            {selectedMedia.type === "video" && (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="max-h-[90vh] max-w-[90vw]"
              />
            )}

            {/* AUDIO */}
            {selectedMedia.type === "audio" && (
              <div className="flex min-w-[320px] flex-col gap-4 p-6 bg-background">
                <p className="text-sm font-medium text-foreground">
                  {selectedMedia.name}
                </p>
                <audio controls autoPlay src={selectedMedia.url} className="w-full" />
              </div>
            )}
          </>
        )}
      </Modal>

      {/* CONFIRMATION DIALOG MODAL */}
      <ConfirmModal
        isOpen={!!confirmConfig}
        onClose={() => setConfirmConfig(null)}
        isLoading={isLeaving || isDeletingGroup || isRemoving || isDemoting}
        title={confirmConfig?.title}
        message={confirmConfig?.message}
        confirmText={confirmConfig?.confirmText}
        type={confirmConfig?.type}
        onConfirm={confirmConfig?.onConfirm}
      />
    </>
  );
};

export default GroupProfilePage;
