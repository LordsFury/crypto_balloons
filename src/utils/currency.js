import {
  CURRENCY_OPTIONS,
  DEFAULT_CURRENCY,
  FLAG_ICON_BASE_URL,
} from "@/config/currencyConstants";

const CURRENCY_OPTIONS_BY_VALUE = Object.fromEntries(
  CURRENCY_OPTIONS.map((option) => [option.value, option])
);

function removeTrailingSlash(value) {
  return value.replace(/\/$/, "");
}

export function getCurrencyOption(currencyCode) {
  return CURRENCY_OPTIONS_BY_VALUE[currencyCode] ?? CURRENCY_OPTIONS_BY_VALUE[DEFAULT_CURRENCY];
}

export function getCurrencySymbol(currencyCode) {
  return getCurrencyOption(currencyCode).symbol;
}

export function getResolvedCurrencyCode(currencyCode, rates = {}) {
  if (currencyCode === DEFAULT_CURRENCY) {
    return DEFAULT_CURRENCY;
  }

  return rates[currencyCode] ? currencyCode : DEFAULT_CURRENCY;
}

export function getCurrencyFlagSrc(countryCode) {
  if (!FLAG_ICON_BASE_URL || !countryCode || countryCode.length !== 2) {
    return "";
  }

  return `${removeTrailingSlash(FLAG_ICON_BASE_URL)}/${countryCode.toLowerCase()}.png`;
}

export function convertUsdAmount(usdValue, currencyCode, rates = {}) {
  const numericValue = Number(usdValue);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  const resolvedCurrencyCode = getResolvedCurrencyCode(currencyCode, rates);

  if (resolvedCurrencyCode === DEFAULT_CURRENCY) {
    return numericValue;
  }

  return numericValue * rates[resolvedCurrencyCode];
}

export function formatCurrencyAmount(usdValue, currencyCode, rates = {}) {
  const resolvedCurrencyCode = getResolvedCurrencyCode(currencyCode, rates);
  const convertedValue = convertUsdAmount(usdValue, resolvedCurrencyCode, rates);
  const currencySymbol = getCurrencySymbol(resolvedCurrencyCode);

  if (!convertedValue) {
    return `${currencySymbol} 0.00`;
  }

  if (convertedValue < 0.01) {
    return `${currencySymbol} ${convertedValue.toFixed(6)}`;
  }

  if (convertedValue < 1) {
    return `${currencySymbol} ${convertedValue.toFixed(4)}`;
  }

  return `${currencySymbol} ${convertedValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}