# 🎯 Persistent Balloon Push Feature

## Overview
This feature implements **persistent balloon displacement** similar to Crypto Bubbles, where dragging a balloon pushes nearby balloons away, and **they stay in their new positions** instead of returning to their original spots.

## 🎨 User Experience

### Before
- Drag a balloon → nearby balloons are pushed away temporarily
- Release the balloon → pushed balloons snap back to original positions
- **No permanent effect on layout**

### After
- Drag a balloon → nearby balloons are pushed away
- Release the balloon → **pushed balloons stay in their new positions**
- **Persistent layout changes** just like Crypto Bubbles
- Smooth spring animations for natural movement

## 🏗️ Architecture

### Components

#### 1. **BalloonPositionManager** (`src/utils/balloonPositionManager.js`)
Central state manager for persistent balloon positions.

```javascript
// Features:
- Singleton pattern for global state
- Stores permanent X/Y offsets for each balloon
- Event-based listener system for position updates
- Methods: setOffset(), getOffset(), reset()
```

**Key Methods:**
- `setOffset(balloonId, deltaX, deltaY)` - Add to existing offset (cumulative)
- `getOffset(balloonId)` - Get current persistent offset
- `addListener(balloonId, callback)` - Subscribe to position changes
- `reset()` - Clear all positions (used on time/range change)

#### 2. **useBalloonCollision** (`src/hooks/useBalloonCollision.js`)
Enhanced collision detection with persistent position updates.

**Changes:**
```javascript
// OLD: Temporary CSS custom properties
balloon.style.setProperty('--push-x', `${x}px`);

// NEW: Permanent position manager
balloonPositionManager.setOffset(balloonId, pushX, pushY);
```

**Features:**
- Calculates repulsion force based on distance
- Stores offsets permanently in position manager
- Boundary checking to prevent off-screen pushes
- Cumulative offsets for multiple push events

#### 3. **BalloonFloating** (`src/components/BalloonFloating.js`)
Enhanced balloon component with persistent offset rendering.

**New Features:**
```javascript
// State for persistent offset
const [persistentOffset, setPersistentOffset] = useState({ x: 0, y: 0 });

// Subscribe to position manager updates
useEffect(() => {
  balloonPositionManager.addListener(coin.id, handleOffsetChange);
}, [coin.id]);

// Apply offset with Framer Motion spring animation
<motion.div
  animate={{ 
    x: persistentOffset.x,
    y: persistentOffset.y
  }}
  transition={{ 
    type: "spring", 
    stiffness: 100, 
    damping: 20 
  }}
/>
```

**Key Additions:**
- `data-balloon-id` attribute for DOM identification
- Reactive state updates from position manager
- Spring-based animation for smooth transitions
- Persistent offset applied via Framer Motion

#### 4. **Main Component** (`src/components/Main.js`)
Optional position reset on time/range changes.

```javascript
useEffect(() => {
  if (RESET_POSITIONS_ON_TIME_CHANGE) {
    balloonPositionManager.reset();
  }
}, [time, range]);
```

## ⚙️ Configuration

### Constants (`src/config/balloonConstants.js`)

```javascript
// Collision behavior
export const COLLISION_DISTANCE = 180;     // Detection radius (px)
export const REPEL_FORCE = 20;             // Push strength
export const COLLISION_CHECK_INTERVAL = 100; // Check frequency (ms)

// Feature flags
export const ENABLE_PERSISTENT_PUSH = true;        // Toggle persistent positions
export const RESET_POSITIONS_ON_TIME_CHANGE = true; // Reset on time change
```

### Customization Options

#### Adjust Push Strength
```javascript
// balloonConstants.js
export const REPEL_FORCE = 30; // Stronger push
export const REPEL_FORCE = 10; // Gentler push
```

#### Change Detection Range
```javascript
// balloonConstants.js
export const COLLISION_DISTANCE = 250; // Wider detection area
export const COLLISION_DISTANCE = 120; // Closer detection
```

#### Disable Position Reset
```javascript
// balloonConstants.js
export const RESET_POSITIONS_ON_TIME_CHANGE = false;
// Balloons keep positions even when changing time period
```

## 🔄 Data Flow

```
User drags balloon A
       ↓
useBalloonCollision detects nearby balloon B
       ↓
Calculate repulsion force & direction
       ↓
balloonPositionManager.setOffset(B, dx, dy)
       ↓
Position manager updates offset internally
       ↓
Position manager notifies listeners
       ↓
BalloonFloating (B) receives update via listener
       ↓
setPersistentOffset({ x: dx, y: dy })
       ↓
Framer Motion animates to new position
       ↓
Balloon B stays at new position permanently
```

