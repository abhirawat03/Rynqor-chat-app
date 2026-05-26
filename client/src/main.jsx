// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import { BrowserRouter, createBrowserRouter } from "react-router-dom";
// import ChatLayout from './layouts/AppLayout.jsx';
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import SocketProvider from './services/socket/SocketProvider.jsx';
// import { ThemeProvider } from './context/ThemeContext.jsx';
// import { Toaster } from "react-hot-toast";

// // APPLY THEME BEFORE REACT LOADS
// (() => {

//   const savedTheme =
//     localStorage.getItem(
//       "themeMode"
//     ) || "system";

//   const systemDark =
//     window.matchMedia(
//       "(prefers-color-scheme: dark)"
//     ).matches;

//   const isDark =
//     savedTheme === "dark" ||
//     (
//       savedTheme === "system" &&
//       systemDark
//     );

//   document.documentElement.classList.toggle(
//     "dark",
//     isDark
//   );

//   document.documentElement.style.colorScheme =
//     isDark
//       ? "dark"
//       : "light";

// })();

// const queryClient = new QueryClient();

// const router = createBrowserRouter([
//   {
//     path: '/',
//     element:<App/>,
//     children:[
//       {
//         path:"",
//         element:<ChatLayout/>
//       }
//     ]
//   }
// ])

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//   <QueryClientProvider client={queryClient}>
//     <BrowserRouter>
//       <SocketProvider>   {/* 👈 wrap here */}
//         <ThemeProvider>
//           <App />
//           <Toaster/>
//         </ThemeProvider>
//       </SocketProvider>
//     </BrowserRouter>
//   </QueryClientProvider>
//   </StrictMode>
// )
import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import "./index.css";

import {
  createBrowserRouter,
  RouterProvider,
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

import ProfilePage from "./pages/profile/ProfilePage.jsx";

import ConversationPage from "./pages/chat/ConversationPage.jsx";

import SearchPage from "./pages/search/SearchPage.jsx";

/* ROUTES */
import PublicRoute from "./routes/PublicRoute.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";


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
                    <div
                      className="
                        hidden
                        flex-1
                        items-center
                        justify-center

                        text-zinc-500

                        dark:text-zinc-400

                        md:flex
                      "
                    >
                      Select a chat
                    </div>
                  ),
                },

                {
                  path: "chat/:conversationId",

                  element:
                    <ConversationPage />,
                },

              ],
            },

            {
              path: "search",

              element:
                <SearchPage />,
            },

            {
              path: "profile",

              element:
                <ProfilePage />,
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

          <RouterProvider
            router={router}
          />

          <Toaster />

        </ThemeProvider>

      </SocketProvider>

    </QueryClientProvider>

  </StrictMode>
);