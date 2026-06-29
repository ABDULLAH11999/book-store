export function BrandStrip() {
  const items = [
    "\u0642\u0631\u0622\u0646 \u0648 \u0633\u0646\u062a",
    "\u0627\u0633\u0644\u0627\u0645\u06cc \u0637\u0631\u0632\u0650 \u0632\u0646\u062f\u06af\u06cc",
    "\u0627\u0639\u062a\u0645\u0627\u062f \u06a9\u06d2 \u0633\u0627\u062a\u06be \u062e\u0631\u06cc\u062f\u06cc\u06ba",
    "IslamicPlay",
    "\u062e\u0648\u0628\u0635\u0648\u0631\u062a \u0627\u0646\u062a\u062e\u0627\u0628"
  ];
  const repeated = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-black/10 bg-[#f6efe0] py-4">
      <div className="marquee gap-10 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.25em] text-brown">
        {repeated.map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}
