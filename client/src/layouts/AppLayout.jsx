import React from "react";
import {
  Outlet,
  useMatch,
} from "react-router-dom";

import AppHeader from "../components/app/AppHeader.jsx";
import Navigation from "../components/navigation/Navigation.jsx";
import { useSocket } from "../services/socket/useSocket.js";
import { ErrorBoundary } from "../components/common/ErrorBoundary.jsx";

function AppLayout() {
  const isChatRoute =
    useMatch("/chat/:conversationId");
  const { isConnected } = useSocket();

  return (
    <div
      className="flex h-dvh overflow-hidden transition-colors duration-300 bg-background text-foreground"
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

        {/* CONNECTION BANNER */}
        {!isConnected && (
          <div className="bg-amber-500 text-white text-xs font-semibold py-2 px-4 text-center shrink-0 flex items-center justify-center gap-2 select-none border-b border-amber-600/30">
            <span className="animate-pulse">⏳</span>
            Connection lost. Trying to reconnect...
          </div>
        )}

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
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>

        </main>

      </div>

    </div>
  );
}

export default AppLayout;