export const revalidate = 300;

const shippingPoints = [
  {
    title: "Order Processing",
    text: "Orders are processed within 3 to 5 business days. We do not ship on weekends or public holidays."
  },
  {
    title: "Shipping Charges",
    text: "Delivery charges are shown at checkout, and promotional free delivery may be offered on selected items."
  },
  {
    title: "Estimated Delivery",
    text: "Major cities usually receive parcels in 2 to 4 business days, while other areas may take 3 to 7 business days."
  },
  {
    title: "Trusted Couriers",
    text: "We use reliable courier partners operating within Pakistan so parcels reach customers safely."
  },
  {
    title: "Order Tracking",
    text: "A tracking ID is shared by SMS or email after dispatch so customers can follow the shipment progress."
  },
  {
    title: "Cash on Delivery",
    text: "COD is available in most supported areas across Pakistan, making checkout simple and familiar for customers."
  },
  {
    title: "Delivery Issues",
    text: "If a delivery fails because of an incorrect address or unavailability, re-delivery charges may apply."
  },
  {
    title: "Damage or Loss",
    text: "If a parcel is damaged or lost, contact us within 48 hours with proof so we can review and assist quickly."
  },
  {
    title: "Customer Support",
    text: "We keep communication open through WhatsApp, phone, and email so shipping questions are answered clearly."
  }
];

export default function ShippingPolicyPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <p className="text-sm uppercase tracking-[0.4em] text-gold">Shipping</p>
        <h1 className="mt-4 font-heading text-4xl leading-tight text-ink sm:text-5xl">Shipping Policy</h1>
        <p className="mt-6 max-w-4xl text-lg leading-8 text-black/70">
          Thank you for visiting IslamicPlay. We keep our shipping process clear, timely, and easy to understand so customers know what to expect from checkout to delivery.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shippingPoints.map((point, index) => (
            <article key={point.title} className="rounded-[1.75rem] border border-black/10 bg-[#fbfaf7] p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/40">Point {index + 1}</p>
              <h2 className="mt-3 font-heading text-2xl text-ink">{point.title}</h2>
              <p className="mt-3 text-sm leading-7 text-black/65">{point.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-black/10 bg-ink p-6 text-white sm:p-8">
          <h2 className="font-heading text-2xl sm:text-3xl">Need help with an order?</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75">
            Our support team is available to help with delivery updates, address clarification, and order concerns in a transparent and respectful way.
          </p>
        </div>
      </div>
    </div>
  );
}
