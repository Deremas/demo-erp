"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

import { useAppTheme } from "@/components/app-shell/providers";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useAppTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const Icon = isDark ? SunMedium : MoonStar;
  const label = isDark ? "Light" : "Dark";
  const controlClass =
    "border-border bg-background text-foreground shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition hover:border-[hsl(var(--brand-cyan)/0.45)] hover:bg-accent";
  const iconWrapClass = isDark
    ? "border-[hsl(var(--brand-gold)/0.8)] bg-[hsl(var(--brand-gold)/0.38)] text-[hsl(var(--brand-navy))] shadow-[0_0_18px_rgba(14,116,144,0.16)]"
    : "border-[hsl(var(--brand-cyan)/0.28)] bg-[hsl(var(--accent))] text-[hsl(var(--brand-blue))] shadow-[0_0_18px_rgba(56,189,248,0.18)]";
  const labelClass = "text-[hsl(var(--topbar-foreground))]";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={`h-10 w-10 rounded-full px-0 sm:w-auto sm:px-3 ${controlClass}`}
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border transition-transform duration-200 ${iconWrapClass}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className={`hidden text-xs font-semibold sm:inline sm:text-sm ${labelClass}`}>
        {label}
      </span>
    </Button>
  );
}