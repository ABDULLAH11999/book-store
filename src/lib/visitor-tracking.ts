export type VisitorPlatform = "TIKTOK" | "GOOGLE_SEARCH" | "SHARED_LINK";

export function getRequestIp(headers: Headers) {
  const candidates = [
    headers.get("cf-connecting-ip"),
    headers.get("x-forwarded-for"),
    headers.get("x-real-ip"),
    headers.get("x-client-ip"),
    headers.get("x-vercel-forwarded-for")
  ];

  const ip = candidates.find((value) => value?.trim());
  return ip?.split(",")[0]?.trim() || null;
}

export function classifyVisitorPlatform(referrer?: string | null) {
  const source = referrer?.toLowerCase().trim() || "";
  if (!source) return "SHARED_LINK" satisfies VisitorPlatform;

  if (
    source.includes("google.") ||
    source.includes("google.com") ||
    source.includes("gclid=") ||
    source.includes("search") ||
    source.includes("bing.") ||
    source.includes("duckduckgo.") ||
    source.includes("yahoo.")
  ) {
    return "GOOGLE_SEARCH" satisfies VisitorPlatform;
  }

  if (
    source.includes("whatsapp") ||
    source.includes("wa.me") ||
    source.includes("facebook") ||
    source.includes("messenger") ||
    source.includes("instagram") ||
    source.includes("t.me") ||
    source.includes("telegram") ||
    source.includes("linkedin") ||
    source.includes("share") ||
    source.includes("direct")
  ) {
    return "SHARED_LINK" satisfies VisitorPlatform;
  }

  if (source.includes("tiktok")) {
    return "TIKTOK" satisfies VisitorPlatform;
  }

  return "SHARED_LINK" satisfies VisitorPlatform;
}

export function resolveCountryName(countryCode?: string | null) {
  const code = countryCode?.trim();
  if (!code) return null;

  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

export function getVisitorLocation(headers: Headers) {
  const countryCode = headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || null;
  const countryName = headers.get("x-vercel-ip-country-name") || resolveCountryName(countryCode);
  const state =
    headers.get("x-vercel-ip-country-region") ||
    headers.get("x-vercel-ip-country-region-name") ||
    headers.get("x-vercel-ip-region") ||
    null;
  const city = headers.get("x-vercel-ip-city") || headers.get("cf-ipcity") || null;

  return {
    countryCode,
    countryName,
    state,
    city
  };
}

export function normalizeEntryUrl(siteUrl: string, inputUrl: string) {
  const base = new URL(siteUrl);
  const resolved = new URL(inputUrl, base);
  return resolved.toString();
}

export function formatEntryUrl(entryUrl: string, siteUrl?: string) {
  try {
    const resolved = new URL(entryUrl, siteUrl || undefined);
    if (resolved.pathname === "/" && !resolved.search && !resolved.hash) {
      return resolved.origin;
    }
    return `${resolved.origin}${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return entryUrl;
  }
}

export function formatPlatformLabel(platform: string) {
  if (platform === "GOOGLE_SEARCH") return "Google Search";
  if (platform === "SHARED_LINK") return "Shared Link";
  return "TikTok";
}
