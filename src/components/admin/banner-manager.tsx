"use client";

import { useMemo, useRef, useState, type RefObject } from "react";
import toast from "react-hot-toast";
import { useMediaUploader } from "@/components/media-uploader";
import { MediaImage } from "@/components/media-image";
import type { BannerSettings } from "@/lib/banner";

type SettingsMap = Record<string, string>;

function parseBannerSettings(raw: string | undefined): BannerSettings {
  if (!raw) return { desktopImages: [], mobileImages: [] };
  try {
    const parsed = JSON.parse(raw);
    return {
      desktopImages: Array.isArray(parsed.desktopImages) ? parsed.desktopImages : [],
      mobileImages: Array.isArray(parsed.mobileImages) ? parsed.mobileImages : []
    };
  } catch {
    return { desktopImages: [], mobileImages: [] };
  }
}

function BannerColumn({
  title,
  description,
  images,
  uploading,
  onAdd,
  onRemove,
  onPick,
  inputRef
}: {
  title: string;
  description: string;
  images: string[];
  uploading: boolean;
  onAdd: () => void;
  onRemove: (image: string) => void;
  onPick: (files: FileList | null) => void;
  inputRef: RefObject<HTMLInputElement>;
}) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-black/55">{description}</p>
        </div>
        <button type="button" onClick={onAdd} className="rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white">
          Add Images
        </button>
      </div>

      <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={(event) => onPick(event.target.files)} />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image) => (
          <div key={image} className="overflow-hidden rounded-3xl border border-black/10 bg-black/5">
            <MediaImage src={image} alt={title} width={480} height={320} className="h-48 w-full object-cover" />
            <div className="flex items-center justify-between gap-3 p-3">
              <p className="truncate text-xs text-black/55">{image}</p>
              <button type="button" onClick={() => onRemove(image)} className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold">
                Remove
              </button>
            </div>
          </div>
        ))}
        {images.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/15 p-8 text-center text-sm text-black/45">
            No banner images added yet.
          </div>
        ) : null}
      </div>

      <p className="mt-4 text-xs uppercase tracking-[0.3em] text-black/40">{uploading ? "Uploading to Cloudinary..." : "Cloudinary enabled"}</p>
    </section>
  );
}

export function BannerManager({ initialSettings }: { initialSettings: SettingsMap }) {
  const initial = useMemo(() => parseBannerSettings(initialSettings.bannerSettings), [initialSettings.bannerSettings]);
  const [desktopImages, setDesktopImages] = useState<string[]>(initial.desktopImages);
  const [mobileImages, setMobileImages] = useState<string[]>(initial.mobileImages);
  const [saving, setSaving] = useState(false);
  const desktopInputRef = useRef<HTMLInputElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const { uploadFiles, uploading } = useMediaUploader("islamicplay/banners");

  async function uploadAndAppend(target: "desktop" | "mobile", files: FileList | null) {
    const urls = await uploadFiles(files);
    if (!urls.length) return;
    if (target === "desktop") {
      setDesktopImages((current) => [...current, ...urls]);
    } else {
      setMobileImages((current) => [...current, ...urls]);
    }
  }

  async function save() {
    setSaving(true);
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        values: {
          bannerSettings: JSON.stringify({
            desktopImages,
            mobileImages
          })
        }
      })
    });
    setSaving(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      toast.error(data.error || "Unable to save banner settings");
      return;
    }
    toast.success("Banner settings saved");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">Banner Settings</p>
        <h1 className="mt-2 font-heading text-3xl md:text-5xl">Desktop and Mobile Banner</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BannerColumn
          title="Desktop Banner"
          description="Add one or more images for the large-screen hero slider."
          images={desktopImages}
          uploading={uploading}
          onAdd={() => desktopInputRef.current?.click()}
          onRemove={(image) => setDesktopImages((current) => current.filter((url) => url !== image))}
          onPick={(files) => uploadAndAppend("desktop", files)}
          inputRef={desktopInputRef}
        />
        <BannerColumn
          title="Mobile Banner"
          description="Add one or more images optimized for mobile devices."
          images={mobileImages}
          uploading={uploading}
          onAdd={() => mobileInputRef.current?.click()}
          onRemove={(image) => setMobileImages((current) => current.filter((url) => url !== image))}
          onPick={(files) => uploadAndAppend("mobile", files)}
          inputRef={mobileInputRef}
        />
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="rounded-2xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-60">
          {saving ? "Saving..." : "Save Banner"}
        </button>
      </div>
    </div>
  );
}
