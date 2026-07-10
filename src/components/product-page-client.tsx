"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Banknote, Truck } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { formatPKR } from "@/lib/utils";
import { SaleCountdown } from "@/components/sale-countdown";
import { StarRating } from "@/components/star-rating";
import { bundleTiers, getBundlePricing } from "@/lib/bundle-pricing";

type ProductVariant = "mobile" | "desktop";

const trustPoints = [
  {
    icon: BadgeCheck,
    label: "100% Authentic"
  },
  {
    icon: Truck,
    label: "Free Delivery"
  },
  {
    icon: Banknote,
    label: "Cash on Delivery"
  }
] as const;

export function ProductPageClient({
  product,
  variant = "mobile"
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: string | number;
    salePrice?: string | number | null;
    stock: number;
    image: string;
  };
  variant?: ProductVariant;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const price = Number(product.price);
  const activeUnitPrice = salePrice ?? price;
  const stockLeft = Math.max(0, product.stock || 49);
  const viewers = useMemo(() => 400 + (product.id.length % 90), [product.id]);
  const pricing = useMemo(() => getBundlePricing(quantity, activeUnitPrice), [quantity, activeUnitPrice]);

  function handleAddToCart() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        brand: product.brand,
        slug: product.slug,
        image: product.image,
        price,
        salePrice
      },
      quantity
    );
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/checkout");
  }

  const bundleCards = (
    <div className={variant === "desktop" ? "grid gap-3 xl:grid-cols-2" : "grid gap-3 md:grid-cols-3"}>
      {bundleTiers.map((tier) => {
        const tierPricing = getBundlePricing(tier.quantity, activeUnitPrice);
        const selected = quantity === tier.quantity;
        const isDesktopWideCard = variant === "desktop" && tier.quantity === 3;

        return (
          <button
            key={tier.quantity}
            type="button"
            onClick={() => setQuantity(tier.quantity)}
            className={`rounded-3xl border p-4 text-left transition ${
              selected ? "border-black bg-black/5 shadow-sm" : "border-black/10 bg-white hover:border-black/30"
            } ${isDesktopWideCard ? "xl:col-span-2" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                    selected ? "border-black bg-black" : "border-black/25"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${selected ? "bg-white" : "bg-transparent"}`} />
                </span>
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-black">{tier.label}</div>
                  <div className="mt-1 text-sm text-black/55">{tier.badge}</div>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
                {tier.quantity === 1 ? "Popular" : "Bundle"}
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.3em] text-black/45">Total</div>
              <div className="text-right">
                {tier.discountPercent > 0 ? (
                  <div className="text-xs text-black/45 line-through">{formatPKR(tierPricing.regularTotal)}</div>
                ) : null}
                <div className="font-heading text-2xl">{formatPKR(tierPricing.discountedTotal)}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const bundleSummary = (
    <div className="flex items-center justify-between rounded-2xl bg-black/[0.03] px-4 py-3 text-sm">
      <span className="text-black/60">
        {pricing.tier.label}
        {pricing.savings > 0 ? ` and save ${formatPKR(pricing.savings)}` : ""}
      </span>
      <span className="font-semibold">{formatPKR(pricing.discountedTotal)}</span>
    </div>
  );

  const actionButtons = (
    <div className="space-y-3">
      <div
        className={
          variant === "desktop"
            ? "flex items-center rounded-2xl border border-black/10 bg-white"
            : "grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-stretch overflow-hidden rounded-2xl border border-black/10 bg-white"
        }
      >
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          className={variant === "desktop" ? "px-5 py-4 text-2xl" : "flex h-12 items-center justify-center text-xl font-semibold"}
        >
          -
        </button>
        <span
          className={
            variant === "desktop"
              ? "min-w-12 px-4 text-center text-lg font-semibold"
              : "flex min-w-0 items-center justify-center px-2 text-base font-semibold"
          }
        >
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((current) => current + 1)}
          className={variant === "desktop" ? "px-5 py-4 text-2xl" : "flex h-12 items-center justify-center text-xl font-semibold"}
        >
          +
        </button>
      </div>
      <button
        onClick={handleAddToCart}
        className="w-full rounded-2xl border-2 border-black bg-black px-6 py-4 font-semibold tracking-[0.2em] text-white transition hover:bg-zinc-800"
      >
        ADD TO CART
      </button>
      <button
        onClick={handleBuyNow}
        className="w-full rounded-2xl bg-black px-6 py-4 font-semibold tracking-[0.2em] text-white transition hover:bg-zinc-800"
      >
        BUY IT NOW
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`I want to order ${product.name}`)}`}
        className="block rounded-2xl bg-[#25D366] px-6 py-4 text-center font-semibold text-black transition hover:opacity-95"
        target="_blank"
        rel="noreferrer"
      >
        Order on WhatsApp
      </a>
    </div>
  );

  const trustBadges = (
    <div className="grid gap-3 rounded-3xl border border-black/10 bg-white p-5 sm:grid-cols-3">
      {trustPoints.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-3 rounded-2xl bg-black/[0.03] px-4 py-3 text-sm text-black/75">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2fe67d]/15 text-[#0b7a3f]">
            <Icon className="h-5 w-5" />
          </span>
          <span className="font-medium">{label}</span>
        </div>
      ))}
    </div>
  );

  if (variant === "desktop") {
    return (
      <div className="hidden lg:block">
        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
          <div className="mb-6 space-y-4 border-b border-black/10 pb-6">
            <span className="inline-flex rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brown">
              Type: {product.brand}
            </span>
            <div className="space-y-3">
              <h1 className="font-heading text-4xl leading-tight text-ink xl:text-5xl">{product.name}</h1>
              <div className="flex items-center gap-3">
                <StarRating value={5} />
                <span className="text-sm text-black/50">(128 reviews)</span>
              </div>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">Buy more, save more</p>
              <h2 className="mt-2 font-heading text-3xl">Choose your bundle</h2>
            </div>
            <div className="rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Best value
            </div>
          </div>

          <div className="space-y-4">
            {bundleCards}
            {bundleSummary}

            <div className="grid gap-4 min-[1500px]:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)] min-[1500px]:items-start">
              <div className="rounded-3xl border border-black/10 bg-black/[0.02] p-5">
                <div className="flex flex-wrap items-end gap-4">
                  {salePrice ? (
                    <>
                      <span className="text-lg text-black/45 line-through">{formatPKR(price)}</span>
                      <span className="font-heading text-4xl text-gold">{formatPKR(salePrice)}</span>
                    </>
                  ) : (
                    <span className="font-heading text-4xl">{formatPKR(price)}</span>
                  )}
                </div>
                <div className="mt-4">
                  <SaleCountdown />
                </div>
              </div>

              <div className="space-y-3 rounded-3xl border border-black/10 bg-white p-5 text-sm">
                <div className="flex items-center gap-2 text-black/70">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">O</span>
                  <span>{viewers} people are viewing this right now</span>
                </div>
                <div className="flex items-center gap-2 text-black/70">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">!</span>
                  <span className="uppercase tracking-[0.2em]">Hurry up! Only {stockLeft} left in stock</span>
                </div>
                <div className="h-2 rounded-full bg-black/10">
                  <div className="h-full rounded-full bg-black" style={{ width: `${Math.max(35, Math.min(92, stockLeft * 2))}%` }} />
                </div>
              </div>

              <div className="min-[1500px]:col-span-2">{actionButtons}</div>
            </div>
          </div>

          <div className="mt-4">{trustBadges}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:sticky lg:top-24 lg:hidden">
      <div className="space-y-4">
        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brown">
          Type: {product.brand}
        </span>
        <h1 className="font-heading text-4xl md:text-6xl">{product.name}</h1>
        <div className="flex items-center gap-3">
          <StarRating value={5} />
          <span className="text-sm text-black/50">(128 reviews)</span>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          {salePrice ? (
            <>
              <span className="text-lg text-black/45 line-through">{formatPKR(price)}</span>
              <span className="font-heading text-4xl text-gold">{formatPKR(salePrice)}</span>
            </>
          ) : (
            <span className="font-heading text-4xl">{formatPKR(price)}</span>
          )}
        </div>
        <div className="mt-4">
          <SaleCountdown />
        </div>
      </div>

      <div className="space-y-3 rounded-3xl border border-black/10 bg-white p-5 text-sm">
        <div className="flex items-center gap-2 text-black/70">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">O</span>
          <span>{viewers} people are viewing this right now</span>
        </div>
        <div className="flex items-center gap-2 text-black/70">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">!</span>
          <span className="uppercase tracking-[0.2em]">Hurry up! Only {stockLeft} left in stock</span>
        </div>
        <div className="h-2 rounded-full bg-black/10">
          <div className="h-full rounded-full bg-black" style={{ width: `${Math.max(35, Math.min(92, stockLeft * 2))}%` }} />
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">Buy more, save more</p>
            <h2 className="mt-2 font-heading text-2xl">Choose your bundle</h2>
          </div>
          <div className="rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            Best value
          </div>
        </div>

        {bundleCards}
        {bundleSummary}
        {actionButtons}
      </div>

      {trustBadges}
    </div>
  );
}
