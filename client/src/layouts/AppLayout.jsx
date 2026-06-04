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
      className="flex h-screen overflow-hidden transition-colors duration-300 bg-background text-foreground"
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
        className="flex flex-col flex-1 overflow-hidden "
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
          className="flex-1 min-h-0 overflow-hidden "
        >

          <div
            className="flex flex-col h-full "
          >
            <Outlet />
          </div>

        </main>

      </div>

    </div>
  );
}

export default AppLayout;