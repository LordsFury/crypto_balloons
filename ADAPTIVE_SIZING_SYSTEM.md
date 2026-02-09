# Adaptive Balloon Sizing System

## Overview
The balloon sizing system now adapts to time periods and percent changes, providing a more intuitive and visually balanced experience across all time ranges.

## Key Features

### 1. Time-Period-Aware Sizing
Each time period has custom size ranges based on typical percent change magnitudes:

- **1h (Hourly)**: 180-320px
  - Typical changes: 0.1% - 5%
  - Larger sizes to show variation in small changes
  - Square root scaling (power: 0.5) for subtle differences

- **24h (Daily)**: 160-300px
  - Typical changes: 0.5% - 15%
  - Balanced size range
  - Linear scaling (power: 1.0)

- **7d (Weekly)**: 140-280px
  - Typical changes: 2% - 30%
  - Slightly compressed for larger changes
  - Gentle compression (power: 0.9)

- **30d (Monthly)**: 130-260px
  - Typical changes: 5% - 100%+
  - Logarithmic scaling prevents extreme sizes
  - Moderate compression (power: 0.8)

- **1y (Yearly)**: 120-240px
  - Typical changes: 10% - 500%+
  - Strong logarithmic scaling essential
  - Heavy compression (power: 0.7)

### 2. Intelligent Scaling Methods

#### Linear Scaling (1h, 24h, 7d)
For time periods with moderate percent changes, simple linear mapping works well:
```
normalized = (value - min) / (max - min)
size = minSize + normalized * (maxSize - minSize)
```

#### Power Scaling
Applied to all periods to fine-tune distribution:
- **power < 1.0**: Spreads out smaller values (better for hourly)
- **power = 1.0**: Linear distribution (good for daily)
- **power > 1.0**: Compresses smaller values (not currently used)

#### Logarithmic Scaling (30d, 1y)
For periods with extreme percent changes (100%+, 500%+), logarithmic scaling prevents balloon size explosions:
```
scaledValue = log(1 + value)  // log1p handles values near zero
normalized = (scaledValue - scaledMin) / (scaledMax - scaledMin)
```

### 3. Content Display Thresholds

Instead of a binary large/small system, display is now based on actual balloon size:

- **< 160px**: Logo only (very small balloons)
- **≥ 160px**: Logo + Symbol + Percent (full data)

The threshold automatically adapts to the time period, so:
- In 1h view: Most balloons show full data (larger sizes)
- In 1y view: More logo-only balloons (smaller sizes for extreme changes)

## Implementation Details

### Configuration (`balloonConstants.js`)
```javascript
export const TIME_PERIOD_SIZING = {
  "1h": {
    minSize: 180,
    maxSize: 320,
    scalingPower: 0.5,
    useLogarithmic: false
  },
  // ... other periods
};

export const LOGO_ONLY_SIZE = 160;
```

### Size Calculation (`balloonCalculations.js`)
The `createSizeMapper` function:
1. Retrieves time-period-specific config
2. Analyzes percent change distribution
3. Applies appropriate scaling (linear vs logarithmic)
4. Adjusts distribution with power scaling
5. Maps to period-specific size range

### Display Logic (`Balloon.js`)
```javascript
const showFullData = size >= LOGO_ONLY_SIZE;

{showFullData && (
  <>
    <BalloonSymbolText ... />
    <BalloonPercentDisplay ... />
  </>
)}
```

## Benefits

### Visual Balance
- **No more extreme sizes**: Logarithmic scaling prevents 500% changes from creating massive balloons
- **Better small change visibility**: Square root scaling in hourly view makes 0.5% and 2% changes clearly distinguishable
- **Consistent screen utilization**: Each time period uses screen space effectively

### Adaptive Differentiation
- **1h**: Small changes (2% vs 4%) are visually distinct
- **24h**: Moderate changes well-differentiated
- **7d**: Larger changes compressed appropriately
- **30d/1y**: Extreme changes don't dominate the screen

### Intelligent Content
- Very small balloons (< 160px) show logo only - cleaner, no cramming
- Larger balloons (≥ 160px) show full data comfortably
- Threshold automatically adapts to time period characteristics

## Size Distribution Examples

### 1h View (0.5%, 2%, 5%)
```
0.5% → ~200px (logo + data)
2.0% → ~260px (logo + data)
5.0% → ~320px (logo + data)
```
All show full data, clear size differences for small changes.

### 1y View (50%, 200%, 500%)
```
50%  → ~180px (logo + data)
200% → ~210px (logo + data)
500% → ~240px (logo + data)
```
Logarithmic scaling keeps sizes reasonable, prevents 500% from being 3x the size of 50%.

## Migration from Previous System

### What Changed
- ❌ Removed: Fixed 160-300px range for all time periods
- ❌ Removed: Binary large/small threshold at 225px
- ✅ Added: Time-period-specific size ranges
- ✅ Added: Logarithmic scaling for 30d and 1y
- ✅ Added: Power scaling for fine-tuning distribution
- ✅ Changed: Display threshold from 225px to 160px

### Backward Compatibility
- All existing hooks and components work unchanged
- Only sizing calculation and display threshold logic updated
- No changes to drag, collision, or animation systems
