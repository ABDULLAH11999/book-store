export type BundleTier = {
  quantity: number;
  label: string;
  badge: string;
  discountPercent: number;
};

export const bundleTiers: BundleTier[] = [
  {
    quantity: 1,
    label: "Buy 1",
    badge: "Full price",
    discountPercent: 0
  },
  {
    quantity: 2,
    label: "Buy 2",
    badge: "Save 10%",
    discountPercent: 10
  },
  {
    quantity: 3,
    label: "Buy 3+",
    badge: "Save 15%",
    discountPercent: 15
  }
];

export type BundlePricing = {
  quantity: number;
  tier: BundleTier;
  unitPrice: number;
  regularTotal: number;
  discountedTotal: number;
  savings: number;
};

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getBundleTier(quantity: number) {
  const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));

  if (normalizedQuantity >= 3) return bundleTiers[2];
  if (normalizedQuantity === 2) return bundleTiers[1];
  return bundleTiers[0];
}

export function getBundlePricing(quantity: number, unitPrice: number): BundlePricing {
  const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const normalizedUnitPrice = Number(unitPrice) || 0;
  const tier = getBundleTier(normalizedQuantity);
  const regularTotal = roundCurrency(normalizedUnitPrice * normalizedQuantity);
  const discountedTotal = roundCurrency(regularTotal * (1 - tier.discountPercent / 100));

  return {
    quantity: normalizedQuantity,
    tier,
    unitPrice: normalizedUnitPrice,
    regularTotal,
    discountedTotal,
    savings: roundCurrency(regularTotal - discountedTotal)
  };
}
