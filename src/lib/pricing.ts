export function convertUsdToLocalPrice(
  amountUsd: number,
  usdExchangeRate: number | null | undefined,
) {
  const rate = usdExchangeRate && usdExchangeRate > 0 ? usdExchangeRate : 1;
  return amountUsd * rate;
}

export function formatMoney(amount: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: currencyCode === "XOF" || currencyCode === "XAF" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
}

export function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}
