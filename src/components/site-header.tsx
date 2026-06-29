"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { BRAND_DARK_GREEN, BRAND_LOGO_PATH, BRAND_NAME, BRAND_TAGLINE } from "@/lib/branding";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Catalog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

type BusinessInfo = {
  whatsappNumber?: string;
  contactPhone?: string;
};

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [business, setBusiness] = useState<BusinessInfo>({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/settings/business")
      .then((response) => response.json())
      .then((data) => setBusiness(data))
      .catch(() => undefined);
  }, []);

  const whatsappNumber = business.whatsappNumber || business.contactPhone || "";

  return (
    <header className="sticky top-0 z-50 bg-[color:var(--brand-dark-green)] text-white shadow-sm" style={{ ["--brand-dark-green" as never]: BRAND_DARK_GREEN }}>
      <div className="border-b border-white/10 py-2 text-center text-sm font-semibold tracking-wide text-white">
        Whatsapp : {whatsappNumber || "Not set"}
      </div>
      <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8 ${scrolled ? "backdrop-blur-xl" : ""}`}>
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={BRAND_LOGO_PATH}
            alt={`${BRAND_NAME} logo`}
            width={70}
            height={70}
            className="h-11 w-11 shrink-0 object-contain sm:h-12 sm:w-12"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-white transition hover:text-white/75">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/checkout" className="relative rounded-full border border-white/20 p-3 text-white transition hover:border-white hover:text-white">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--brand-dark-green)]" style={{ ["--brand-dark-green" as never]: BRAND_DARK_GREEN }}>
                {count}
              </span>
            )}
          </Link>
          <button className="text-white md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[color:var(--brand-dark-green)] px-4 py-4 text-white md:hidden" style={{ ["--brand-dark-green" as never]: BRAND_DARK_GREEN }}>
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-base font-medium text-white" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
