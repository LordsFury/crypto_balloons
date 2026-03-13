export const DEFAULT_CURRENCY = "USD";

export const EXCHANGE_RATE_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

export const DEFAULT_EXCHANGE_RATE_API_URL = "https://open.er-api.com/v6/latest/USD";

export const DEFAULT_FLAG_ICON_BASE_URL = "https://flagcdn.com/w40";

export const EXCHANGE_RATE_API_URL =
  process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_URL ?? DEFAULT_EXCHANGE_RATE_API_URL;

export const FLAG_ICON_BASE_URL =
  process.env.NEXT_PUBLIC_FLAG_ICON_BASE_URL ?? DEFAULT_FLAG_ICON_BASE_URL;

export const CURRENCY_OPTIONS = Object.freeze([
  { value: "USD", label: "US Dollar", symbol: "$", country: "US" },
  { value: "EUR", label: "Euro", symbol: "€", country: "EU" },
  { value: "GBP", label: "British Pound", symbol: "£", country: "GB" },
  { value: "PKR", label: "Pakistani Rupee", symbol: "₨", country: "PK" },
  { value: "INR", label: "Indian Rupee", symbol: "₹", country: "IN" },
  { value: "JPY", label: "Japanese Yen", symbol: "¥", country: "JP" },
  { value: "CNY", label: "Chinese Yuan", symbol: "¥", country: "CN" },
  { value: "CAD", label: "Canadian Dollar", symbol: "C$", country: "CA" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$", country: "AU" },
  { value: "CHF", label: "Swiss Franc", symbol: "CHF", country: "CH" },
  { value: "AED", label: "UAE Dirham", symbol: "د.إ", country: "AE" },
  { value: "SAR", label: "Saudi Riyal", symbol: "﷼", country: "SA" },
  { value: "TRY", label: "Turkish Lira", symbol: "₺", country: "TR" },
  { value: "ZAR", label: "South African Rand", symbol: "R", country: "ZA" },
]);