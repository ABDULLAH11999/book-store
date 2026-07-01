import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await getSetting("businessInfo", {
    contactPhone: "",
    contactEmail: "",
    shopAddress: "",
    whatsappNumber: "",
    instagramLink: "",
    orderPlacedMessage: "",
    orderConfirmedMessage: "",
    orderCancelledMessage: ""
  });
  return NextResponse.json(business);
}
