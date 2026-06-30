"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function createSessionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const existingCookie = getCookie("visitor_session_id");
    if (existingCookie) return;

    const pendingKey = "visitor_session_pending";
    const pendingSession = window.sessionStorage.getItem(pendingKey);
    if (pendingSession) return;

    const sessionId = createSessionId();
    window.sessionStorage.setItem(pendingKey, sessionId);

    const payload = JSON.stringify({
      sessionId,
      url: window.location.href,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent
    });

    const blob = new Blob([payload], { type: "application/json" });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/visitors/track", blob);
      return;
    }

    fetch("/api/visitors/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
