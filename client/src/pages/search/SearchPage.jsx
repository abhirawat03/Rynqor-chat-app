import { useNavigate } from "react-router-dom";
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

      console.error(err);

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
      className="
    flex
    flex-1
    justify-center
    overflow-hidden
    bg-surface
    px-4
    py-4
    pb-20

    md:pb-4
  "
    >

      <div
        className="
        flex
        h-full
        w-full
        max-w-2xl
        flex-col
      "
      >

        {/* HEADER */}
        <div className="hidden md:block mb-4">

          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
            "
          >
            Search
          </h1>

          <p
            className="
              mt-1

              text-sm

              text-muted
            "
          >
            Find users and start chatting
          </p>

        </div>

        {/* SEARCH CONTAINER */}
        <div
          className="
          flex
          flex-1
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-border
          bg-background
        "
        >

          {/* SEARCH INPUT */}
          <div
            className="
            shrink-0
            border-b
            border-border
            p-3
          "
          >

            <div className="relative">

              <ImSearch
                size={16}
                className="
      absolute
      left-4
      top-1/2
      -translate-y-1/2
      text-muted
    "
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
                className="
                  w-full
                  rounded-2xl
                  bg-surface
                  py-3
                  pl-11
                  pr-11
                  text-sm
                  text-foreground
                  placeholder:text-muted
                  outline-none
                  ring-1
                  ring-border
                  transition-all
                  focus:ring-2
                  focus:ring-accent
                "
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    flex
                    h-7
                    w-7
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    text-muted
                    transition-colors
                    hover:bg-hover
                    hover:text-foreground
                  "
                >

                  <IoClose size={18} />

                </button>
              )}

            </div>

          </div>

          {/* CONTENT */}
          <div
            className="
            flex-1
            overflow-y-auto
            scrollbar-hide
          "
          >

            {/* EMPTY */}
            {showEmpty && (
              <div
                className="
                flex
                h-full
                flex-col
                items-center
                justify-center
                px-6
                text-center
              "
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
                  className="
                  mb-2
                  text-lg
                  font-semibold
                  text-foreground
                "
                >
                  Search users
                </h2>

                <p
                  className="
                  max-w-xs
                  text-sm
                  leading-relaxed
                  text-muted
                "
                >
                  Search by username or full name to start a conversation.
                </p>

              </div>
            )}

            {/* LOADING */}
            {isLoading && (
              <div
                className="
                py-6
                text-center
                text-sm
                text-muted
              "
              >
                Searching...
              </div>
            )}

            {isError && (
  <div
    className="
      py-6
      text-center
      text-sm
      text-red-500
    "
  >
    Failed to search users
  </div>
)}

            {/* NO RESULTS */}
            {showNoResults && (
              <div
                className="
                py-12
                text-center
                text-sm
                text-muted
              "
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