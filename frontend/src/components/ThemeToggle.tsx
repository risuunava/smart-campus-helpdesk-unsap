"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className={`flex items-center gap-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${collapsed ? 'justify-center px-0' : 'px-3'} text-th-muted`}>
        <div className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="truncate">Tema</span>}
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${collapsed ? 'justify-center px-0' : 'px-3'} text-th-muted hover:text-th-primary hover:bg-th-hover`}
      title={collapsed ? (isDark ? "Light Mode" : "Dark Mode") : undefined}
    >
      {isDark ? (
        <Sun className="h-5 w-5 shrink-0 text-amber-400" />
      ) : (
        <Moon className="h-5 w-5 shrink-0 text-indigo-400" />
      )}
      {!collapsed && (
        <span className="truncate">{isDark ? "Light Mode" : "Dark Mode"}</span>
      )}
    </button>
  );
}
