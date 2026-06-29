export const revalidate = 300;

const termsPoints = [
  {
    title: "Product Accuracy",
    text: "We try to keep product photos, titles, and descriptions accurate and aligned with the item being offered."
  },
  {
    title: "Pricing",
    text: "Prices and promotional offers may change without notice, but the final checkout amount is always shown before order submission."
  },
  {
    title: "Support",
    text: "Customers may contact us about orders, shipping, or policy questions through the listed support channels."
  },
  {
    title: "Fair Usage",
    text: "Orders placed through the store should be made with genuine intent to buy and receive delivery."
  }
];

export default function TermsConditionsPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <p className="text-sm uppercase tracking-[0.4em] text-gold">Terms</p>
        <h1 className="mt-4 font-heading text-4xl leading-tight text-ink sm:text-5xl">Terms & Conditions</h1>
        <p className="mt-6 max-w-4xl text-lg leading-8 text-black/70">
          These terms help keep the IslamicPlay store transparent, fair, and easy to use for every customer.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {termsPoints.map((point, index) => (
            <article key={point.title} className="rounded-[1.75rem] border border-black/10 bg-[#fbfaf7] p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/40">Point {index + 1}</p>
              <h2 className="mt-3 font-heading text-2xl text-ink">{point.title}</h2>
              <p className="mt-3 text-sm leading-7 text-black/65">{point.text}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
