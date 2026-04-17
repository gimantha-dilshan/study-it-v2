"use client";

import { useEffect } from "react";

export default function ScrollRestoration() {
  useEffect(() => {
    // Disable browser's built-in scroll restoration so every
    // page load / refresh always starts at the very top.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return null;
}
