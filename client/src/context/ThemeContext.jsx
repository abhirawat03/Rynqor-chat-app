import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext =
  createContext();

export const ThemeProvider = ({
  children,
}) => {

  // GET INITIAL MODE
  const getInitialMode = () => {

    return (
      localStorage.getItem(
        "themeMode"
      ) || "system"
    );

  };

  const [themeMode, setThemeMode] =
    useState(getInitialMode);

  // APPLY THEME
useEffect(() => {

  const mediaQuery =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

  const applyTheme = () => {

    const isDark =
      themeMode === "dark" ||
      (
        themeMode === "system" &&
        mediaQuery.matches
      );

    document.documentElement.classList.toggle(
      "dark",
      isDark
    );

    document.documentElement.style.colorScheme =
      isDark
        ? "dark"
        : "light";

  };

  applyTheme();

  localStorage.setItem(
    "themeMode",
    themeMode
  );

  if (
    themeMode === "system"
  ) {

    mediaQuery.addEventListener(
      "change",
      applyTheme
    );

    return () => {

      mediaQuery.removeEventListener(
        "change",
        applyTheme
      );

    };

  }

}, [themeMode]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () =>
  useContext(ThemeContext);