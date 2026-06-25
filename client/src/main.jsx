/* eslint-disable react-refresh/only-export-components */
import {
  StrictMode,
  lazy,
} from "react";

import { createRoot } from "react-dom/client";

import "./index.css";

import {
  createBrowserRouter,
  RouterProvider,
  NavLink,
} from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "react-hot-toast";

import App from "./App.jsx";

import SocketProvider from "./services/socket/SocketProvider.jsx";

import { ThemeProvider } from "./context/ThemeContext.jsx";

/* LAYOUTS */
import AppLayout from "./layouts/AppLayout.jsx";

import ChatLayout from "./layouts/ChatLayout.jsx";

import AuthLayout from "./layouts/AuthLayout.jsx";

/* PAGES */
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";

const ProfilePage = lazy(
  () => import("./pages/profile/ProfilePage.jsx")
);

const ConversationPage = lazy(
  () => import("./pages/chat/ConversationPage.jsx")
);

const SearchPage = lazy(
  () => import("./pages/search/SearchPage.jsx")
);

/* ROUTES */
import PublicRoute from "./routes/PublicRoute.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import GlobalErrorBoundary from "./components/app/GlobalErrorBoundary.jsx";
import { LazyPage } from "./components/common/LazyPage.jsx";
import { ConversationSkeleton, SearchSkeleton, SettingsSkeleton } from "./components/common/Skeleton.jsx";
import { ErrorBoundary } from "./components/common/ErrorBoundary.jsx";
import { BsFillChatLeftFill } from "react-icons/bs";



// APPLY THEME BEFORE REACT LOADS
(() => {

  const savedTheme =
    localStorage.getItem(
      "themeMode"
    ) || "system";

  const systemDark =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

  const isDark =
    savedTheme === "dark" ||
    (
      savedTheme === "system" &&
      systemDark
    );

  document.documentElement.classList.toggle(
    "dark",
    isDark
  );

  document.documentElement.style.colorScheme =
    isDark
      ? "dark"
      : "light";

})();

const queryClient =
  new QueryClient();



const router =
  createBrowserRouter([
    {
      path: "/",
      element: (
        <App>
          <ProtectedRoute />
        </App>
      ),
      errorElement: <GlobalErrorBoundary />,

      children: [
        {
          element: <AppLayout />,

          children: [

            {
              element: <ChatLayout />,

              children: [

                {
                  index: true,

                  element: (
                    <div className="hidden flex-1 flex-col items-center justify-center bg-background md:flex select-none">
                      <div className="flex flex-col items-center max-w-sm p-6 text-center">
                        {/* Solid modern chat icon */}
                        <BsFillChatLeftFill size={56} className="text-foreground/95 dark:text-foreground/90 mb-5" />
                        
                        <h2 className="text-xl font-normal text-foreground mb-1">
                          Your messages
                        </h2>
                        
                        <p className="text-sm text-muted mb-6 max-w-70 leading-relaxed">
                          Send photos and messages to a friend or group.
                        </p>
                        
                        {/* Instagram-style filled button */}
                        <NavLink
                          to="/search"
                          className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover transition-colors"
                        >
                          Send message
                        </NavLink>
                      </div>
                    </div>
                  ),
                },

                {
                  path: "chat/:conversationId",

                  element: (
                    <LazyPage fallback={<ConversationSkeleton />}>
                      <ConversationPage />
                    </LazyPage>
                  ),
                },

              ],
            },

            {
              path: "search",

              element: (
                <LazyPage fallback={<SearchSkeleton />}>
                  <SearchPage />
                </LazyPage>
              ),
            },

            {
              path: "profile",

              element: (
                <LazyPage fallback={<SettingsSkeleton />}>
                  <ProfilePage />
                </LazyPage>
              ),
            },

          ],
        },
      ],
    },

    /* PUBLIC */
    {
      path: "/auth",

      element: (
        <App>
          <PublicRoute />
        </App>
      ),
      errorElement: <GlobalErrorBoundary />,

      children: [
        {
          element: <AuthLayout />,

          children: [

            {
              index: true,

              element: <Login />,
            },

            {
              path: "signup",

              element: <Signup />,
            },

            {
              path: "forgot-password",

              element: <ForgotPassword />,
            },

          ],
        },
      ],
    },
  ]);

createRoot(
  document.getElementById("root")
).render(

  <StrictMode>

    <QueryClientProvider
      client={queryClient}
    >

      <SocketProvider>

        <ThemeProvider>

          <ErrorBoundary>
            <RouterProvider
              router={router}
            />
          </ErrorBoundary>

          <Toaster />

        </ThemeProvider>

      </SocketProvider>

    </QueryClientProvider>

  </StrictMode>
);