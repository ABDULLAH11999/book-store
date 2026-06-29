import { getBannerSettings } from "@/lib/banner";
import { BannerSlider } from "@/components/banner-slider";
import { BRAND_NAME } from "@/lib/branding";

export async function HeroVideo() {
  const banner = await getBannerSettings();

  return (
    <div className="relative mt-4 overflow-hidden bg-ink sm:mt-6 md:mt-0">
      <BannerSlider desktopImages={banner.desktopImages} mobileImages={banner.mobileImages} alt={`${BRAND_NAME} banner`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-black/5 to-black/15" />
    </div>
  );
}
