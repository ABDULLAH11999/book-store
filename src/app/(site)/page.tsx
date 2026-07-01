import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";
import { HeroVideo } from "@/components/hero-video";
import { BrandStrip } from "@/components/brand-strip";
import { FeaturedProductsGrid } from "@/components/featured-products-grid";
import { CinematicBanner } from "@/components/cinematic-banner";
import { Suspense } from "react";

const TestimonialCarousel = dynamic(
  () => import("@/components/swiper-testimonials").then((module) => module.TestimonialCarousel),
  {
    loading: () => <SectionSkeleton title="What Our Customers Say" />
  }
);

const WhyChooseSection = dynamic(() => import("@/components/why-choose-section").then((module) => module.WhyChooseSection), {
  loading: () => <SectionSkeleton title="Why people choose IslamicPlay" />
});

const FaqSection = dynamic(() => import("@/components/faq-section").then((module) => module.FaqSection), {
  loading: () => <SectionSkeleton title="Frequently Asked Questions" />
});

export const revalidate = 300;

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8 lg:py-16">
      <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
        <div className="h-3 w-32 rounded-full bg-black/10" />
        <div className="mt-4 h-10 w-3/5 rounded-2xl bg-black/10" />
        <div className="mt-6 h-24 rounded-3xl bg-black/[0.04]" />
      </div>
      <span className="sr-only">{title}</span>
    </section>
  );
}

export default async function HomePage() {
  let featured: Array<{
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: string;
    salePrice: string | null;
    images: string[];
  }> = [];
  let testimonials: Array<{ id: string; customerName: string; customerImage: string; rating: number; reviewText: string }> = [];

  try {
    const [products, testimonialRows] = await Promise.all([
        prisma.product.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          take: 10
        }),
      prisma.testimonial.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { sortOrder: "asc" }
      })
    ]);

    featured = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || null,
      images: Array.isArray(product.images) ? (product.images as string[]) : []
    }));
    testimonials = testimonialRows.map((item) => ({
      id: item.id,
      customerName: item.customerName,
      customerImage: item.customerImage,
      rating: item.rating,
      reviewText: item.reviewText
    }));
  } catch {
    featured = [];
    testimonials = [];
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="order-1">
          <HeroVideo />
        </div>

        <div className="order-3">
          <BrandStrip />
        </div>

        <section className="order-4 mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8 lg:py-16">
          <div className="mb-4 sm:mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-gold sm:text-sm sm:tracking-[0.4em]">Featured Products</p>
          </div>
          <FeaturedProductsGrid products={featured} />
        </section>

        <Suspense fallback={<SectionSkeleton title="Why people choose IslamicPlay" />}>
          <div className="order-5">
            <WhyChooseSection />
          </div>
        </Suspense>

        <div className="order-6">
          <CinematicBanner />
        </div>

        <Suspense fallback={<SectionSkeleton title="What Our Customers Say" />}>
          <section className="order-7 mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8 lg:py-16">
            <div className="mb-4 sm:mb-8">
              <p className="text-xs uppercase tracking-[0.35em] text-gold sm:text-sm sm:tracking-[0.4em]">Testimonials</p>
              <h2 className="mt-1 font-heading text-2xl sm:mt-2 sm:text-4xl">What Our Customers Say</h2>
            </div>
            <TestimonialCarousel items={testimonials} />
          </section>
        </Suspense>

        <Suspense fallback={<SectionSkeleton title="Frequently Asked Questions" />}>
          <div className="order-8">
            <FaqSection />
          </div>
        </Suspense>
      </div>
    </>
  );
}
