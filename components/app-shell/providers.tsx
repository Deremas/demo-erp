"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { alpha, createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { Toaster } from "sonner";

import { applyAppTheme, resolveAppTheme, THEME_STORAGE_KEY, type AppTheme } from "@/lib/theme";

type AppThemeContextValue = {
  resolvedTheme: AppTheme;
  setTheme: (theme: AppTheme) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function useAppTheme() {
  const value = useContext(AppThemeContext);

  if (!value) {
    return {
      resolvedTheme: "light" as const,
      setTheme: () => undefined,
    };
  }

  return value;
}

function MuiThemeBridge({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useAppTheme();
  const [mounted, setMounted] = useState(false);
  const effectiveTheme = mounted ? resolvedTheme : "light";
  const isDark = effectiveTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = useMemo(() => {
    const backgroundDefault = isDark ? "hsl(222 47% 4%)" : "hsl(210 40% 98%)";
    const backgroundPaper = isDark ? "hsl(222 47% 6%)" : "hsl(0 0% 100%)";
    const softSurface = isDark
      ? alpha("hsl(222 47% 6%)", 0.92)
      : alpha("hsl(0 0% 100%)", 0.88);
    const textPrimary = isDark ? "hsl(210 40% 98%)" : "hsl(222 47% 11%)";
    const textSecondary = isDark ? "hsl(215 20.2% 65.1%)" : "hsl(215.4 16.3% 46.9%)";
    const divider = isDark ? "hsl(217.2 32.6% 22.5%)" : "hsl(214.3 31.8% 91.4%)";
    const primary = isDark ? "hsl(210 40% 98%)" : "hsl(221 83% 53%)";

    return createTheme({
      palette: {
        mode: isDark ? "dark" : "light",
        primary: {
          main: primary,
          contrastText: isDark ? "hsl(222 47% 11%)" : "hsl(0 0% 100%)",
        },
        background: {
          default: backgroundDefault,
          paper: backgroundPaper,
        },
        text: {
          primary: textPrimary,
          secondary: textSecondary,
        },
        divider,
      },
      shape: {
        borderRadius: 18,
      },
      typography: {
        fontFamily: '"Segoe UI Variable Text", "Segoe UI", "Trebuchet MS", sans-serif',
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: backgroundDefault,
            },
          },
        },
        MuiPaper: {
          defaultProps: {
            elevation: 0,
          },
          styleOverrides: {
            root: {
              backgroundImage: "none",
              backgroundColor: backgroundPaper,
              border: `1px solid ${divider}`,
            },
          },
        },
        MuiMenu: {
          styleOverrides: {
            paper: {
              borderRadius: 18,
              overflow: "hidden",
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              color: textPrimary,
              "&:hover": {
                backgroundColor: alpha(primary, isDark ? 0.18 : 0.08),
              },
              "&.Mui-selected": {
                backgroundColor: alpha(primary, isDark ? 0.24 : 0.12),
              },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 9999,
              backgroundColor: softSurface,
              color: textPrimary,
              "& fieldset": {
                borderColor: divider,
              },
              "&:hover fieldset": {
                borderColor: primary,
              },
              "&.Mui-focused fieldset": {
                borderColor: primary,
              },
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            input: {
              color: textPrimary,
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              color: textSecondary,
            },
          },
        },
      },
    });
  }, [isDark]);

  return (
    <MuiThemeProvider theme={theme}>
      {children}
      <CssBaseline />
      <Toaster
        closeButton
        position="top-right"
        theme={isDark ? "dark" : "light"}
        visibleToasts={4}
        duration={4200}
        toastOptions={{
          classNames: {
            toast: "group rounded-2xl border shadow-[0_18px_44px_rgba(15,23,42,0.16)] px-4 py-3 gap-3",
            title: "text-sm font-black tracking-tight",
            description: "text-xs font-semibold opacity-80",
            success: "border-[hsl(var(--brand-cyan)/0.35)] bg-white text-[hsl(var(--brand-navy))] dark:bg-[hsl(220_22%_14%)]",
            error: "border-rose-200 bg-white text-rose-950 dark:border-rose-900/60 dark:bg-[hsl(220_22%_14%)] dark:text-rose-100",
            closeButton: "border-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground",
          },
          style: {
            background: isDark ? "hsl(222 47% 6%)" : "hsl(0 0% 100%)",
            color: isDark ? "hsl(210 40% 98%)" : "hsl(222 47% 11%)",
            border: `1px solid ${isDark ? "hsl(217.2 32.6% 22.5%)" : "hsl(214.3 31.8% 91.4%)"}`,
          },
        }}
      />
    </MuiThemeProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>("light");

  useEffect(() => {
    const nextTheme = resolveAppTheme();
    setThemeState(nextTheme);
    applyAppTheme(nextTheme);
  }, []);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      resolvedTheme: theme,
      setTheme: (nextTheme) => {
        setThemeState(nextTheme);
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        applyAppTheme(nextTheme);
      },
    }),
    [theme],
  );

  return (
    <AppThemeContext.Provider value={value}>
      <MuiThemeBridge>{children}</MuiThemeBridge>
    </AppThemeContext.Provider>
  );
}