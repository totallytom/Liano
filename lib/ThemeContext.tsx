import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { loadActiveTheme } from './storage';
import { DEFAULT_THEME, ThemePreset } from './types';

interface ThemeContextValue {
  theme: ThemePreset;
  refreshTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  refreshTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemePreset>(DEFAULT_THEME);

  const refreshTheme = useCallback(() => {
    loadActiveTheme().then(setTheme);
  }, []);

  useEffect(() => {
    refreshTheme();
  }, [refreshTheme]);

  return <ThemeContext.Provider value={{ theme, refreshTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
