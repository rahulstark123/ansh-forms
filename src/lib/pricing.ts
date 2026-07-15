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
  if (currency === "INR") {
    // 399 + 18% GST = 470.82 INR. Rounded to 471 INR = 47100 paise
    const amountWithGst = Math.round(amount * 1.18);
    return amountWithGst * 100;
  }
  return Math.round(amount * 100);
}