## 🎯 Physics Calculations

### Repulsion Force
```javascript
// Distance-based force (closer = stronger)
const force = Math.pow(1 - (distance / COLLISION_DISTANCE), 1.5);
const pushAmount = REPEL_FORCE * force * 0.6;

// Direction vector (normalized)
const dx = (toX - fromX) / distance;
const dy = (toY - fromY) / distance;

// Final displacement
const pushX = dx * pushAmount;
const pushY = dy * pushAmount;
```

**Force Curve:**
- Distance = 0% → Force = 100% (maximum push)
- Distance = 50% → Force = ~35%
- Distance = 100% → Force = 0% (no collision)

### Spring Animation
```javascript
// Smooth, natural movement
transition: { 
  type: "spring",
  stiffness: 100,    // Spring stiffness
  damping: 20        // Damping factor
}
```

## 🐛 Debugging

### Check Position Manager State
```javascript
// In browser console
import { balloonPositionManager } from './src/utils/balloonPositionManager';

// View all offsets
console.log(balloonPositionManager.offsets);

// View specific balloon
console.log(balloonPositionManager.getOffset('bitcoin'));

// Reset all
balloonPositionManager.reset();
```

### Verify Balloon IDs
```javascript
// All balloons should have data-balloon-id attribute
const balloons = document.querySelectorAll('[data-balloon-id]');
console.log('Balloons with IDs:', balloons.length);
```

### Monitor Position Updates
```javascript
// Add temporary listener
balloonPositionManager.addListener('bitcoin', (x, y) => {
  console.log('Bitcoin moved:', { x, y });
});
```

## 🚀 Performance Considerations

### Optimizations
1. **Collision Check Interval**: 100ms (not every frame)
2. **Boundary Checking**: Prevents unnecessary calculations
3. **Spring Animation**: GPU-accelerated via Framer Motion
4. **Listener Pattern**: Only update affected balloons
5. **Memoization**: React.memo on BalloonFloating

### Performance Metrics
- Minimal CPU impact (collision checks are throttled)
- Smooth 60fps animations
- No layout thrashing (uses transform)
- Efficient memory usage (Map-based storage)

## 📱 Mobile Support

### Touch Interactions
- Works seamlessly with touch drag
- Haptic feedback on drag (if supported)
- Same physics on all devices

### Responsive Behavior
- Boundary checks adapt to screen size
- Force calculations scale appropriately
- Spring animations optimize for mobile performance

## 🎓 Best Practices

### When to Reset Positions
```javascript
// Reset on major data changes
useEffect(() => {
  balloonPositionManager.reset();
}, [range]); // New data set

// Keep positions on minor changes
useEffect(() => {
  // Don't reset - just update sizes
  updateSizes(filteredCoins);
}, [time]); // Same coins, different percentages
```

### Adjusting for Different Layouts
```javascript
// Tight packing → increase detection range
export const COLLISION_DISTANCE = 220;

// Sparse layout → decrease detection range
export const COLLISION_DISTANCE = 140;
```

## 🔧 Troubleshooting

### Issue: Balloons snap back to original positions
**Solution:** Check that `data-balloon-id` is set on balloon elements
```javascript
// In BalloonFloating.js
<div data-balloon-id={coin?.id} className="balloon-float">
```

### Issue: Positions reset unexpectedly
**Solution:** Check RESET_POSITIONS_ON_TIME_CHANGE setting
```javascript
export const RESET_POSITIONS_ON_TIME_CHANGE = false;
```

### Issue: Push force too weak/strong
**Solution:** Adjust REPEL_FORCE constant
```javascript
export const REPEL_FORCE = 30; // Increase for stronger push
```

### Issue: Balloons pushed off-screen
**Solution:** Boundary checking is in place - adjust margin if needed
```javascript
const margin = 80; // Increase for more padding
```

## 🎉 Feature Highlights

✅ **Persistent Positions** - Balloons stay where pushed  
✅ **Smooth Animations** - Spring physics for natural movement  
✅ **Configurable** - Easy to customize behavior  
✅ **Performant** - Optimized collision detection  
✅ **Mobile-Friendly** - Works on touch devices  
✅ **Crypto Bubbles Experience** - Professional bubble chart feel  

## 🔄 Future Enhancements

Potential improvements:
- [ ] Velocity-based push (faster drag = stronger push)
- [ ] Chain reactions (pushed balloons push others)
- [ ] Gradual position settling over time
- [ ] Magnetic clustering effects
- [ ] Save/restore position state to localStorage
- [ ] Multi-balloon drag selection

---

**Status:** ✅ Feature Complete  
**Version:** 1.0  
**Last Updated:** February 5, 2026
