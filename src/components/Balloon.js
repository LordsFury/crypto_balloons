import { useEffect, useState } from "react";

// ============= Balloon.js =============
const Balloon = ({ size, color, coin, time, onPointerDown, onPointerMove, onPointerUp }) => {
    const isLarge = size >= 200;
    const imageSize = isLarge ? 520 : 420;
    const imageX = 2000 - imageSize / 2;
    const imageY = isLarge ? 1100 : 1000;
    const symbolY = imageY - 200;
    const percentY = imageY + imageSize + 300;

    const timeMap = {
        hour: '1h',
        day: '24h',
        week: '7d',
        month: '30d',
        year: '1y',
    };

    const [displayPercent, setDisplayPercent] = useState(
        coin?.[`percent_change_${timeMap[time]}`] || 0
    );

    useEffect(() => {
        if (!coin) return;

        const targetPercent = coin[`percent_change_${timeMap[time]}`] || 0;
        const startPercent = displayPercent;
        const diff = targetPercent - startPercent;

        let startTime = null;
        const duration = 800;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startPercent + (diff * eased);

            setDisplayPercent(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [coin?.[`percent_change_${timeMap[time]}`], time]);

    const isPositive = displayPercent >= 0;
    const absPercent = Math.abs(displayPercent);

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 4001 4001"
            fill={color}
            style={{ display: "block", pointerEvents: "none" }}
        >
            <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.3" />
                </filter>
                <radialGradient id="balloonLight" cx="35%" cy="25%" r="65%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.7" />
                    <stop offset="45%" stopColor={color} stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
                </radialGradient>
                <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="18" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <style>
                {`
@keyframes glowPositive {
  0% {
    filter: drop-shadow(0 0 6px #10b981);
    opacity: 0.85;
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 22px #34d399);
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    filter: drop-shadow(0 0 6px #10b981);
    opacity: 0.85;
    transform: scale(1);
  }
}

@keyframes glowNegative {
  0% {
    filter: drop-shadow(0 0 6px #ef4444);
    opacity: 0.85;
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 22px #f87171);
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    filter: drop-shadow(0 0 6px #ef4444);
    opacity: 0.85;
    transform: scale(1);
  }
}

.strip-positive {
  animation: glowPositive 1.8s ease-in-out infinite;
  transform-origin: center;
}

.strip-negative {
  animation: glowNegative 1.8s ease-in-out infinite;
  transform-origin: center;
}
`}
            </style>


            <g
                filter="url(#softGlow)"
                style={{ pointerEvents: "auto", cursor: "grab" }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            >
                <path fillRule="evenodd" fill="rgb(61.521912%, 38.035583%, 23.535156%)" fillOpacity="1" d="M1814.41 3051.33H2000.44v30.5h-186.03c-8.39 0-15.25-6.86-15.25-15.25s6.86-15.25 15.25-15.25z" />
                <path fillRule="evenodd" fill="rgb(53.709412%, 24.705505%, 14.109802%)" fillOpacity="1" d="M1822.51 3081.83h177.93v193.17h-134.3c-24 0-43.63-19.63-43.63-43.63v-149.54z" />
                <path fillRule="evenodd" fill="rgb(24.705505%, 23.143005%, 21.946716%)" fillOpacity="1" d="M1853.39 2706.93h17.79v109.3h88.54v-12.71c0-6.99 5.72-12.71 12.71-12.71h28.01v102.51h-64.02c-45.67 0-83.03-37.36-83.03-83.03v-103.37z" />
                <path fillRule="nonzero" fill="rgb(35.693359%, 27.43988%, 20.776367%)" fillOpacity="1" d="M1824.19 2698.36l31.4 352.97h-12l-31.31-351.93 11.91-.04z" />
                <path fillRule="evenodd" fill="rgb(45.872498%, 15.281677%, 10.594177%)" fillOpacity="1" d="M1799.17 2683.21h201.27v23.72h-201.27c-6.53 0-11.86-5.34-11.86-11.86s5.33-11.86 11.86-11.86z" />
                <path className={isPositive ? "strip-positive" : "strip-negative"}
                    fill={isPositive ? "#10b981" : "#ef4444"}
                    filter={`url(#stripGlow-${coin?.id})`} d="M1876.27 3185.63c10.94 14.27 50.5 14.38 47.44-18.22-3.47-37.06-24.41-31.48-29.66-58.04 0 0 1.27 8.47-12.7 10.58-13.98 2.12-7.2 8.05-7.2 8.05s11.01-.85 13.55 1.66c1.29 1.29-21.69 42.55-11.43 55.97z" />
                <path className={isPositive ? "strip-positive" : "strip-negative"}
                    fill={isPositive ? "#10b981" : "#ef4444"}
                    filter={`url(#stripGlow-${coin?.id})`} d="M1887.75 3129.97c2.68.06 8.35-.43 13.11-4.94 1.04 1.37 2.13 2.63 3.26 3.85-6.92 5.88-15.2 5.82-17.99 5.6.96-2.28 1.58-3.88 1.62-4.51z" />
                <path fillRule="evenodd" fill="rgb(51.367188%, 31.37207%, 19.993591%)" fillOpacity="1" d="M2000.44 3051.33h186.02c8.39 0 15.25 6.86 15.25 15.25s-6.86 15.25-15.25 15.25H2000.44v-30.5z" />
                <path fillRule="evenodd" fill="rgb(43.920898%, 19.993591%, 11.767578%)" fillOpacity="1" d="M2178.36 3081.83H2000.44v193.17h134.29c24 0 43.63-19.63 43.63-43.63v-149.54z" />
                <path fillRule="evenodd" fill="rgb(19.213867%, 18.041992%, 17.651367%)" fillOpacity="1" d="M2147.48 2706.93h-17.79v109.3h-88.54v-12.71c0-6.99-5.71-12.71-12.7-12.71h-28.02v102.51h64.01c45.67 0 83.04-37.36 83.04-83.03v-103.37z" />
                <path fillRule="nonzero" fill="rgb(35.693359%, 27.43988%, 20.776367%)" fillOpacity="1" d="M2176.68 2698.36l-31.4 352.97h12l31.32-351.93-11.92-.04z" />
                <path fillRule="evenodd" fill="rgb(45.872498%, 15.281677%, 10.594177%)" fillOpacity="1" d="M2201.7 2683.21h-201.26v23.72H2201.7c6.53 0 11.87-5.34 11.87-11.86s-5.34-11.86-11.87-11.86z" />
                <path fillRule="evenodd" fill="rgb(34.910583%, 16.088867%, 9.790039%)" fillOpacity="1" d="M2000.44 3081.83h177.92v11.9H2000.44v-11.9z" />
                <path className={isPositive ? "strip-positive" : "strip-negative"}
                    fill={isPositive ? "#10b981" : "#ef4444"}
                    filter={`url(#stripGlow-${coin?.id})`} d="M1899.45 3051.33v77.8h-4v-77.8h4z" />
                <path className={isPositive ? "strip-positive" : "strip-negative"}
                    fill={isPositive ? "#10b981" : "#ef4444"}
                    filter={`url(#stripGlow-${coin?.id})`} d="M2080.75 3185.63c10.95 14.27 50.5 14.38 47.45-18.22-3.48-37.06-24.41-31.48-29.66-58.04 0 0 1.27 8.47-12.7 10.58-13.97 2.12-7.2 8.05-7.2 8.05s11.01-.85 13.54 1.66c1.29 1.29-21.68 42.55-11.43 55.97z" />
                <path className={isPositive ? "strip-positive" : "strip-negative"}
                    fill={isPositive ? "#10b981" : "#ef4444"}
                    filter={`url(#stripGlow-${coin?.id})`} d="M2092.24 3129.97c2.68.06 8.35-.43 13.1-4.94 1.04 1.37 2.13 2.63 3.27 3.85-6.92 5.88-15.2 5.82-18 5.6.96-2.28 1.59-3.88 1.63-4.51z" />
                <path className={isPositive ? "strip-positive" : "strip-negative"}
                    fill={isPositive ? "#10b981" : "#ef4444"}
                    filter={`url(#stripGlow-${coin?.id})`} d="M2103.93 3051.33v77.8h-4v-77.8h4z" />
                <path fillRule="evenodd" fill="rgb(43.920898%, 19.993591%, 11.767578%)" fillOpacity="1" d="M1822.51 3081.83h177.93v11.9h-177.93v-11.9z" />
                <path fillRule="nonzero" fill={color} fillOpacity="1" d="M2000.44 448.27c-102.19-1.12-423.58 73.89-582.85 201.72-230.46 179.81-370.61 474.73-350.49 767.96 9.76 95.49 40.85 187.56 81.44 274.11 42.46 92.7 95.46 180.17 152.94 264.21 90.97 125.19 367.31 406.69 397.32 470.98 39.48 85.2 78.88 170.45 117.52 255.95h368.27c38.65-85.5 78.05-170.75 117.52-255.95 30.01-64.29 306.34-345.79 397.31-470.98 57.48-84.04 110.48-171.51 152.94-264.21 40.6-86.55 71.69-178.62 81.45-274.11 20.12-293.23-119.99-588.15-350.46-767.96-159.28-127.83-480.66-202.84-582.86-201.72z" />
                <path fillRule="evenodd" fill="url(#balloonLight)" opacity="0.5" d="M2000.44 448.27c-102.19-1.12-423.58 73.89-582.85 201.72-230.46 179.81-370.61 474.73-350.49 767.96 9.76 95.49 40.85 187.56 81.44 274.11 42.46 92.7 95.46 180.17 152.94 264.21 90.97 125.19 367.31 406.69 397.32 470.98 39.48 85.2 78.88 170.45 117.52 255.95h368.27c38.65-85.5 78.05-170.75 117.52-255.95 30.01-64.29 306.34-345.79 397.31-470.98 57.48-84.04 110.48-171.51 152.94-264.21 40.6-86.55 71.69-178.62 81.45-274.11 20.12-293.23-119.99-588.15-350.46-767.96-159.28-127.83-480.66-202.84-582.86-201.72z" />
            </g>
            {coin?.image && (
                <image
                    href={coin.image}
                    x={imageX}
                    y={imageY}
                    width={imageSize}
                    height={imageSize}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ pointerEvents: "none" }}
                />
            )}

            {isLarge && coin?.symbol && (
                <>
                    <text
                        x="2000"
                        y={symbolY}
                        textAnchor="middle"
                        fontSize={isLarge ? "260" : "300"}
                        fontWeight="bold"
                        fill="#000000"
                        opacity="0.85"
                        fontFamily="Arial, sans-serif"
                        style={{ textTransform: 'uppercase', pointerEvents: 'none' }}
                    >
                        {coin.symbol}
                    </text>

                    {displayPercent !== undefined && (
                        <g filter={`url(#shadow-${coin?.id})`} style={{ pointerEvents: 'none' }}>
                            <ellipse
                                cx="2000"
                                cy={percentY - 60}
                                rx="550"
                                ry="160"
                                fill={isPositive ? "#10b981" : "#ef4444"}
                            />
                            <ellipse
                                cx="2000"
                                cy={percentY - 60}
                                rx="480"
                                ry="120"
                                fill={isPositive ? "#34d399" : "#f87171"}
                                opacity="0.6"
                            />

                            <text
                                x="2000"
                                y={percentY}
                                textAnchor="middle"
                                fontSize={isLarge ? "200" : "240"}
                                fontWeight="900"
                                fill={isPositive ? "#000000" : "#ffffff"}
                                fontFamily="Arial, sans-serif"
                            >
                                {isPositive ? '▲' : '▼'} {absPercent.toFixed(1)}%
                            </text>
                        </g>
                    )}
                </>
            )}
        </svg>
    );
};

export default Balloon;