import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  const { path } = params;
  const segments = path.join("/");
  const target = segments.startsWith("testimonials/")
    ? `/testimonials/${segments.replace(/^testimonials\//, "")}`
    : `/books/${segments.replace(/^(products|watch|watches)\//, "")}`;

  return NextResponse.redirect(new URL(target, request.url), 308);
}
