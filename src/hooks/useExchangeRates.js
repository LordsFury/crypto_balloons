"use client";
import { useEffect, useState } from "react";
import {
  EXCHANGE_RATE_API_URL,
  EXCHANGE_RATE_REFRESH_INTERVAL_MS,
} from "@/config/currencyConstants";

export default function useExchangeRates() {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch(EXCHANGE_RATE_API_URL);
        const data = await res.json();
        setRates(data.rates || {});
      } catch (err) {
        console.error("Failed to fetch currency rates:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
    const interval = setInterval(fetchRates, EXCHANGE_RATE_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return { rates, loading };
}
