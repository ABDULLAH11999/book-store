import { getSetting } from "@/lib/settings";
import { BRAND_NAME, BRAND_SITE_URL } from "@/lib/branding";
import { unstable_cache } from "next/cache";

export type SeoSettings = {
  siteTitle: string;
  titleTemplate: string;
  metaDescription: string;
  canonicalUrl: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  headerScripts: string;
  footerScripts: string;
  robotsTxt: string;
};

const defaultSeoSettings: SeoSettings = {
  siteTitle: BRAND_NAME,
  titleTemplate: `%s | ${BRAND_NAME}`,
  metaDescription:
    "IslamicPlay is an online Islamic bookstore for Quran, Urdu Islamic books, and meaningful gifts in Pakistan.",
  canonicalUrl: "",
  metaKeywords:
    "IslamicPlay, Islamic books, Quran, Urdu books, Islamic bookstore Pakistan, buy Quran online, Islamic gifts, Quran shop",
  ogTitle: BRAND_NAME,
  ogDescription:
    "IslamicPlay is an online Islamic bookstore for Quran, Urdu Islamic books, and meaningful gifts in Pakistan.",
  ogImage: "",
  headerScripts: "",
  footerScripts: "",
  robotsTxt: ""
};

export function getSiteUrl(seo?: Partial<SeoSettings>) {
  const configured = seo?.canonicalUrl?.trim();
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const candidates = [configured, envUrl, BRAND_SITE_URL].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      const normalized = new URL(candidate);
      if (normalized.hostname === "islamicplay.pk" || normalized.hostname.endsWith(".islamicplay.pk")) {
        return normalized.origin;
      }
    } catch {
      continue;
    }
  }

  const fallback = BRAND_SITE_URL;
  try {
    const normalized = new URL(fallback);
    return normalized.origin;
  } catch {
    return BRAND_SITE_URL;
  }
}

const cachedSeoSettings = unstable_cache(
  async () => {
    const seo = await getSetting<SeoSettings>("seoSettings", defaultSeoSettings);
    return { ...defaultSeoSettings, ...seo };
  },
  ["seo-settings"],
  { revalidate: 300 }
);

export async function getSeoSettings() {
  return cachedSeoSettings();
}
