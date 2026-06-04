import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ImSearch } from "react-icons/im";
import { IoClose } from "react-icons/io5";

import SearchCard from "../../components/search/SearchCard.jsx";

import useSearchUsersQuery from "../../hooks/users/useSearchUsersQuery.js";
import { createConversation } from "../../services/conversationService.js";

import { useSocket } from "../../services/socket/useSocket.js";
import useDebounce from "../../hooks/useDebounce.js";
import { useState } from "react";

const SearchPage = () => {

  const [search, setSearch] =
    useState("");
  const [ startingChatId, setStartingChatId] = useState(null);
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data: users=[], isLoading, isError } = useSearchUsersQuery(debouncedSearch);

  const navigate =
    useNavigate();

  const { getSocket } =
    useSocket();


  // START CHAT
  const startChat =
  async (userId) => {

    if (startingChatId)
      return;

    try {

      setStartingChatId(
        userId
      );

      const conversation =
        await createConversation(
          userId
        );

      if (
        !conversation?._id
      ) return;

      getSocket()?.emit(
        "join_conversation",
        conversation._id
      );

      navigate(
        `/chat/${conversation._id}`
      );

    } catch (err) {

      toast.error("Failed to start chat");
      if (import.meta.env.MODE !== "production") console.error(err);

    } finally {

      setStartingChatId(
        null
      );

    }

  };

  const showEmpty =
    !debouncedSearch.trim();

  const showNoResults =
  !isLoading &&
  debouncedSearch &&
  users.length === 0;

const showResults =
  users.length > 0;
  
    

  return (
    <div
      className="flex justify-center flex-1 px-4 py-4 pb-20 overflow-hidden bg-surface md:pb-4"
    >

      <div
        className="flex flex-col w-full h-full max-w-2xl "
      >

        {/* HEADER */}
        <div className="hidden mb-4 md:block">

          <h1
            className="text-3xl font-bold tracking-tight "
          >
            Search
          </h1>

          <p
            className="mt-1 text-sm text-muted"
          >
            Find users and start chatting
          </p>

        </div>

        {/* SEARCH CONTAINER */}
        <div
          className="flex flex-col flex-1 overflow-hidden border rounded-3xl border-border bg-background"
        >

          {/* SEARCH INPUT */}
          <div
            className="p-3 border-b shrink-0 border-border"
          >

            <div className="relative">

              <ImSearch
                size={16}
                className="absolute -translate-y-1/2 left-4 top-1/2 text-muted"
              />

              <input
                id="search"
                name="search"
                type="text"
                autoComplete="off"
                placeholder="Search users..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full py-3 text-sm transition-all outline-none rounded-2xl bg-surface pl-11 pr-11 text-foreground placeholder:text-muted ring-1 ring-border focus:ring-2 focus:ring-accent"
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute flex items-center justify-center transition-colors -translate-y-1/2 rounded-full right-3 top-1/2 h-7 w-7 text-muted hover:bg-hover hover:text-foreground"
                >

                  <IoClose size={18} />

                </button>
              )}

            </div>

          </div>

          {/* CONTENT */}
          <div
            className="flex-1 overflow-y-auto scrollbar-hide"
          >

            {/* EMPTY */}
            {showEmpty && (
              <div
                className="flex flex-col items-center justify-center h-full px-6 text-center "
              >

                <div
                  className="
                  rounded-full
                  bg-surface
                  mb-1.5
                "
                >

                  <ImSearch
                    size={32}
                    className="text-muted"
                  />

                </div>

                <h2
                  className="mb-2 text-lg font-semibold text-foreground"
                >
                  Search users
                </h2>

                <p
                  className="max-w-xs text-sm leading-relaxed text-muted"
                >
                  Search by username or full name to start a conversation.
                </p>

              </div>
            )}

            {/* LOADING */}
            {isLoading && (
              <div
                className="py-6 text-sm text-center text-muted"
              >
                Searching...
              </div>
            )}

            {isError && (
  <div
    className="py-6 text-sm text-center text-red-500 "
  >
    Failed to search users
  </div>
)}

            {/* NO RESULTS */}
            {showNoResults && (
              <div
                className="py-12 text-sm text-center text-muted"
              >
                No users found
              </div>
            )}

            {/* RESULTS */}
            {showResults && (
              <div className="space-y-2.5 p-3">

                {users.map((user) => (
                  <SearchCard
                    key={user._id}
                    username={user.username}
                    fullName={user.fullName}
                    avatar={user.avatar}
                    bio={user.bio}
                    isLoading={
                      startingChatId === user._id
                    }
                    onClick={() =>
                      startChat(user._id)
                    }
                  />
                ))}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default SearchPage;