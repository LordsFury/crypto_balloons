import { useState, useEffect, useRef } from "react";
import { parseRange } from "@/utils/balloonCalculations";
import { MOBILE_BREAKPOINT, MAX_BALLOONS_MOBILE, MAX_BALLOONS_DESKTOP } from "@/config/balloonConstants";

/**
 * Custom hook for fetching and managing crypto ticker data
 * @param {string} range - Current range filter
 * @returns {Object} - Coins data and loading state
 */
export const useCryptoData = (range) => {
  const [allCoins, setAllCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_CRYPTO_DATA_URL}/api/crypto/tickers`
        );
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        const shuffled = [...data.tickers].sort(() => Math.random() - 0.5);
        setAllCoins(shuffled);
      } catch (err) {
        console.error("Failed to fetch crypto data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter coins when range or allCoins change
  useEffect(() => {
    if (!allCoins.length) return;

    const isMobile = typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
    const maxBalloons = isMobile ? MAX_BALLOONS_MOBILE : MAX_BALLOONS_DESKTOP;
    const [min, max] = parseRange(range);
    
    const filtered = allCoins
      .filter(c => c.rank >= min && c.rank <= max)
      .slice(0, maxBalloons);
    
    setFilteredCoins(filtered);
  }, [range, allCoins]);

  return {
    allCoins,
    filteredCoins,
    isLoading,
    error
  };
};
