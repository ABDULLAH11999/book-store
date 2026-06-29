"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND_BANNER_PATH, BRAND_NAME, BRAND_TAGLINE } from "@/lib/branding";

export function HeroVideo() {
  return (
    <div className="relative overflow-hidden bg-ink">
      <div className="relative min-h-[58svh] sm:min-h-[62svh] md:min-h-[86vh]">
        <Image
          src={BRAND_BANNER_PATH}
          alt={`${BRAND_NAME} banner`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
        <div className="relative mx-auto flex min-h-[58svh] max-w-7xl items-end px-4 pb-10 pt-16 sm:min-h-[62svh] sm:pb-12 sm:pt-20 md:min-h-[86vh] md:items-center md:px-8 md:py-24">
          <div className="max-w-3xl text-white">
            <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-gold sm:mb-3 sm:text-xs md:mb-4 md:text-sm md:tracking-[0.5em]">
              {BRAND_TAGLINE}
            </p>
            <h1 className="font-heading text-[2.15rem] leading-[1.02] text-gold sm:text-4xl md:text-7xl">{BRAND_NAME}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gold/80 sm:mt-4 md:mt-6 md:text-2xl">
              {"\u0627\u0633\u0644\u0627\u0645\u06cc \u0627\u0646\u062f\u0627\u0632\u060c \u0635\u0627\u0641 \u0633\u062a\u06be\u0631\u0627 \u062a\u062c\u0631\u0628\u06c1\u060c \u0627\u0648\u0631 \u0627\u06cc\u06a9 \u067e\u0631\u0633\u06a9\u0648\u0646 \u062e\u0631\u06cc\u062f\u0627\u0631\u06cc \u0633\u0641\u0631\u06d4"}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-6 md:mt-10 md:gap-4">
              <Link href="/collections" className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 md:px-6 md:py-3 md:text-base">
                Browse Collection
              </Link>
              <Link href="/contact" className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 md:px-6 md:py-3 md:text-base">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
