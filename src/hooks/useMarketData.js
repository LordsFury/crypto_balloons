import { useState, useEffect, useRef, useCallback } from "react";
import { parseRange } from "@/utils/balloonCalculations";
import { MAX_BALLOONS_DESKTOP } from "@/config/balloonConstants";

const STOCK_POLL_INTERVAL_MS = 30000;

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_CRYPTO_DATA_URL || "";
}

function getWsUrl() {
  return getApiBaseUrl().replace(/^http/, "ws");
}

function normalizeTicker(ticker, marketType) {
  const symbol = String(ticker?.symbol || ticker?.ticker || ticker?.id || "").toUpperCase();
  const id = String(ticker?.id || ticker?.symbol || ticker?.ticker || symbol).toLowerCase();
  const fallbackRank = Number.isFinite(Number(ticker?.rank)) ? Number(ticker.rank) : null;

  if (marketType === "stocks") {
    return {
      ...ticker,
      id,
      symbol,
      name: ticker?.name || ticker?.longName || ticker?.shortName || symbol,
      image: ticker?.image || ticker?.logo || ticker?.logo_url || null,
      logo: ticker?.logo || ticker?.logo_url || ticker?.image || null,
      logo_url: ticker?.logo_url || ticker?.logo || ticker?.image || null,
      price: ticker?.price ?? null,
      market_cap: ticker?.market_cap ?? null,
      volume: ticker?.volume ?? null,
      rank: fallbackRank,
      percent_change_1h: ticker?.percent_change_1h ?? null,
      percent_change_24h: ticker?.percent_change_24h ?? ticker?.change_24h ?? null,
      percent_change_7d: ticker?.percent_change_7d ?? ticker?.change_7d ?? null,
      percent_change_30d: ticker?.percent_change_30d ?? ticker?.change_30d ?? null,
      percent_change_1y: ticker?.percent_change_1y ?? ticker?.change_1y ?? null,
      logo_color: ticker?.logo_color ?? null,
    };
  }

  return {
    ...ticker,
    id,
    symbol: String(ticker?.symbol || symbol).toUpperCase(),
  };
}

function normalizeTickers(tickers, marketType) {
  const normalized = (Array.isArray(tickers) ? tickers : [])
    .map((ticker) => normalizeTicker(ticker, marketType))
    .filter((ticker) => ticker.id);

  if (marketType === "stocks") {
    return normalized.map((item, index) => ({
      ...item,
      rank: Number.isFinite(Number(item.rank)) ? Number(item.rank) : index + 1,
    }));
  }

  return normalized;
}

export const useMarketData = (range, marketType = "crypto") => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const pollingTimer = useRef(null);
  const sessionRef = useRef(0);

  const applyTickers = useCallback((tickers) => {
    const normalized = normalizeTickers(tickers, marketType);
    if (!normalized.length) return;

    if (!orderRef.current) {
      const initial = marketType === "crypto"
        ? [...normalized].sort(() => Math.random() - 0.5)
        : normalized;
      orderRef.current = initial.map((item) => item.id);
      setAllItems(initial);
    } else {
      const tickerMap = new Map(normalized.map((item) => [item.id, item]));
      const updated = orderRef.current
        .map((id) => tickerMap.get(id))
        .filter(Boolean);

      for (const item of normalized) {
        if (!orderRef.current.includes(item.id)) {
          updated.push(item);
          orderRef.current.push(item.id);
        }
      }

      setAllItems(updated);
    }

    setIsLoading(false);
    setError(null);
  }, [marketType]);

  useEffect(() => {
    const sessionId = ++sessionRef.current;
    orderRef.current = null;
    setIsLoading(true);
    setError(null);

    let unmounted = false;

    const fetchCryptoHttp = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/crypto/tickers`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!unmounted && sessionRef.current === sessionId) applyTickers(data.tickers);
      } catch (err) {
        if (!unmounted && sessionRef.current === sessionId) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    const fetchStocksHttp = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/markets?type=stocks&page=1&limit=500`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!unmounted && sessionRef.current === sessionId) applyTickers(data.tickers);
      } catch (err) {
        if (!unmounted && sessionRef.current === sessionId) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    const connectCrypto = () => {
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const tickers = msg.tickers || msg;
          if (Array.isArray(tickers) && !unmounted && sessionRef.current === sessionId) applyTickers(tickers);
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = () => {
        if (unmounted) return;
        reconnectTimer.current = setTimeout(connectCrypto, 3000);
      };
    };

    const startStocksPolling = () => {
      fetchStocksHttp();
      pollingTimer.current = setInterval(fetchStocksHttp, STOCK_POLL_INTERVAL_MS);
    };

    if (marketType === "stocks") {
      startStocksPolling();
    } else {
      fetchCryptoHttp();
      connectCrypto();
    }

    return () => {
      unmounted = true;
      clearTimeout(reconnectTimer.current);
      clearInterval(pollingTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [applyTickers, marketType]);

  useEffect(() => {
    if (!allItems.length) return;

    const [min, max] = parseRange(range);
    const filtered = allItems
      .filter((item) => item.rank >= min && item.rank <= max)
      .slice(0, MAX_BALLOONS_DESKTOP);

    setFilteredItems(filtered);
  }, [range, allItems]);

  return {
    allItems,
    filteredItems,
    isLoading,
    error,
  };
};