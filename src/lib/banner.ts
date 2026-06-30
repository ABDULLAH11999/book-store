import { getSetting } from "@/lib/settings";
import { BRAND_BANNER_PATH, BRAND_NAME } from "@/lib/branding";
import { unstable_cache } from "next/cache";

export type BannerSettings = {
  desktopImages: string[];
  mobileImages: string[];
};

export const defaultBannerSettings: BannerSettings = {
  desktopImages: [BRAND_BANNER_PATH],
  mobileImages: [BRAND_BANNER_PATH]
};

const cachedBannerSettings = unstable_cache(
  async () => {
    const banner = await getSetting<BannerSettings>("bannerSettings", defaultBannerSettings);
    return {
      desktopImages: Array.isArray(banner?.desktopImages) && banner.desktopImages.length ? banner.desktopImages : defaultBannerSettings.desktopImages,
      mobileImages: Array.isArray(banner?.mobileImages) && banner.mobileImages.length ? banner.mobileImages : defaultBannerSettings.mobileImages,
      brandName: BRAND_NAME
    };
  },
  ["banner-settings"],
  { revalidate: 300 }
);

export async function getBannerSettings() {
  return cachedBannerSettings();
}
