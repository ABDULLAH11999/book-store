import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPageClient } from "@/components/product-page-client";
import { ProductCard } from "@/components/product-card";
import { MediaImage } from "@/components/media-image";
import { StarRating } from "@/components/star-rating";
import { getSeoSettings, getSiteUrl } from "@/lib/seo";
import { BRAND_NAME } from "@/lib/branding";

export const revalidate = 300;

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } }).catch(() => null);
  if (!product || product.status !== "PUBLISHED") {
    return {};
  }

  const seo = await getSeoSettings();
  const siteUrl = getSiteUrl(seo);
  const description = stripHtml(product.description).slice(0, 160) || `${product.name} from ${BRAND_NAME}.`;
  const productUrl = `${siteUrl}/product/${product.slug}`;
  const image = Array.isArray(product.images) && product.images.length ? (product.images as string[])[0] : "";
  const imageUrl = image ? (image.startsWith("http") ? image : `${siteUrl}${image.startsWith("/") ? image : `/${image}`}`) : undefined;
  const keywords = [
    product.name,
    product.brand,
    BRAND_NAME,
    "Islamic books",
    "Quran",
    "Urdu books",
    "Pakistan"
  ];

  return {
    metadataBase: new URL(siteUrl),
    title: `${product.name} | ${BRAND_NAME}`,
    description,
    keywords,
    alternates: {
      canonical: productUrl
    },
    openGraph: {
      title: `${product.name} | ${BRAND_NAME}`,
      description,
      url: productUrl,
      siteName: seo.siteTitle || BRAND_NAME,
      type: "website",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: product.name
            }
          ]
        : undefined
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${BRAND_NAME}`,
      description,
      images: imageUrl ? [imageUrl] : undefined
    }
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  let product: any = null;
  let related: Array<any> = [];
  let testimonials: Array<any> = [];

  try {
    product = await prisma.product.findUnique({ where: { slug: params.slug } });
    if (product && product.status === "PUBLISHED") {
      related = await prisma.product.findMany({
        where: {
          brand: product.brand,
          id: { not: product.id },
          status: "PUBLISHED"
        },
        take: 4
      });
      testimonials = await prisma.testimonial.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 8
      });
    }
  } catch {
    product = null;
  }

  if (!product) return notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start lg:gap-8 xl:gap-12">
        <div className="lg:sticky lg:top-24">
          <ProductGallery
            images={Array.isArray(product.images) && product.images.length ? (product.images as string[]) : ["/books/asan-tarjuma-quran-1.webp"]}
            videoUrl={product.videoUrl}
            name={product.name}
          />
        </div>

        <div className="space-y-10">
          <ProductPageClient
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              brand: product.brand,
              price: product.price.toString(),
              salePrice: product.salePrice?.toString() || null,
              stock: product.stock ?? 0,
              image: (Array.isArray(product.images) && product.images.length ? (product.images as string[]) : ["/books/asan-tarjuma-quran-1.webp"])[0]
            }}
            variant="mobile"
          />

          <ProductPageClient
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              brand: product.brand,
              price: product.price.toString(),
              salePrice: product.salePrice?.toString() || null,
              stock: product.stock ?? 0,
              image: (Array.isArray(product.images) && product.images.length ? (product.images as string[]) : ["/books/asan-tarjuma-quran-1.webp"])[0]
            }}
            variant="desktop"
          />
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-heading text-3xl">Description</h2>
        <div className="prose prose-lg mt-5 max-w-none rounded-3xl border border-black/10 bg-white p-6">
          <div
            dangerouslySetInnerHTML={{
              __html:
                product.description ||
                `<p>${product.name} is part of the IslamicPlay collection, thoughtfully selected for readers and gift buyers looking for meaningful Islamic content.</p>`
            }}
          />
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gold">Testimonials</p>
            <h2 className="mt-2 font-heading text-3xl">Latest Customer Feedback</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {testimonials.slice(0, 8).map((item) => (
            <article key={item.id || item.customerName} className="rounded-[1.5rem] border border-black/10 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex items-center gap-3">
                <MediaImage
                  src={item.customerImage || "/ui-image/Logo.avif"}
                  alt={item.customerName}
                  width={56}
                  height={56}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-ink sm:text-base">{item.customerName}</h3>
                  <div className="mt-1">
                    <StarRating value={item.rating || 5} />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-6 text-black/60 sm:text-sm">{item.reviewText}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-heading text-3xl">Related Products</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                id: item.id,
                name: item.name,
                slug: item.slug,
                brand: item.brand,
                price: item.price.toString(),
                salePrice: item.salePrice?.toString() || null,
                images: Array.isArray(item.images) && item.images.length ? (item.images as string[]) : ["/books/asan-tarjuma-quran-1.webp"]
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
