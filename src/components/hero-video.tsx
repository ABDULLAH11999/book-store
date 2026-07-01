import { getBannerSettings } from "@/lib/banner";
import { BannerSlider } from "@/components/banner-slider";
import { BRAND_BANNER_PATH, BRAND_NAME } from "@/lib/branding";

export async function HeroVideo() {
  const banner = await getBannerSettings();
  const desktopImages = banner.desktopImages.length ? banner.desktopImages : [BRAND_BANNER_PATH];
  const mobileImages = banner.mobileImages.length ? banner.mobileImages : [BRAND_BANNER_PATH];

  return (
    <div className="relative overflow-hidden bg-ink md:mt-0">
      <BannerSlider desktopImages={desktopImages} mobileImages={mobileImages} alt={`${BRAND_NAME} banner`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-black/5 to-black/15" />
    </div>
  );
}
