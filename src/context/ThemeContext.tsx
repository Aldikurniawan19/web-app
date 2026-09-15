"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isMounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "apphub-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [isMounted, setIsMounted] = useState(false);

  // Terapkan class .dark dan colorScheme ke elemen <html>
  const applyTheme = useCallback((targetTheme: ThemeMode) => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    if (targetTheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);

    // Default tema web adalah "light" (tidak mengikuti tema OS/device)
    let activeTheme: ThemeMode = "light";
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored === "dark") {
        activeTheme = "dark";
      } else if (stored === "light") {
        activeTheme = "light";
      } else {
        // Jika belum ada preferensi, default selalu "light"
        activeTheme = "light";
      }
    } catch {
      activeTheme = "light";
    }

    setThemeState(activeTheme);
    applyTheme(activeTheme);

    // Sinkronisasi preferensi manual antar-tab browser
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const newTheme = e.newValue === "dark" ? "dark" : "light";
        setThemeState(newTheme);
        applyTheme(newTheme);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [applyTheme]);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch {}
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isMounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme harus digunakan di dalam ThemeProvider");
  }
  return context;
}
