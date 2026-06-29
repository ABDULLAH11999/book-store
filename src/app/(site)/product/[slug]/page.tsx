import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPageClient } from "@/components/product-page-client";
import { ProductCard } from "@/components/product-card";
import { demoProducts } from "@/lib/demo-data";
import { MediaImage } from "@/components/media-image";
import { StarRating } from "@/components/star-rating";
import { demoTestimonials } from "@/lib/demo-data";

export const revalidate = 300;

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } }).catch(() => null);
  const fallback = demoProducts.find((item) => item.slug === params.slug) ?? null;
  const current = product ?? fallback;

  if (!current) {
    return {};
  }

  const description =
    "description" in current && typeof current.description === "string"
      ? stripHtml(current.description).slice(0, 160)
      : `${current.name} from IslamicPlay.`;

  return {
    title: `${current.name} | IslamicPlay`,
    description
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
    } else if (!product) {
      product = demoProducts.find((item) => item.slug === params.slug) ?? null;
      if (product) {
        related = demoProducts.filter((item) => item.brand === product.brand && item.slug !== product.slug).slice(0, 4);
        testimonials = demoTestimonials.slice(0, 8);
      }
    }
  } catch {
    product = demoProducts.find((item) => item.slug === params.slug) ?? null;
    if (product) {
      related = demoProducts.filter((item) => item.brand === product.brand && item.slug !== product.slug).slice(0, 4);
      testimonials = demoTestimonials.slice(0, 8);
    }
  }

  if (!product) return notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={Array.isArray(product.images) && product.images.length ? (product.images as string[]) : ["/books/asan-tarjuma-quran-1.webp"]}
          videoUrl={product.videoUrl}
          name={product.name}
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
        />
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
