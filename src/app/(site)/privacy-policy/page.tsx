export const revalidate = 300;

const privacyPoints = [
  {
    title: "Minimal Data Use",
    text: "We collect only the information needed to process orders, provide support, and keep records accurate."
  },
  {
    title: "Order Communication",
    text: "Phone numbers and email addresses are used for order updates, delivery coordination, and customer service."
  },
  {
    title: "Secure Handling",
    text: "We aim to keep customer details protected and do not sell personal data to third parties."
  },
  {
    title: "Store Improvement",
    text: "Anonymous usage signals may help us improve speed, layout, and product presentation across the storefront."
  }
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <p className="text-sm uppercase tracking-[0.4em] text-gold">Privacy</p>
        <h1 className="mt-4 font-heading text-4xl leading-tight text-ink sm:text-5xl">Privacy Policy</h1>
        <p className="mt-6 max-w-4xl text-lg leading-8 text-black/70">
          IslamicPlay respects customer privacy and uses the information you share only to complete orders and provide a smoother shopping experience.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {privacyPoints.map((point, index) => (
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
