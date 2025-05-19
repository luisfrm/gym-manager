export type Currency = "USD" | "VES";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  VES: "Bs.",
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: "Dólares",
  VES: "Bolívares",
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formattedAmount}`;
};

export const getCurrencyOptions = () => {
  return Object.entries(CURRENCY_NAMES).map(([value, label]) => ({
    value: value as Currency,
    label: `${value} - ${label}`,
  }));
}; 