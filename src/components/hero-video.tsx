"use client";

import Image from "next/image";
import { BRAND_BANNER_PATH, BRAND_NAME } from "@/lib/branding";

export function HeroVideo() {
  return (
    <div className="relative mt-4 overflow-hidden bg-ink sm:mt-6 md:mt-0">
      <div className="relative min-h-[58svh] sm:min-h-[62svh] md:min-h-[86vh]">
        <Image
          src={BRAND_BANNER_PATH}
          alt={`${BRAND_NAME} banner`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/5 to-black/15" />
      </div>
    </div>
  );
}
