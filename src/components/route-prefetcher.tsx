"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RoutePrefetcher({ routes }: { routes: string[] }) {
  const router = useRouter();

  useEffect(() => {
    if (!routes.length) return;

    const prefetch = () => {
      routes.forEach((route) => router.prefetch(route));
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(prefetch, 800);
    return () => window.clearTimeout(timer);
  }, [router, routes]);

  return null;
}
