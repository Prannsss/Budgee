"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function DynamicStatusBar() {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    // Determine the actual theme being used
    const actualTheme = theme === "system" ? systemTheme : theme;
    const isDark = actualTheme === "dark";

    // Update Apple status bar style
    const statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (statusBarMeta) {
      statusBarMeta.setAttribute("content", isDark ? "black-translucent" : "default");
    }

    // Update theme-color meta tag
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement("meta");
      themeColorMeta.setAttribute("name", "theme-color");
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute("content", isDark ? "#000000" : "#ffffff");

    // Update MSApplication tile color
    const tileMeta = document.querySelector('meta[name="msapplication-TileColor"]');
    if (tileMeta) {
      tileMeta.setAttribute("content", isDark ? "#000000" : "#ffffff");
    }
  }, [theme, systemTheme]);

  return null; // This component doesn't render anything
}