"use client";

import { motion } from "framer-motion";

const highlights = [
  {
    title: "پاکیزہ انتخاب",
    text: "A calm storefront built to present products with clarity and visual balance."
  },
  {
    title: "اعتماد",
    text: "Simple, transparent content that helps visitors feel confident while browsing."
  },
  {
    title: "تیز رفتار",
    text: "Static imagery and lighter sections reduce motion overhead for a snappier page."
  },
  {
    title: "اسلامیPlay",
    text: "A branded presentation that keeps the identity aligned across the storefront."
  }
];

export function BrandShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-8 lg:py-16">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {highlights.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ y: 28, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.05)]"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-black/45">{item.title}</p>
            <p className="mt-3 text-sm leading-7 text-black/65">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
