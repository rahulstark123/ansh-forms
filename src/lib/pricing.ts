/** Pro plan monthly pricing by region */
export const PRO_PRICING = {
  IN: { amount: 399, currency: "INR" as const, display: "₹399" },
  INT: { amount: 5, currency: "USD" as const, display: "$5" },
} as const;

export function getProPricing(isIndia: boolean) {
  return isIndia ? PRO_PRICING.IN : PRO_PRICING.INT;
}

/** Razorpay expects amount in smallest currency unit (paise / cents). */
export function toRazorpayAmount(amount: number, currency: "INR" | "USD") {
  return currency === "INR" ? Math.round(amount * 100) : Math.round(amount * 100);
}
