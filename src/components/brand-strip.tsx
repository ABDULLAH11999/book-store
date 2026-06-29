export function BrandStrip() {
  const items = [
    "\u0642\u0631\u0622\u0646 \u0648 \u0633\u0646\u062a \u06a9\u06d2 \u0627\u0646\u0648\u0627\u0631",
    "\u0627\u0645\u0627\u0646\u062a \u06a9\u06d2 \u0633\u0627\u062a\u06be",
    "\u0634\u0631\u06cc\u0639\u062a \u06a9\u06d2 \u0627\u0635\u0648\u0644",
    "\u0627\u0645\u06cc\u062f \u0648 \u0633\u0627\u062f\u06af\u06cc",
    "\u062e\u0648\u0628\u0635\u0648\u0631\u062a \u0627\u062e\u0644\u0627\u0642"
  ];
  const repeated = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-white/10 bg-[#f6efe0] py-4">
      <div className="marquee gap-10 whitespace-nowrap text-sm font-semibold tracking-[0.08em] text-[#6b4b2b]">
        {repeated.map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}
