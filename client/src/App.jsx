import { useEffect, useState } from "react";

import SplashScreen from "./components/app/SplashScreen.jsx";

function App({ children }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1200);

    return () => clearTimeout(timer);
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

          ${
            showSplash
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
