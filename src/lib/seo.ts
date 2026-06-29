import { getSetting } from "@/lib/settings";
import { BRAND_NAME, BRAND_SITE_URL } from "@/lib/branding";

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

export async function getSeoSettings() {
  const seo = await getSetting<SeoSettings>("seoSettings", defaultSeoSettings);
  return { ...defaultSeoSettings, ...seo };
}
