import { useState, useEffect, useRef, useCallback } from "react";
import { parseRange } from "@/utils/balloonCalculations";
import { MAX_BALLOONS_DESKTOP } from "@/config/balloonConstants";

// Derive WebSocket URL from the REST URL (http→ws, https→wss)
function getWsUrl() {
  const base = process.env.NEXT_PUBLIC_CRYPTO_DATA_URL || "";
  return base.replace(/^http/, "ws");
}

/**
 * Custom hook for fetching and managing crypto ticker data.
 * Primary: WebSocket (instant initial snapshot + live pushes every 5 min).
 * Fallback: HTTP fetch if WebSocket fails to connect.
 */
export const useCryptoData = (range) => {
  const [allCoins, setAllCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Preserve the initial random shuffle order across live updates.
  // On first data arrival we establish a shuffled order of IDs;
  // subsequent updates merge new values into that same order.
  const orderRef = useRef(null);        // string[] of coin IDs in display order
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  // Merge incoming tickers into the current order (or create initial order)
  const applyTickers = useCallback((tickers) => {
    if (!tickers?.length) return;

    const tickerMap = new Map(tickers.map((t) => [t.id, t]));

    if (!orderRef.current) {
      // First arrival: shuffle to randomise balloon placement
      const shuffled = [...tickers].sort(() => Math.random() - 0.5);
      orderRef.current = shuffled.map((t) => t.id);
      setAllCoins(shuffled);
    } else {
      // Subsequent: merge new data into existing order (no position jumps)
      const updated = orderRef.current
        .map((id) => tickerMap.get(id))
        .filter(Boolean);
      // Append any brand-new coins at the end
      for (const t of tickers) {
        if (!orderRef.current.includes(t.id)) {
          updated.push(t);
          orderRef.current.push(t.id);
        }
      }
      setAllCoins(updated);
    }

    setIsLoading(false);
    setError(null);
  }, []);

  // WebSocket connection with auto-reconnect
  useEffect(() => {
    let unmounted = false;

    async function fetchViaHttp() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_CRYPTO_DATA_URL}/api/crypto/tickers`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!unmounted) applyTickers(data.tickers);
      } catch (err) {
        console.error("HTTP fetch failed:", err);
        if (!orderRef.current) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    }

    function connect() {
      if (unmounted) return;
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const tickers = msg.tickers || msg;
          if (Array.isArray(tickers) && !unmounted) applyTickers(tickers);
        } catch { /* ignore malformed frames */ }
      };

      ws.onclose = () => {
        if (unmounted) return;
        reconnectTimer.current = setTimeout(connect, 3000);
      };
    }

    // Fire HTTP immediately for fastest initial render, and open WS for live updates.
    // Whichever delivers data first wins; both are safe to call applyTickers.
    fetchViaHttp();
    connect();

    return () => {
      unmounted = true;
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [applyTickers]);

  // Filter coins when range or allCoins change
  useEffect(() => {
    if (!allCoins.length) return;

    const [min, max] = parseRange(range);
    
    const filtered = allCoins
      .filter(c => c.rank >= min && c.rank <= max)
      .slice(0, MAX_BALLOONS_DESKTOP);
    
    setFilteredCoins(filtered);
  }, [range, allCoins]);

  return {
    allCoins,
    filteredCoins,
    isLoading,
    error
  };
};
