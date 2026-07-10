import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { getSeoSettings, getSiteUrl } from "@/lib/seo";
import { BRAND_LOGO_PATH, BRAND_NAME } from "@/lib/branding";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const siteUrl = getSiteUrl(seo);
  const ogImage = seo.ogImage?.trim();
  const defaultLogoUrl = `${siteUrl}${BRAND_LOGO_PATH}`;
  const resolvedOgImage = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${siteUrl}${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}`
    : defaultLogoUrl;

  return {
    metadataBase: new URL(siteUrl),
    icons: {
      icon: BRAND_LOGO_PATH,
      apple: BRAND_LOGO_PATH
    },
    title: {
      default: seo.siteTitle || BRAND_NAME,
      template: seo.titleTemplate || `%s | ${BRAND_NAME}`
    },
    description: seo.metaDescription,
    keywords: seo.metaKeywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    alternates: {
      canonical: siteUrl
    },
    openGraph: {
      title: seo.ogTitle || seo.siteTitle || BRAND_NAME,
      description: seo.ogDescription || seo.metaDescription,
      url: siteUrl,
      siteName: seo.siteTitle || BRAND_NAME,
      images: [
        {
          url: resolvedOgImage,
          width: 1200,
          height: 630,
          alt: seo.ogTitle || seo.siteTitle || BRAND_NAME
        }
      ],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle || seo.siteTitle || BRAND_NAME,
      description: seo.ogDescription || seo.metaDescription,
      images: [resolvedOgImage]
    }
  };
}

const tiktokPixelCode = `!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};


  ttq.load('D98J7HBC77UEFAL2JIH0');
  ttq.page();
}(window, document, 'ttq');`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script id="tiktok-pixel" dangerouslySetInnerHTML={{ __html: tiktokPixelCode }} />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
