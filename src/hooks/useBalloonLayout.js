import { useState, useEffect, useCallback, useRef } from "react";
import { 
  calculateGridLayout, 
  createSizeMapper,
  pickBalloonColor 
} from "@/utils/balloonCalculations";
import { 
  DEFAULT_DURATION, 
  DEFAULT_DRIFT, 
  DEFAULT_FLOAT_DISTANCE,
  TIME_PERIOD_MAP,
  MOBILE_BREAKPOINT 
} from "@/config/balloonConstants";

// Deterministic pseudo-random so positions stay stable across resizes
const seededRandom = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Custom hook for managing balloon layout and positioning.
 * Screen dimensions are tracked as state so a resize automatically
 * triggers a relayout (balloons spring to their new positions).
 */
export const useBalloonLayout = (coins, time) => {
  const [balloons, setBalloons] = useState([]);
  const layoutRef = useRef([]);
  const [screenDims, setScreenDims] = useState({ w: 0, h: 0 });

  // Ref so generateLayout always reads the latest time without changing identity
  const timeRef = useRef(time);
  timeRef.current = time;

  // Track screen dimensions with debounced resize
  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => setScreenDims({ w: window.innerWidth, h: window.innerHeight });
    update();

    let timer;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(update, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Generate complete layout.
  // screenDims in deps means resizing the window gives generateLayout
  // a new identity, which triggers Main's effect to call it again.
  const generateLayout = useCallback((coinsList) => {
    if (!coinsList.length) return;

    const W = screenDims.w;
    const H = screenDims.h;
    if (!W || !H) return;

    const timeKey = TIME_PERIOD_MAP[timeRef.current];
    const sizeMapper = createSizeMapper(coinsList, timeKey);
    
    const { cols, spacingX, spacingY } = calculateGridLayout(
      coinsList.length,
      W,
      H
    );

    const result = coinsList.map((coin, i) => {
      const percent = Math.abs(Number(coin[`percent_change_${timeKey}`])) || 0;
      const total = coinsList.length;
      const size = sizeMapper(percent, coin);
      
      // Base grid position
      const baseX = (i % cols) * spacingX + spacingX / 2;
      const baseY = Math.floor(i / cols) * spacingY + spacingY / 2;
      
      // Randomization — deterministic per index so resizes don't cause random jumps
      const sizeRatio = (size - 90) / (300 - 90);
      const randomFactor = 0.8 - (sizeRatio * 0.5);
      
      const randomOffsetX = (seededRandom(i * 2) - 0.5) * spacingX * randomFactor;
      const randomOffsetY = (seededRandom(i * 2 + 1) - 0.5) * spacingY * randomFactor;
      
      // Clamp to screen — use tighter margin on mobile sides only
      const isMobile = W < MOBILE_BREAKPOINT;
      const sideMargin = isMobile ? size * 0.15 : size / 2;
      const vertMargin = size / 2;
      const cx = Math.max(sideMargin, Math.min(W - sideMargin, baseX + randomOffsetX));
      const cy = Math.max(vertMargin, Math.min(H - vertMargin, baseY + randomOffsetY));

      return {
        id: coin.id,
        coin,
        size,
        depth: 0.3 + (i / total) * 0.7,
        cx,
        cy,
        color: pickBalloonColor(coin, i),
        duration: DEFAULT_DURATION,
        drift: DEFAULT_DRIFT,
        floatDistance: DEFAULT_FLOAT_DISTANCE,
        delay: (i % 6) * 0.4,
      };
    });

    layoutRef.current = result;
    setBalloons(result);
  }, [screenDims]);

  // Update only sizes when time changes
  const updateSizes = useCallback((coinsList) => {
    if (!layoutRef.current.length) return;

    const timeKey = TIME_PERIOD_MAP[time];
    const sizeMapper = createSizeMapper(coinsList, timeKey);

    layoutRef.current.forEach(balloon => {
      const percent = Math.abs(
        Number(balloon.coin[`percent_change_${timeKey}`]) || 0
      );
      balloon.size = sizeMapper(percent, balloon.coin);
    });

    setBalloons([...layoutRef.current]);
  }, [time]);

  // Merge live coin data into existing balloons without regenerating layout.
  // Updates each balloon's coin reference and recalculates sizes so springs
  // animate smoothly to the new values.
  const updateCoinData = useCallback((coinsList) => {
    if (!layoutRef.current.length || !coinsList.length) return;

    const coinMap = new Map(coinsList.map(c => [c.id, c]));
    const timeKey = TIME_PERIOD_MAP[time];
    const sizeMapper = createSizeMapper(coinsList, timeKey);

    let changed = false;
    layoutRef.current.forEach(balloon => {
      const fresh = coinMap.get(balloon.id);
      if (!fresh) return;
      // Always update coin reference so percent/price display refreshes
      if (fresh !== balloon.coin) changed = true;
      balloon.coin = fresh;
      const percent = Math.abs(Number(fresh[`percent_change_${timeKey}`]) || 0);
      balloon.size = sizeMapper(percent, fresh);
    });

    if (changed) setBalloons([...layoutRef.current]);
  }, [time]);

  return {
    balloons,
    generateLayout,
    updateSizes,
    updateCoinData,
    screenDimensions: screenDims
  };
};
