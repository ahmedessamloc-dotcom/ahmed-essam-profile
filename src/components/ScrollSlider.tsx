'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

const GOLD = '#C9A96E';

// =============================================================================
// ScrollSlider — optimized for INP
// Uses rAF throttling + direct DOM manipulation for progress bar
// CSS animations replace framer-motion for scroll-to-top button
// =============================================================================

export default function ScrollSlider() {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
        // Direct DOM — skips React reconciliation for the progress bar
        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${progress})`;
        }
        setShowTopBtn(scrollTop > 300);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {/* Top Progress Bar — uses scaleX (compositor-friendly) instead of width */}
      <div
        className="fixed top-0 left-0 z-[9990] h-[3px] w-full"
        style={{ backgroundColor: 'rgba(201, 169, 110, 0.08)' }}
      >
        <div
          ref={progressBarRef}
          className="h-full origin-left"
          style={{
            transform: 'scaleX(0)',
            background: `linear-gradient(90deg, ${GOLD}, #E8D5B0)`,
            boxShadow: '0 0 10px rgba(201, 169, 110, 0.5)',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Scroll-to-Top Button — CSS animation instead of framer-motion */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed z-[9980] flex items-center justify-center rounded-full cursor-pointer active:scale-90 group scroll-top-btn-enter"
          style={{
            right: '16px',
            bottom: '108px',
            width: '44px',
            height: '44px',
            backgroundColor: 'var(--c-surface-card)',
            border: `1px solid ${GOLD}55`,
            backdropFilter: 'blur(12px)',
            boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px ${GOLD}15`,
          }}
          aria-label="Scroll to top"
        >
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              boxShadow: `0 0 16px ${GOLD}33`,
            }}
          />
          <ArrowUp size={20} style={{ color: GOLD }} className="relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </button>
      )}
    </>
  );
}
