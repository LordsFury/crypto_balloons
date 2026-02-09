import { useEffect, useRef } from "react";
import { 
  COLLISION_DISTANCE, 
  REPEL_FORCE, 
  COLLISION_CHECK_INTERVAL 
} from "@/config/balloonConstants";
import { getDistance, getRectCenter } from "@/utils/balloonCalculations";
import { balloonPositionManager } from "@/utils/balloonPositionManager";

/**
 * Custom hook for handling balloon collision detection and repulsion
 * Now uses persistent position offsets so pushed balloons stay in their new positions
 */
export const useBalloonCollision = (isDragging, elementRef, balloonId) => {
  const intervalRef = useRef(null);
  const pushedBalloonsRef = useRef(new Set());

  useEffect(() => {
    if (!isDragging || !elementRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Keep the pushed balloons set for this drag session
      // Don't clear it - balloons should stay in their new positions
      return;
    }

    // Small delay before starting collision detection
    const startTimeout = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (!elementRef.current) return;
        
        // Get all balloons via data-balloon-id on motion.div parent
        const allBalloons = document.querySelectorAll('[data-balloon-id]');
        const myParent = elementRef.current.parentElement;
        if (!myParent) return;
        
        const myRect = myParent.getBoundingClientRect();
        const myCenter = getRectCenter(myRect);

        allBalloons.forEach((otherBalloon) => {
          if (otherBalloon === myParent) return;

          const otherBalloonId = otherBalloon.getAttribute('data-balloon-id');
          if (!otherBalloonId || otherBalloonId === balloonId) return;

          const otherRect = otherBalloon.getBoundingClientRect();
          const otherCenter = getRectCenter(otherRect);
          
          const distance = getDistance(myCenter.x, myCenter.y, otherCenter.x, otherCenter.y);

          if (distance < COLLISION_DISTANCE && distance > 0) {
            pushBalloon(otherBalloon, otherBalloonId, myCenter, otherCenter, distance);
            pushedBalloonsRef.current.add(otherBalloonId);
          }
        });
      }, COLLISION_CHECK_INTERVAL);
    }, 150);

    return () => {
      clearTimeout(startTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Don't clear pushedBalloonsRef - let balloons keep their positions
    };
  }, [isDragging, elementRef, balloonId]);
};

/**
 * Push a balloon away and store the offset permanently
 * @param {HTMLElement} balloon - The balloon element to push
 * @param {string} balloonId - The balloon's unique ID
 * @param {Object} fromCenter - Center point of the dragged balloon
 * @param {Object} toCenter - Center point of the balloon being pushed
 * @param {number} distance - Distance between balloons
 */
const pushBalloon = (balloon, balloonId, fromCenter, toCenter, distance) => {
  // balloon is already the motion.div parent element
  if (!balloon) return;

  // Calculate direction
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  
  // Calculate force (stronger when closer)
  const force = Math.pow(1 - (distance / COLLISION_DISTANCE), 1.5);
  const pushAmount = REPEL_FORCE * force * 0.6;
  
  const pushX = (dx / distance) * pushAmount;
  const pushY = (dy / distance) * pushAmount;

  // Boundary check - get current offset to calculate final position
  const currentOffset = balloonPositionManager.getOffset(balloonId);
  const rect = balloon.getBoundingClientRect();
  const newX = rect.left + pushX;
  const newY = rect.top + pushY;
  
  const margin = 60; // Reduced margin for better usable area
  
  // Only prevent push if it would go significantly off-screen
  if (newX < -margin || newX > window.innerWidth - rect.width + margin ||
      newY < -margin || newY > window.innerHeight - rect.height + margin) {
    return;
  }

  // Store the offset permanently in the position manager
  // This ensures the balloon stays in its new position
  balloonPositionManager.setOffset(balloonId, pushX, pushY);
};
