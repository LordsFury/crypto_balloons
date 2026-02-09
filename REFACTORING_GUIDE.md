# Crypto Balloons - Refactoring Guide

## 📋 Overview

This document explains the refactored architecture of the crypto-balloons application, following industry-standard best practices for React applications.

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- Business logic separated from UI components
- Data fetching isolated in custom hooks
- Calculations extracted to utility functions
- Constants centralized in configuration files

### 2. **Component Composition**
- Large components broken into smaller, focused sub-components
- Each component has a single responsibility
- Improved reusability and testability

### 3. **Custom Hooks Pattern**
- Reusable stateful logic extracted to custom hooks
- Better code organization and sharing
- Easier to test and maintain

### 4. **Performance Optimization**
- Memoization using React.memo
- Efficient re-rendering with proper dependencies
- GPU-accelerated animations
- Optimized collision detection

## 📁 New File Structure

```
crypto-balloons/
├── src/
│   ├── components/
│   │   ├── Main.js                      # Main container (simplified)
│   │   ├── BalloonFloating.js           # Balloon wrapper (refactored)
│   │   ├── Balloon.js                   # SVG balloon (refactored)
│   │   ├── BalloonCoinImage.js          # NEW: Coin image sub-component
│   │   ├── BalloonSymbolText.js         # NEW: Symbol text sub-component
│   │   ├── BalloonPercentDisplay.js     # NEW: Percentage display sub-component
│   │   ├── useBalloonEngine.js          # Improved physics engine
│   │   └── ...
│   ├── hooks/
│   │   ├── useCryptoData.js             # NEW: Data fetching & filtering
│   │   ├── useBalloonLayout.js          # NEW: Layout management
│   │   ├── useBalloonDrag.js            # NEW: Drag interactions
│   │   ├── useBalloonCollision.js       # NEW: Collision detection
│   │   ├── useBalloonSpring.js          # NEW: Spring animations
│   │   └── useAnimatedPercent.js        # NEW: Percentage animation
│   ├── utils/
│   │   ├── balloonCalculations.js       # NEW: Calculation utilities
│   │   └── animationHelpers.js          # NEW: Animation utilities
│   └── config/
│       └── balloonConstants.js          # NEW: Centralized constants
```

## 🎯 Key Improvements

### 1. Configuration Management

**Before:** Constants scattered throughout files
```javascript
const BASE_SIZE = 200;
const CLICK_THRESHOLD = 8;
// ... repeated in multiple files
```

**After:** Centralized in `config/balloonConstants.js`
```javascript
import { BASE_SIZE, CLICK_THRESHOLD } from '@/config/balloonConstants';
```

### 2. Enhanced Drag & Drop Physics

#### **Crypto Bubbles-Style Interactions**
- ✅ **Smooth Momentum** - Balloons continue moving after release with inertia
- ✅ **Elastic Boundaries** - Soft bounce when reaching screen edges
- ✅ **Dynamic Collisions** - Velocity-based repulsion forces
- ✅ **Visual Feedback** - Scale animations, glow effects, and cursor changes
- ✅ **Touch Support** - Haptic feedback on mobile devices
- ✅ **Drag Constraints** - Smart boundaries to keep balloons visible
- ✅ **Hover Effects** - Subtle scale on hover for better UX

#### **Drag Features:**
```javascript
// Momentum & Inertia
dragMomentum={true}
dragElastic={0.15}
dragTransition={{ 
  power: 0.8,
  timeConstant: 800,
  bounceStiffness: 200,
  bounceDamping: 20
}}

// Visual Feedback
whileDrag={{ scale: 1.05, cursor: "grabbing" }}
whileHover={{ scale: 1.02, cursor: "grab" }}
```

### 3. Custom Hooks

#### `useCryptoData(range)`
Handles all data fetching and filtering logic.

**Responsibilities:**
- Fetch crypto ticker data from API
- Filter by rank range
- Apply mobile/desktop limits
- Error handling and loading states

**Returns:** `{ allCoins, filteredCoins, isLoading, error }`

#### `useBalloonLayout(coins, time)`
Manages balloon positioning and sizing.

**Responsibilities:**
- Calculate grid layout
- Generate balloon configurations
- Update sizes when time period changes
- Handle screen dimensions

**Returns:** `{ balloons, generateLayout, updateSizes, screenDimensions }`

#### `useBalloonDrag(onBalloonClick)`
Handles drag and click interactions.

**Responsibilities:**
- Detect drag vs click
- Manage z-index for layering
- Prevent accidental clicks while dragging

**Returns:** `{ isDragging, zIndex, handlePointerDown, handlePointerMove, handlePointerUp }`

#### `useBalloonCollision(isDragging, elementRef)`
Manages collision detection and repulsion.

**Responsibilities:**
- Detect nearby balloons
- Calculate repulsion forces
- Animate balloon movement

**Side effects:** Applies collision physics during drag

#### `useBalloonSpring(x, y, size)`
Manages smooth spring animations.

**Responsibilities:**
- Configure spring physics
- Adapt to performance constraints
- Update positions and scale

**Returns:** `{ scale, posX, posY }`

#### `useAnimatedPercent(coin, time)`
Animates percentage value changes.

