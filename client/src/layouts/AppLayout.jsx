import React from "react";
import {
  Outlet,
  useMatch,
} from "react-router-dom";

import AppHeader from "../components/app/AppHeader.jsx";
import Navigation from "../components/navigation/Navigation.jsx";

function AppLayout() {

  const isChatRoute =
    useMatch("/chat/:conversationId");

  return (
    <div
      className="
        flex
        h-screen
        overflow-hidden

        bg-background
        text-foreground

        transition-colors
        duration-300
      "
    >

      {/* DESKTOP SIDEBAR */}
      <div
        className={`
          ${
            isChatRoute
              ? "hidden md:flex"
              : "flex"
          }
        `}
      >
        <Navigation />
      </div>

      {/* RIGHT SIDE */}
      <div
        className="
          flex
          flex-1
          flex-col
          overflow-hidden
        "
      >

        {/* HEADER */}
        <div
          className={`
            shrink-0

            ${
              isChatRoute
                ? "hidden md:block"
                : "block"
            }
          `}
        >
          <AppHeader />
        </div>

        {/* MAIN */}
        <main
          className="
            flex-1
            min-h-0
            overflow-hidden
          "
        >

          <div
            className="
              flex
              h-full
              flex-col
            "
          >
            <Outlet />
          </div>

        </main>

      </div>

    </div>
  );
}

export default AppLayout;