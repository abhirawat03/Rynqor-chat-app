import {
  Outlet,
  useMatch,
} from "react-router-dom";
import ChatsPage from "../pages/chat/ChatsPage.jsx";

const ChatLayout = () => {

  const isChatRoute =
    useMatch("/chat/:conversationId");

  return (
    <div
      className="
        flex
        flex-1
        min-h-0

        overflow-hidden

        bg-background

        transition-colors
        duration-300
      "
    >

      {/* SIDEBAR */}
      <aside
        className={`
          border-r
          border-border

          bg-surface

          transition-colors
          duration-300

          md:flex
          md:w-80
          lg:w-96
          md:flex-col

          ${
            isChatRoute
              ? "hidden md:flex"
              : `
                flex
                w-full

                md:w-80
                lg:w-96
              `
          }
        `}
      >

        <ChatsPage />

      </aside>

      {/* CHAT AREA */}
      <main
        className={`
          flex-1
          min-w-0
          min-h-0

          overflow-hidden

          bg-background

          transition-colors
          duration-300

          ${
            !isChatRoute
              ? "hidden md:flex"
              : "flex"
          }
        `}
      >

        <Outlet />

      </main>

    </div>
  );
};

export default ChatLayout;