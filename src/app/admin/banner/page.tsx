import { prisma } from "@/lib/prisma";
import { BannerManager } from "@/components/admin/banner-manager";

export const dynamic = "force-dynamic";

export default async function AdminBannerPage() {
  const initial = await (async () => {
    try {
      const settings = await prisma.siteSettings.findMany({
        where: { key: "bannerSettings" }
      });
      return settings.reduce<Record<string, string>>((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
    } catch {
      return {};
    }
  })();

  return <BannerManager initialSettings={initial} />;
}
