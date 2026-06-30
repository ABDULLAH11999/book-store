import { prisma } from "@/lib/prisma";
import { VisitorTable } from "@/components/admin/visitor-table";
import { getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function AdminVisitorsPage() {
  const siteUrl = getSiteUrl();

  const visitors = await prisma.visitorSession.findMany({
    where: {
      NOT: {
        OR: [
          { entryDomain: { contains: "localhost", mode: "insensitive" } },
          { entryDomain: { contains: "127.0.0.1", mode: "insensitive" } },
          { ipAddress: "::1" }
        ]
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const serialized = visitors.map((visitor) => ({
    id: visitor.id,
    sessionId: visitor.sessionId,
    entryUrl: visitor.entryUrl,
    entryPath: visitor.entryPath,
    entryDomain: visitor.entryDomain,
    referrer: visitor.referrer,
    platform: visitor.platform,
    ipAddress: visitor.ipAddress,
    countryCode: visitor.countryCode,
    countryName: visitor.countryName,
    userAgent: visitor.userAgent,
    pageViews: visitor.pageViews,
    createdAt: visitor.createdAt.toISOString(),
    lastSeenAt: visitor.lastSeenAt.toISOString()
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-black/45 sm:text-sm">Analytics</p>
          <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-5xl">Visitors</h1>
        </div>
      </div>
      <VisitorTable visitors={serialized} siteUrl={siteUrl} />
    </div>
  );
}
