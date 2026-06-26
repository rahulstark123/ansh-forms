import currencyCodes from "currency-codes";
import getSymbolFromCurrency from "currency-symbol-map";

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

/** ISO 4217 currencies sorted by code (open-source: currency-codes + currency-symbol-map). */
export const CURRENCY_OPTIONS: CurrencyOption[] = currencyCodes
  .codes()
  .map((code) => {
    const entry = currencyCodes.code(code);
    const name = entry?.currency ?? code;
    const symbol = getSymbolFromCurrency(code) ?? code;
    return { code, name, symbol };
  })
  .sort((a, b) => a.code.localeCompare(b.code));

export const DEFAULT_CURRENCY_CODE = "INR";

export function getCurrencyByCode(code: string | undefined): CurrencyOption {
  const normalized = (code || DEFAULT_CURRENCY_CODE).toUpperCase();
  const found = CURRENCY_OPTIONS.find((c) => c.code === normalized);
  if (found) return found;
  return {
    code: normalized,
    name: normalized,
    symbol: getSymbolFromCurrency(normalized) ?? normalized,
  };
}

export function getCurrencySymbol(code: string | undefined, fallback = "₹"): string {
  if (!code) return fallback;
  return getSymbolFromCurrency(code.toUpperCase()) ?? fallback;
}

export function formatCurrencyLabel(option: CurrencyOption): string {
  const sym = option.symbol !== option.code ? ` (${option.symbol})` : "";
  return `${option.code} — ${option.name}${sym}`;
}
