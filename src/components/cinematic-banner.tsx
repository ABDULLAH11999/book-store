import { getBannerSettings } from "@/lib/banner";
import { BRAND_BANNER_PATH, BRAND_NAME } from "@/lib/branding";

function resolveImageUrl(image?: string) {
  if (!image) return BRAND_BANNER_PATH;
  if (image.startsWith("http")) return image;
  return image.startsWith("/") ? image : `/${image}`;
}

export async function CinematicBanner() {
  const banner = await getBannerSettings();
  const desktopImage = resolveImageUrl(banner.desktopImages[0]);
  const mobileImage = resolveImageUrl(banner.mobileImages[0] || banner.desktopImages[0]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8 lg:py-14">
      <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[240px] overflow-hidden bg-black sm:min-h-[320px] lg:min-h-[420px]">
            <div
              className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
              style={{ backgroundImage: `url("${desktopImage}")` }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 block bg-cover bg-center bg-no-repeat md:hidden"
              style={{ backgroundImage: `url("${mobileImage}")` }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/18 via-black/5 to-transparent" />
          </div>

          <div className="flex items-center bg-white px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-black/45 sm:text-sm sm:tracking-[0.4em]">Our Mission</p>
              <h2 className="mt-3 font-heading text-3xl leading-tight text-black sm:mt-4 sm:text-4xl lg:text-5xl">
                Making the Quran Easy to Read and Understand
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-black/60 sm:mt-4 sm:text-base">
                Our mission is to present the Quran and Islamic books in a simple, respectful way so every person can understand, reflect,
                and benefit with ease.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
