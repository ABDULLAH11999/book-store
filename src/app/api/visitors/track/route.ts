import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  classifyVisitorPlatform,
  formatEntryUrl,
  getRequestIp,
  getVisitorLocation,
  normalizeEntryUrl
} from "@/lib/visitor-tracking";
import { getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const visitorTrackSchema = z.object({
  sessionId: z.string().trim().min(8).optional(),
  url: z.string().trim().min(1),
  referrer: z.string().trim().optional().nullable(),
  userAgent: z.string().trim().optional().nullable()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = visitorTrackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid visitor payload" }, { status: 400 });
  }

  const siteUrl = getSiteUrl();
  const sessionId = parsed.data.sessionId || randomUUID();
  const headers = request.headers;
  const entryUrl = normalizeEntryUrl(siteUrl, parsed.data.url);
  const entryPath = new URL(entryUrl).pathname || "/";
  const entryDomain = new URL(entryUrl).host;
  const referrer = parsed.data.referrer?.trim() || null;
  const ipAddress = getRequestIp(headers);
  const location = getVisitorLocation(headers);
  const userAgent = (parsed.data.userAgent?.trim() || headers.get("user-agent") || "").slice(0, 1000) || null;
  const platform = classifyVisitorPlatform({
    referrer,
    url: parsed.data.url,
    userAgent
  });

  const existing = await prisma.visitorSession.findUnique({ where: { sessionId } });

  const visitor = existing
    ? await prisma.visitorSession.update({
        where: { sessionId },
        data: {
          lastSeenAt: new Date(),
          pageViews: { increment: 1 }
        }
      })
    : await prisma.visitorSession.create({
        data: {
          sessionId,
          entryUrl: formatEntryUrl(entryUrl, siteUrl),
          entryPath,
          entryDomain,
          referrer,
          platform,
          ipAddress,
          countryCode: location.countryCode,
          countryName: location.countryName,
          state: location.state,
          city: location.city,
          userAgent
        }
      });

  const response = NextResponse.json({ ok: true, visitor });

  if (!existing) {
    response.cookies.set("visitor_session_id", sessionId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      secure: siteUrl.startsWith("https://")
    });
  }

  return response;
}
