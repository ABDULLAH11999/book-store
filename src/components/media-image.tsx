"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";
import { normalizeMediaUrl } from "@/lib/media";

type MediaImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc?: string;
};

export function MediaImage({ src, fallbackSrc = "/ui-image/Logo.avif", alt, ...props }: MediaImageProps) {
  const normalized = useMemo(() => normalizeMediaUrl(src), [src]);
  const [currentSrc, setCurrentSrc] = useState(normalized || fallbackSrc);
  const loading = props.priority ? "eager" : props.loading || "lazy";

  useEffect(() => {
    setCurrentSrc(normalized || fallbackSrc);
  }, [normalized, fallbackSrc]);

  return (
    <Image
      {...props}
      loading={loading}
      src={currentSrc || fallbackSrc}
      alt={alt}
      unoptimized
      decoding="async"
      onError={() => setCurrentSrc(fallbackSrc)}
    />
  );
}
