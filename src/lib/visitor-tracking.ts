export type VisitorPlatform = "TIKTOK" | "GOOGLE_SEARCH" | "SHARED_LINK";

type VisitorSource = {
  referrer?: string | null;
  url?: string | null;
  userAgent?: string | null;
};

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

function normalizeSource(input?: string | VisitorSource | null) {
  if (!input) {
    return {
      referrer: "",
      url: "",
      userAgent: ""
    };
  }

  if (typeof input === "string") {
    return {
      referrer: input.toLowerCase().trim(),
      url: "",
      userAgent: ""
    };
  }

  return {
    referrer: input.referrer?.toLowerCase().trim() || "",
    url: input.url?.toLowerCase().trim() || "",
    userAgent: input.userAgent?.toLowerCase().trim() || ""
  };
}

function hasSearchSignals(referrer: string, url: string) {
  return (
    referrer.includes("google.") ||
    referrer.includes("google.com") ||
    referrer.includes("bing.") ||
    referrer.includes("duckduckgo.") ||
    referrer.includes("yahoo.") ||
    referrer.includes("search") ||
    url.includes("gclid=") ||
    url.includes("gbraid=") ||
    url.includes("wbraid=") ||
    url.includes("utm_source=google") ||
    url.includes("utm_medium=cpc") ||
    url.includes("utm_medium=organic")
  );
}

function hasTikTokSignals(referrer: string, url: string, userAgent: string) {
  return (
    referrer.includes("tiktok") ||
    url.includes("ttclid=") ||
    url.includes("utm_source=tiktok") ||
    url.includes("utm_campaign=tiktok") ||
    userAgent.includes("tiktok")
  );
}

function hasSharedLinkSignals(referrer: string, url: string) {
  return (
    referrer.includes("whatsapp") ||
    referrer.includes("wa.me") ||
    referrer.includes("facebook") ||
    referrer.includes("messenger") ||
    referrer.includes("instagram") ||
    referrer.includes("t.me") ||
    referrer.includes("telegram") ||
    referrer.includes("linkedin") ||
    referrer.includes("share") ||
    referrer.includes("direct") ||
    url.includes("utm_source=whatsapp") ||
    url.includes("utm_source=facebook") ||
    url.includes("utm_source=instagram") ||
    url.includes("utm_source=telegram") ||
    url.includes("utm_source=linkedin")
  );
}

export function classifyVisitorPlatform(input?: string | VisitorSource | null) {
  const { referrer, url, userAgent } = normalizeSource(input);
  const sourceIsEmpty = !referrer && !url && !userAgent;

  if (hasTikTokSignals(referrer, url, userAgent)) {
    return "TIKTOK" satisfies VisitorPlatform;
  }

  if (hasSearchSignals(referrer, url)) {
    return "GOOGLE_SEARCH" satisfies VisitorPlatform;
  }

  if (hasSharedLinkSignals(referrer, url)) {
    return "SHARED_LINK" satisfies VisitorPlatform;
  }

  if (sourceIsEmpty) {
    return "SHARED_LINK" satisfies VisitorPlatform;
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
