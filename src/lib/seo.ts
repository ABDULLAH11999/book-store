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
  metaDescription: "Elegant IslamicPlay shopping with a refined, premium experience.",
  canonicalUrl: "",
  metaKeywords: "",
  ogTitle: BRAND_NAME,
  ogDescription: "Elegant IslamicPlay shopping with a refined, premium experience.",
  ogImage: "",
  headerScripts: "",
  footerScripts: "",
  robotsTxt: ""
};

export function getSiteUrl(seo?: Partial<SeoSettings>) {
  const configured = seo?.canonicalUrl?.trim();
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fallback = configured || envUrl || BRAND_SITE_URL;
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
