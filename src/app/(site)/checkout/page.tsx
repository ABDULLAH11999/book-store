"use client";

import { CheckoutForm } from "@/components/checkout-form";
import { OrderSummary } from "@/components/order-summary";
import { useCart } from "@/components/cart-context";

export default function CheckoutPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10 lg:px-8 lg:py-12">
      <div className="min-w-0">
        <p className="text-sm uppercase tracking-[0.4em] text-gold">Checkout</p>
        <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl lg:text-5xl">Complete Your Order</h1>
        <p className="mt-3 max-w-2xl text-sm text-black/60 sm:text-base">Cash on delivery only. We'll confirm your order by phone before dispatch.</p>
        <div className="mt-6 sm:mt-8">
          <CheckoutForm />
        </div>
      </div>
      <OrderSummary
        items={items}
        subtotal={subtotal}
        onUpdateQuantity={(index, quantity) => {
          const item = items[index];
          if (!item) return;
          if (quantity <= 0) {
            removeItem(item.productId);
            return;
          }
          updateQuantity(item.productId, quantity);
        }}
        onRemoveItem={(index) => {
          const item = items[index];
          if (item) removeItem(item.productId);
        }}
      />
    </div>
  );
}
