// import {
//   Routes,
//   Route,
// } from "react-router-dom";

// import {
//   useEffect,
//   useState,
// } from "react";

// import AppLayout from "./layouts/AppLayout.jsx";

// import ChatLayout from "./layouts/ChatLayout.jsx";

// import Login from "./pages/auth/Login.jsx";

// import Signup from "./pages/auth/Signup.jsx";

// import SplashScreen from "./components/app/SplashScreen.jsx";

// import AuthLayout from "./layouts/AuthLayout.jsx";

// import ProfilePage from "./pages/profile/ProfilePage.jsx";

// import ConversationPage from "./pages/chat/ConversationPage.jsx";

// import SearchPage from "./pages/search/SearchPage.jsx";
// import PublicRoute from "./routes/PublicRoute.jsx";
// import ProtectedRoute from "./routes/ProtectedRoute.jsx";

// function App() {

//   const [showSplash, setShowSplash] =
//     useState(true);

//   useEffect(() => {

//     const timer =
//       setTimeout(() => {

//         setShowSplash(false);

//       }, 1200);

//     return () =>
//       clearTimeout(timer);

//   }, []);

//   return (

//     <>

//       {/* SPLASH SCREEN */}
//       <div
//         className={`
//           fixed
//           inset-0
//           z-[9999]

//           transition-opacity
//           duration-500

//           ${showSplash
//             ? "opacity-100"
//             : `
//                   pointer-events-none
//                   opacity-0
//                 `
//           }
//         `}
//       >

//         <SplashScreen />

//       </div>

//       {/* APP */}
//       <Routes>

//         {/* MAIN APP */}
//         <Route
//           element={<ProtectedRoute />}
//         >

//           <Route
//             path="/"
//             element={<AppLayout />}
//           >

//             {/* CHAT */}
//             <Route
//               element={<ChatLayout />}
//             >

//               <Route
//                 index
//                 element={
//                   <div
//                     className="
//                     hidden
//                     flex-1
//                     items-center
//                     justify-center

//                     text-zinc-500

//                     dark:text-zinc-400

//                     md:flex
//                   "
//                   >
//                     Select a chat
//                   </div>
//                 }
//               />

//               <Route
//                 path="/chat/:conversationId"
//                 element={
//                   <ConversationPage />
//                 }
//               />

//             </Route>

//             <Route
//               path="search"
//               element={<SearchPage />}
//             />

//             <Route
//               path="profile"
//               element={<ProfilePage />}
//             />

//           </Route>


//         </Route>
        
//         {/* PUBLIC */}
//         <Route
//           element={<PublicRoute />}
//         >

//           {/* AUTH */}
//           <Route
//             path="/auth"
//             element={<AuthLayout />}
//           >

//             <Route
//               index
//               element={<Login />}
//             />

//             <Route
//               path="signup"
//               element={<Signup />}
//             />

//           </Route>

//         </Route>


//       </Routes>

//     </>

//   );

// }

// export default App;

import {
  useEffect,
  useState,
} from "react";

import SplashScreen from "./components/app/SplashScreen.jsx";

function App({ children }) {

  const [showSplash, setShowSplash] =
    useState(true);

  useEffect(() => {

    const timer =
      setTimeout(() => {

        setShowSplash(false);

      }, 1200);

    return () =>
      clearTimeout(timer);

  }, []);

  return (

    <>

      {/* SPLASH SCREEN */}
      <div
        className={`
          fixed
          inset-0
          z-[9999]

          transition-opacity
          duration-500

          ${showSplash
            ? "opacity-100"
            : `
                pointer-events-none
                opacity-0
              `
          }
        `}
      >

        <SplashScreen />

      </div>

      {/* APP */}
      {children}

    </>

  );

}

export default App;