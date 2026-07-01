import { prisma } from "@/lib/prisma";
import { TestimonialManager } from "@/components/admin/testimonial-manager";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const serialized = await (async () => {
    try {
      const testimonials = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
      return testimonials.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      }));
    } catch {
      return [];
    }
  })();
  return <TestimonialManager initialTestimonials={serialized} />;
}
