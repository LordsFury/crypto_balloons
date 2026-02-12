"use client";
import { useEffect, useRef, useState } from "react";

/**
 * VideoBackground Component - Optimized for Performance
 * Renders a video background with minimal impact on balloon animations
 * Falls back to gradient if video not available
 */
const VideoBackground = ({ 
  src = "/assets/videos/video1.mp4", 
  opacity = 0.3,
  blur = 3 
}) => {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(true); // Start visible
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Optimize video playback
    const handleCanPlay = () => {
      setIsLoaded(true);
      video.play().catch(err => {
        console.warn("Video autoplay failed:", err);
        setHasError(true);
      });
    };

    const handleError = () => {
      console.warn("Video failed to load, using fallback");
      setHasError(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  // Fallback gradient background if video fails
  if (hasError) {
    return (
      <div 
        className="video-background-fallback"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          background: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0f0f1e 100%)',
          opacity: 0.9
        }}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className="video-background"
      style={{ 
        opacity: opacity,
        filter: blur > 0 ? `blur(${blur}px)` : 'none',
        transition: 'opacity 0.5s ease-out',
        transform: 'translateZ(0)',
        backgroundColor: 'transparent',
      }}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
};

export default VideoBackground;
