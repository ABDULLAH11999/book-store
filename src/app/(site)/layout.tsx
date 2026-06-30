import { prisma } from "@/lib/prisma";
import { SiteChrome } from "@/components/site-chrome";
import { unstable_cache } from "next/cache";

export const revalidate = 300;

const getLatestProductTitles = unstable_cache(
  async () => {
    try {
      const products = await prisma.product.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { name: true }
      });
      return products.map((product) => product.name).filter(Boolean);
    } catch {
      return [] as string[];
    }
  },
  ["site-latest-product-titles"],
  { revalidate: 300 }
);

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const latestProductTitles = await getLatestProductTitles();
  return <SiteChrome latestProductTitles={latestProductTitles}>{children}</SiteChrome>;
}
