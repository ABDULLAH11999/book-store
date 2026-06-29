export const revalidate = 300;

const returnPoints = [
  {
    title: "Verified Issues",
    text: "We accept return requests for verified defects, wrong items, or damage caused during shipping."
  },
  {
    title: "Quick Review",
    text: "Please share order details and clear photos as soon as possible so our team can review the case quickly."
  },
  {
    title: "Fair Resolution",
    text: "When the issue is on our side, we arrange a replacement or return process and cover the related shipping charges."
  },
  {
    title: "Customer Responsibility",
    text: "If an exchange is requested for a personal reason, the applicable delivery charges are handled by the customer."
  }
];

export default function ReturnPolicyPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <p className="text-sm uppercase tracking-[0.4em] text-gold">Returns</p>
        <h1 className="mt-4 font-heading text-4xl leading-tight text-ink sm:text-5xl">Return & Exchange Policy</h1>
        <p className="mt-6 max-w-4xl text-lg leading-8 text-black/70">
          IslamicPlay keeps returns simple and fair. We review every request carefully so customers receive a respectful and transparent resolution.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {returnPoints.map((point, index) => (
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