**Responsibilities:**
- Smooth transitions between values
- Cubic easing function
- Cleanup on unmount

**Returns:** `displayPercent` (animated value)

### 3. Utility Functions

#### `balloonCalculations.js`
- `parseRange(range)` - Parse range strings
- `createSizeMapper(coins, timeKey)` - Create size mapping function
- `calculateGridLayout(total, w, h)` - Calculate grid dimensions
- `getSafePosition(pos, size, max)` - Bound checking
- `getDistance(x1, y1, x2, y2)` - Distance calculation
- `getRectCenter(rect)` - Get element center

#### `animationHelpers.js`
- `animatePosition(element, x, y)` - Smooth position animation
- `animateValue(start, end, duration, callback)` - Generic value animation

### 4. Component Breakdown

#### `Balloon.js` Components

**BalloonDefs** - SVG definitions (filters, gradients)
**BalloonStyles** - Animation keyframes
**BalloonShape** - Main balloon SVG paths
**BalloonCoinImage** - Coin logo rendering
**BalloonSymbolText** - Coin symbol text
**BalloonPercentDisplay** - Percentage badge

### 5. Performance Improvements

#### Before:
- Monolithic components with mixed concerns
- Repeated calculations
- Inefficient re-renders
- No cleanup for animations

#### After:
- ✅ Memoized components with React.memo
- ✅ Cached calculations in useMemo
- ✅ Proper cleanup in useEffect
- ✅ Optimized dependency arrays
- ✅ GPU-accelerated animations
- ✅ Efficient collision detection intervals
- ✅ Improved physics engine with cleanup

## 🔄 Migration Guide

### For Main.js

**Old Pattern:**
```javascript
const [balloons, setBalloons] = useState([]);
const allCoinsRef = useRef([]);
const layoutRef = useRef([]);

useEffect(() => {
  // Complex fetching logic
}, []);

useEffect(() => {
  // Layout generation
}, [range]);

useEffect(() => {
  // Size updates
}, [time]);
```

**New Pattern:**
```javascript
const { filteredCoins, isLoading } = useCryptoData(range);
const { balloons, generateLayout, updateSizes } = useBalloonLayout(filteredCoins, time);

useEffect(() => {
  if (!filteredCoins.length) return;
  generateLayout(filteredCoins);
}, [filteredCoins, generateLayout]);

useEffect(() => {
  updateSizes(filteredCoins);
}, [time]);
```

### For BalloonFloating.js

**Old Pattern:**
```javascript
const [isDragging, setIsDragging] = useState(false);
const [zIndex, setZIndex] = useState(100);
const pointerStart = useRef({});

const handlePointerDown = (e) => { /* ... */ };
const handlePointerMove = (e) => { /* ... */ };
const handlePointerUp = () => { /* ... */ };

useEffect(() => {
  // Collision detection logic
}, [isDragging]);
```

**New Pattern:**
```javascript
const { isDragging, zIndex, handlePointerDown, handlePointerMove, handlePointerUp } = 
  useBalloonDrag(onBalloonClick);
const { scale, posX, posY } = useBalloonSpring(x, y, size);

useBalloonCollision(isDragging, elRef);
```

### For Balloon.js

**Old Pattern:**
```javascript
const [displayPercent, setDisplayPercent] = useState(0);

useEffect(() => {
  // Complex animation logic with RAF
}, [coin, time]);
```

**New Pattern:**
```javascript
const displayPercent = useAnimatedPercent(coin, time);
```

## 🧪 Testing Strategy

### Unit Tests
- Test utility functions independently
- Test custom hooks with React Testing Library
- Test sub-components in isolation

### Integration Tests
- Test complete user flows
- Test drag and drop interactions
- Test data fetching and filtering

### Performance Tests
- Measure render times
- Monitor memory usage
- Test with many balloons

## 📚 Best Practices Applied

1. **Single Responsibility Principle** - Each module has one clear purpose
2. **DRY (Don't Repeat Yourself)** - Shared logic extracted to hooks/utils
3. **Composition over Inheritance** - Small components composed together
4. **Declarative over Imperative** - Custom hooks abstract complex logic
5. **Performance First** - Memoization, GPU acceleration, efficient algorithms
6. **Type Safety Ready** - Easy to add TypeScript types
7. **Testability** - Isolated, pure functions and focused components
8. **Maintainability** - Clear structure, documentation, and naming

## 🚀 Future Enhancements

1. **TypeScript Migration** - Add type safety
2. **Error Boundaries** - Graceful error handling
3. **Virtual Scrolling** - Handle thousands of balloons
4. **Web Workers** - Offload heavy calculations
5. **State Management** - Add Zustand/Redux if needed
6. **Unit Tests** - Comprehensive test coverage
7. **Storybook** - Component documentation
8. **Accessibility** - ARIA labels, keyboard navigation

## 📖 Related Documentation

- [React Hooks Guide](https://react.dev/reference/react)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Performance Optimization](https://react.dev/learn/render-and-commit)
- [Component Composition](https://react.dev/learn/thinking-in-react)

---

**Last Updated:** February 2026
**Refactored By:** GitHub Copilot
**Version:** 2.0
