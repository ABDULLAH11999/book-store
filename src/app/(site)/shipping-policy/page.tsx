"use client";

import { useEffect, useState } from "react";

type BusinessInfo = {
  contactPhone?: string;
  contactEmail?: string;
  shopAddress?: string;
  whatsappNumber?: string;
};

export default function ShippingPolicyPage() {
  const [business, setBusiness] = useState<BusinessInfo>({
    contactPhone: "",
    contactEmail: "",
    shopAddress: "",
    whatsappNumber: ""
  });

  useEffect(() => {
    fetch("/api/settings/business")
      .then((response) => response.json())
      .then((data) => setBusiness(data))
      .catch(() => undefined);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
      <p className="text-sm uppercase tracking-[0.4em] text-gold">Shipping</p>
      <h1 className="mt-3 font-heading text-4xl sm:text-5xl">Shipping Policy</h1>
      <div className="prose prose-lg mt-8 max-w-none">
        <p>
          Thank you for visiting our Islamic Play Store. We are committed to delivering your orders in a timely and secure manner across Pakistan.
        </p>
        <h2>1. Order Processing Time</h2>
        <p>All orders are processed within 3–5 business days. Orders are not shipped or delivered on weekends or public holidays.</p>
        <p>If we experience a high volume of orders, shipments may be delayed slightly. We will notify you in case of significant delays.</p>
        <h2>2. Shipping Charges</h2>
        <p>Shipping charges for your order will be calculated and displayed at checkout. We may offer free delivery on selected items or promotional offers.</p>
        <h2>3. Delivery Time</h2>
        <p>Estimated delivery time depends on your location:</p>
        <ul>
          <li>Major cities: 2–4 business days</li>
          <li>Other areas: 3–7 business days</li>
        </ul>
        <p>Please note that delivery times are estimates and may vary due to unforeseen circumstances.</p>
        <h2>4. Delivery Partners</h2>
        <p>We use trusted courier services operating within Pakistan to ensure safe delivery of your products.</p>
        <h2>5. Order Tracking</h2>
        <p>Once your order has been shipped, you will receive a tracking ID via SMS or email to monitor your delivery status.</p>
        <h2>6. Cash on Delivery (COD)</h2>
        <p>We offer Cash on Delivery service across most areas in Pakistan. Please ensure someone is available to receive and pay for the order.</p>
        <h2>7. Failed Delivery Attempts</h2>
        <p>If delivery fails due to incorrect address or unavailability of the customer, additional charges may apply for re-delivery.</p>
        <h2>8. Damaged or Lost Packages</h2>
        <p>If your order arrives damaged or is lost during shipping, please contact us within 48 hours with proof (images/videos), and we will assist you accordingly.</p>
        <h2>9. Contact Us</h2>
        <p>If you have any questions about your order or shipping, please contact us:</p>
        <p>Email: {business.contactEmail || "Email not set"}</p>
        <p>Phone/WhatsApp: {business.whatsappNumber || business.contactPhone || "Phone not set"}</p>
        <p>We strive to provide a reliable and Shariah-compliant service experience to our valued customers.</p>
      </div>
    </div>
  );
}
