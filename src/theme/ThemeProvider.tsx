import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

import { useApp } from "../providers/AppProvider";
import { Theme, darkTheme, lightTheme } from "./palette";

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const { state } = useApp();

  const theme = useMemo(() => {
    const preference = state.settings.theme;
    const resolved =
      preference === "system" ? (systemScheme ?? "light") : preference;
    return resolved === "dark" ? darkTheme : lightTheme;
  }, [state.settings.theme, systemScheme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
