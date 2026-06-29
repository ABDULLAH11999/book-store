"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

function useRotatingIndex(length: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [length]);

  return index;
}

export function BannerSlider({
  desktopImages,
  mobileImages,
  alt
}: {
  desktopImages: string[];
  mobileImages: string[];
  alt: string;
}) {
  const desktopIndex = useRotatingIndex(desktopImages.length);
  const mobileIndex = useRotatingIndex(mobileImages.length);

  const desktopImage = desktopImages[Math.min(desktopIndex, desktopImages.length - 1)] || desktopImages[0];
  const mobileImage = mobileImages[Math.min(mobileIndex, mobileImages.length - 1)] || mobileImages[0];

  return (
    <>
      <div className="relative hidden min-h-[58svh] overflow-hidden bg-ink md:block md:min-h-[86vh]">
        <Image src={desktopImage} alt={alt} fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <div className="relative block min-h-[58svh] overflow-hidden bg-ink md:hidden">
        <Image src={mobileImage} alt={alt} fill priority sizes="100vw" className="object-cover object-center" />
      </div>
    </>
  );
}
