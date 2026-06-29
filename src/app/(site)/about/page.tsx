export const revalidate = 300;

const highlights = [
  {
    title: "Affordable Value",
    text: "We focus on giving people meaningful Islamic books and Quran editions at prices that stay accessible."
  },
  {
    title: "Trust First",
    text: "Our product pages, policies, and support flow are designed to keep the buying experience transparent and respectful."
  },
  {
    title: "Careful Service",
    text: "From order processing to delivery updates, we aim to keep every step clear and dependable."
  }
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <p className="text-sm uppercase tracking-[0.4em] text-gold">About IslamicPlay</p>
        <h1 className="mt-4 max-w-4xl font-heading text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
          A calm, affordable storefront built around Islamic values, helpful policies, and clear presentation.
        </h1>
        <p className="mt-6 max-w-4xl text-lg leading-8 text-black/70">
          IslamicPlay is built to present books and Quran products with respect, simplicity, and value. We want visitors to feel confident that they are shopping from a store that is thoughtful, transparent, and easy to trust.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-[2rem] border border-black/10 bg-[#fbfaf7] p-6 shadow-sm">
              <h2 className="font-heading text-2xl text-ink">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-black/65">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm md:grid-cols-2">
          <p className="text-base leading-7 text-black/70">
            We keep shipping, returns, and support policies easy to read so customers know what to expect before placing an order.
          </p>
          <p className="text-base leading-7 text-black/70">
            Our goal is to balance beautiful design with speed, so the storefront feels polished on mobile and desktop without losing clarity.
          </p>
        </div>
      </div>
    </div>
  );
}
