'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// ─── Performance: import only the data arrays needed at render time ───
// portfolio-data is ~97KB; tree-shaking via named imports helps, but
// we further reduce by only importing what this component uses.
import { mapLocations, aboutData, projects } from '@/lib/portfolio-data';
import { GOLD } from '@/components/shared/constants';
import type { HeroSlide } from '@/components/shared/types';
// ─── Tree-shaken lucide imports (each icon ≈ 300B vs full bundle ≈ 45KB) ───
import { MapPin, Trophy, ChevronRight, ArrowDown } from 'lucide-react';

// Hero Section — Cinematic Architecture Portfolio
// INP Optimized: startTransition for non-urgent state, refs for urgent DOM updates
// =============================================================================

// Deterministic shuffle for SSR
function seededShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (i * 7 + 13) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Slideshow whitelist — only images from the uploaded "slide show.rar"
// Oasis always starts first, then randomized with non-consecutive same-project rule
const SINGLE_SHOT_WHITELIST: Record<number, string[]> = {
  1:  ['/portfolio/image3.webp'],                                                                                   // Oasis Skywalk — always first slide
  3:  ['/portfolio/image9.webp', '/portfolio/image10.webp', '/portfolio/image11.webp'],                                 // Ministry of Defense
  4:  ['/portfolio/image12.webp', '/portfolio/image13.webp', '/portfolio/image14.webp', '/portfolio/image15.webp'],       // Wycombe Abbey
  5:  ['/portfolio/image16.webp'],                                                                                    // Spa & Medical Hub
  7:  ['/portfolio/image23.webp', '/portfolio/image24.webp', '/portfolio/image25.webp', '/portfolio/image74.webp', '/portfolio/image75.webp'], // Attorney General
  14: ['/portfolio/image39.webp'],                                                                                    // Vodafone Renovation
  15: ['/portfolio/image41.webp', '/portfolio/image42.webp'],                                                          // Al Okashia
  17: ['/portfolio/image44.webp', '/portfolio/image45.webp'],                                                          // El Saraya Plaza
  18: ['/portfolio/image46.webp', '/portfolio/image47.webp'],                                                          // Neama Oasis
  20: ['/portfolio/image50.webp', '/portfolio/image51.webp'],                                                          // El Karnak Temple Park
  21: ['/portfolio/image55.webp'],                                                                                    // Residential Interior Design 1
  22: ['/portfolio/image52.webp'],                                                                                    // Residential Interior Design 2
  23: ['/portfolio/image53.webp'],                                                                                    // Residential Interior Design 3
  24: ['/portfolio/image62.webp'],                                                                                    // AIB Bank
  31: ['/portfolio/image70.webp', '/portfolio/image71.webp'],                                                          // Lowers Syndicate Club — Alexandria
  32: ['/portfolio/image72.webp'],                                                                                    // Lowers Syndicate Club — Luxor
  33: ['/portfolio/image73.webp'],                                                                                    // Pharma Cure Factory
  34: ['/portfolio/image_e854d031.webp', '/portfolio/image_6e5d4bb4.webp'],                                            // Luxor Children Park
  35: ['/portfolio/image_ed47f6f2.webp'],                                                                              // FPI Training Center
  36: ['/portfolio/image76.webp', '/portfolio/image77.webp'],                                                          // Administrative Compound
  37: ['/portfolio/image78.webp', '/portfolio/image79.webp'],                                                          // Holding Company for Water & Wastewater
  38: ['/portfolio/image80.webp', '/portfolio/image81.webp'],                                                          // New Cairo Club — Admin Building
  39: ['/portfolio/image_9fc76e09.webp'],                                                                              // Ras Sidr Touristic Village Competition
  40: ['/portfolio/image_580efc07.webp'],                                                                              // New Ismailia City Development
  41: ['/portfolio/image54.webp'],                                                                                    // Residential Interior Design 4
  42: ['/portfolio/image58.webp', '/portfolio/image59.webp', '/portfolio/image60.webp', '/portfolio/image61.webp'],       // Residential Interior Design 5
  45: ['/portfolio/image37.webp'],                                                                                    // Residential Exterior 5
  46: ['/portfolio/image66.webp'],                                                                                    // Residential Exterior 6
  47: ['/portfolio/image67.webp'],                                                                                    // Residential Exterior 7
  48: ['/portfolio/image68.webp'],                                                                                    // Residential Exterior 8
};

// Build flat slide array from whitelisted single-shot images only
function buildSlides(): HeroSlide[] {
  const slides: HeroSlide[] = [];
  projects.forEach((p) => {
    const whitelist = SINGLE_SHOT_WHITELIST[p.id];
    if (!whitelist) return;
    whitelist.forEach((img) => {
      if (!p.images.includes(img)) return;
      slides.push({
        image: img,
        projectId: p.id,
        title: p.title,
        category: p.category,
        location: p.location,
        year: p.year,
        award: p.award,
        description: p.description,
        role: p.role,
      });
    });
  });
  return slides;
}

/** Simple seeded PRNG (mulberry32) — deterministic across server & client */
function seededRandom(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SHUFFLE_SEED = 42;

function nonConsecutiveShuffle<T extends { projectId: number }>(arr: T[]): T[] {
  const rand = seededRandom(SHUFFLE_SEED);
  const result: T[] = [];
  const remaining = [...arr];

  const byProject = new Map<number, T[]>();
  remaining.forEach((item) => {
    const list = byProject.get(item.projectId) || [];
    list.push(item);
    byProject.set(item.projectId, list);
  });

  let lastProjectId = -1;
  let attempts = 0;
  const maxAttempts = remaining.length * 3;

  while (remaining.length > 0 && attempts < maxAttempts) {
    attempts++;
    const available = new Map<number, T[]>();
    byProject.forEach((items, pid) => {
      if (items.length > 0 && pid !== lastProjectId) {
        available.set(pid, items);
      }
    });

    if (available.size === 0) {
      for (const [pid, items] of byProject) {
        if (items.length > 0) {
          const item = items.shift()!;
          result.push(item);
          lastProjectId = pid;
          const idx = remaining.indexOf(item);
          if (idx !== -1) remaining.splice(idx, 1);
          break;
        }
      }
      continue;
    }

    const pids = [...available.keys()];
    const chosenPid = pids[Math.floor(rand() * pids.length)];
    const items = byProject.get(chosenPid)!;
    const item = items.shift()!;
    result.push(item);
    lastProjectId = chosenPid;
    const idx = remaining.indexOf(item);
    if (idx !== -1) remaining.splice(idx, 1);
  }

  remaining.forEach((item) => result.push(item));
  return result;
}

const ALL_SLIDES = buildSlides();
const OASIS_SLIDES = ALL_SLIDES.filter((s) => s.projectId === 1);
const OTHER_SLIDES = nonConsecutiveShuffle(ALL_SLIDES.filter((s) => s.projectId !== 1));
const SHUFFLED_SLIDES = [...OASIS_SLIDES, ...OTHER_SLIDES];

// Ken Burns directions — slow zoom/pan applied while each image is displayed
const KEN_BURNS = [
  { scale: 1.08, x: -1.5, y: -1 },
  { scale: 1.12, x: 1, y: 0.5 },
  { scale: 1.06, x: 0.5, y: -1.5 },
  { scale: 1.1, x: -0.8, y: 0.8 },
  { scale: 1.14, x: 1.2, y: -0.5 },
  { scale: 1.07, x: -1, y: 1 },
  { scale: 1.11, x: 0, y: -1.2 },
  { scale: 1.09, x: -0.5, y: -0.8 },
];

const SLIDE_INTERVAL = 8000;

export default function HeroSection() {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idxRef = useRef(0);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataBoxRef = useRef<HTMLDivElement>(null);

  // Split state — avoids cascading re-renders from micro-state changes
  const [activeIdx, setActiveIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [kenBurns, setKenBurns] = useState(KEN_BURNS[0]);
  const [blinking, setBlinking] = useState(false);
  const [clickBlink, setClickBlink] = useState(false);
  const [dataBoxHovered, setDataBoxHovered] = useState(false);

  const slides = SHUFFLED_SLIDES as HeroSlide[];

  // LCP optimization: first slide renders SSR so the LCP image is in initial HTML
  // This avoids waiting for JS hydration + useEffect before the hero image appears
  const firstSlide = slides[0];

  // Dynamic stats from data
  const heroStats = useMemo(() => {
    const cities = new Set(mapLocations.map((l) => l.city));
    const countries = new Set(mapLocations.map((l) => l.country));
    return [
      { value: aboutData.stats.find((s) => s.label.includes('Years'))?.value || '20', label: 'Years' },
      { value: aboutData.stats.find((s) => s.label.includes('Projects'))?.value || '150+', label: 'Projects' },
      { value: String(countries.size), label: 'Countries' },
      { value: String(cities.size), label: 'Cities' },
    ];
  }, []);

  // Navigate to project in Projects section
  const goToProject = useCallback((slide: HeroSlide) => {
    window.dispatchEvent(new CustomEvent('filter-projects', { detail: slide.category }));
    router.push(`/projects?category=${encodeURIComponent(slide.category.split('/')[0].trim())}`);
  }, [router]);

  // Advance to next slide — use startTransition for non-urgent visual update
  const advance = useCallback(() => {
    const total = slides.length;
    const next = (idxRef.current + 1) % total;
    idxRef.current = next;
    // Ken Burns is decorative — defer it
    startTransition(() => {
      setActiveIdx(next);
      setKenBurns(KEN_BURNS[next % KEN_BURNS.length]);
    });
  }, [slides.length]);

  const startSlideshow = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(advance, SLIDE_INTERVAL);
  }, [advance]);

  // Client mount
  useEffect(() => {
    idxRef.current = 0;
    setMounted(true);
    startSlideshow();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (blinkRef.current) clearTimeout(blinkRef.current);
    };
  }, [startSlideshow]);

  // Hover on image area — pause slideshow, start blinking data box
  // INP: Use startTransition for blinking (visual-only, non-urgent)
  const handleMouseEnter = useCallback(() => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    if (blinkRef.current) clearTimeout(blinkRef.current);
    // paused is urgent (controls slideshow), blinking is decorative
    setPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startTransition(() => setBlinking(true));
  }, []);

  // Leave image area — resume slideshow, stop blinking
  const handleMouseLeave = useCallback(() => {
    pauseTimeoutRef.current = setTimeout(() => {
      if (blinkRef.current) clearTimeout(blinkRef.current);
      setPaused(false);
      startTransition(() => {
        setBlinking(false);
        setDataBoxHovered(false);
      });
      startSlideshow();
    }, 1200);
  }, [startSlideshow]);

  // Hover on data box — stop blinking, keep solid, reveal image
  const handleDataBoxEnter = useCallback(() => {
    if (blinkRef.current) clearTimeout(blinkRef.current);
    startTransition(() => {
      setBlinking(false);
      setDataBoxHovered(true);
    });
  }, []);

  // Leave data box — restore dim overlay
  const handleDataBoxLeave = useCallback(() => {
    startTransition(() => setDataBoxHovered(false));
  }, []);

  const total = slides.length;
  const current = slides[activeIdx];

  // Click on image area → one-shot blink the data box
  // INP: clickBlink is decorative — defer it
  const handleImageClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-hero-databox]')) return;
    if (blinkRef.current) clearTimeout(blinkRef.current);
    startTransition(() => setClickBlink(true));
    blinkRef.current = setTimeout(() => {
      startTransition(() => setClickBlink(false));
    }, 2000);
  }, []);

  // Click on data box → navigate to Projects page and open detail dialog
  const handleDataBoxClick = useCallback(() => {
    if (current) {
      router.push(`/projects?openProject=${current.projectId}`);
    }
  }, [current, router]);

  // Only render visible slides: previous, active, next (3 max instead of 30+)
  const visibleIndices = useMemo(() => {
    const prev = (activeIdx - 1 + total) % total;
    const next = (activeIdx + 1) % total;
    return [prev, activeIdx, next];
  }, [activeIdx, total]);

  const visibleSlides = useMemo(() => {
    return visibleIndices.map((i) => ({ slide: slides[i], index: i }));
  }, [visibleIndices, slides]);

  return (
    <section
      id="home"
      ref={ref}
      className="hero-dark-context relative flex h-screen flex-col overflow-hidden bg-[var(--bg-primary)]"
    >
      <div className="flex flex-1 flex-col">

        {/* ===== TOP BAR — Minimal brand line ===== */}
        <div className="flex flex-shrink-0 items-center justify-center px-6 pt-5" style={{ flex: '0.5 0 0' }}>
          <div
            className="flex items-center gap-4"
            style={{
              opacity: 1,
              transition: 'opacity 0.8s ease',
            }}
          >
            <div className="h-[1px] w-8 sm:w-12" style={{ backgroundColor: 'var(--c-border-subtle)' }} />
            <span className="font-[family-name:var(--font-playfair)] text-xs font-normal tracking-[0.35em] uppercase sm:text-sm" style={{ color: 'var(--c-text-faint)' }}>
              {'Architecture & Engineering'}
            </span>
            <div className="h-[1px] w-8 sm:w-12" style={{ backgroundColor: 'var(--c-border-subtle)' }} />
          </div>
        </div>

        {/* ===== MAIN — Full-width cinematic photo show ===== */}
        <div
          className="hero-showcase relative w-full flex-1 overflow-hidden cursor-pointer"
          style={{ minHeight: 0 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleImageClick}
        >
          {/* LCP OPTIMIZATION: First slide renders SSR so the image is in initial HTML */}
          {/* This avoids waiting for JS hydration before the LCP image appears */}
          {!mounted && firstSlide && (
            <div
              className="hero-slide-img absolute inset-0"
              style={{ zIndex: 1 }}
            >
              <div className="h-full w-full" style={{ filter: 'grayscale(100%) contrast(1.08) brightness(0.9)' }}>
                <Image
                  src={firstSlide.image}
                  alt={firstSlide.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                  style={{
                    transform: 'scale(1.08) translate(-1.5%, -1%)',
                    transition: 'transform 12s cubic-bezier(0.25, 0.1, 0.25, 1)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Crossfade: only 3 slides in DOM (prev, active, next) instead of 30+ */}
          {mounted && visibleSlides.map(({ slide, index: i }) => {
            const isActive = i === activeIdx;
            const isFirstSlide = i === 0;
            return (
            <div
              key={`hs-${i}`}
              className="hero-slide-img absolute inset-0"
              style={{
                opacity: isActive ? 1 : 0,
                transition: 'opacity 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isActive ? 1 : 0,
                willChange: isActive ? 'opacity' : 'auto',
              }}
            >
              {/* Grayscale via CSS filter — promoted to its own layer with will-change */}
              <div
                className="h-full w-full"
                style={{
                  filter: paused ? 'grayscale(0%) contrast(1) brightness(1)' : 'grayscale(100%) contrast(1.08) brightness(0.9)',
                  transition: 'filter 0.8s ease',
                }}
              >
                {/* Use Next.js Image for first (LCP) slide for auto-optimization, plain <img> for others */}
                {isFirstSlide ? (
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                    style={{
                      transform: isActive
                        ? `scale(${kenBurns.scale}) translate(${kenBurns.x}%, ${kenBurns.y}%)`
                        : 'scale(1.05) translate(0, 0)',
                      transition: 'transform 12s cubic-bezier(0.25, 0.1, 0.25, 1)',
                      willChange: isActive ? 'transform' : 'auto',
                    }}
                  />
                ) : (
                  <img
                    src={slide.image}
                    alt={slide.title}
                    decoding="async"
                    loading={isActive ? 'eager' : 'lazy'}
                    fetchPriority={isActive ? 'high' : 'low'}
                    className="h-full w-full object-cover"
                    style={{
                      transform: isActive
                        ? `scale(${kenBurns.scale}) translate(${kenBurns.x}%, ${kenBurns.y}%)`
                        : 'scale(1.05) translate(0, 0)',
                      transition: 'transform 12s cubic-bezier(0.25, 0.1, 0.25, 1)',
                      willChange: isActive ? 'transform' : 'auto',
                    }}
                  />
                )}
              </div>
            </div>
          );
          })}

          {/* Dark gradient overlays for text readability */}
          <div className="pointer-events-none absolute inset-0" style={{
            background: 'linear-gradient(to right, rgba(10,10,10,0.6) 0%, transparent 35%, transparent 65%, rgba(10,10,10,0.5) 100%)',
          }} />
          <div className="pointer-events-none absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 30%, transparent 70%, rgba(10,10,10,0.4) 100%)',
          }} />

          {/* Dim overlay — 50% image transparency during display, removed when hovering data box */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              zIndex: 2,
              backgroundColor: 'rgba(0,0,0,0.5)',
              opacity: dataBoxHovered ? 0 : 1,
              transition: 'opacity 0.5s ease',
            }}
          />

          {/* ===== LEFT SIDE — Name & Title (ALWAYS visible, SSR) ===== */}
          <div className="absolute inset-0 flex items-center pointer-events-none" style={{ zIndex: 10 }}>
            <div className="w-full px-6 sm:px-10 md:px-16 lg:px-20">
              <div
                className="max-w-xl"
                style={{
                  opacity: 1,
                  transform: 'translateX(0)',
                  transition: 'opacity 1s ease 0.3s, transform 1s ease 0.3s',
                }}
              >
                <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  Ahmed Essam
                </h1>
                <div className="mt-3 h-[2px] w-full" style={{ backgroundColor: GOLD }} />
                <p className="mt-3 text-sm font-light tracking-[0.15em] text-white/50 sm:text-base md:text-lg">
                  {'Project Manager — Design & Development Management'}
                </p>
              </div>
            </div>
          </div>

          {/* ===== TOP RIGHT — Project Data (synchronized with image) ===== */}
          <div
            ref={dataBoxRef}
            className="absolute inset-0 flex items-start justify-end pt-6 sm:pt-8 pointer-events-none"
            style={{
              zIndex: 12,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(-12px)',
              transition: 'opacity 1.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div className="mr-4 sm:mr-10 md:mr-16 lg:mr-20 max-w-[180px] sm:max-w-[240px] md:max-w-[280px] pointer-events-auto">
              <button
                data-hero-databox="true"
                onClick={(e) => { e.stopPropagation(); handleDataBoxClick(); }}
                onMouseEnter={handleDataBoxEnter}
                onMouseLeave={handleDataBoxLeave}
                className={`group w-full text-left rounded-lg border bg-black/15 p-2.5 backdrop-blur-md sm:p-3 md:p-4 transition-all duration-500 cursor-pointer hover:bg-black/50 ${blinking ? 'data-box-blink' : ''} ${clickBlink ? 'data-box-blink-once' : ''}`}
                style={{
                  borderColor: paused ? 'rgba(201,169,110,0.5)' : 'rgba(255,255,255,0.1)',
                }}
              >
                {/* Project number + category */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-1.5 w-1.5 rounded-full transition-colors duration-500" style={{ backgroundColor: paused ? GOLD  : 'rgba(255,255,255,0.2)' }} />
                  <span className="text-[8px] sm:text-[10px] font-medium tracking-[0.2em] uppercase transition-colors duration-500" style={{ color: paused ? GOLD  : 'rgba(255,255,255,0.35)' }}>
                    {current?.category ? (current.category.includes('/') ? current.category.split('/').slice(-1)[0] : current.category) : ''}
                  </span>
                </div>

                {/* Project title */}
                <h3 className="font-[family-name:var(--font-playfair)] text-xs font-semibold leading-tight transition-colors duration-500 sm:text-sm md:text-base" style={{ color: paused ? '#ffffff' : 'rgba(255,255,255,0.7)' }}>
                  {current?.title || ''}
                </h3>

                {/* Location & Year */}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] sm:text-[10px] transition-colors duration-500" style={{ color: paused ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}>
                  <span className="flex items-center gap-1">
                    <MapPin size={10} style={{ color: paused ? GOLD  : 'rgba(255,255,255,0.2)', transition: 'color 0.5s' }} />
                    {current?.location || ''}
                  </span>
                  {current?.year && (
                    <>
                      <span className="text-white/25">•</span>
                      <span>{current.year}</span>
                    </>
                  )}
                </div>

                {/* Award badge */}
                {current?.award && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-all duration-500" style={{ backgroundColor: paused ? 'rgba(201,169,110,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${paused ? 'rgba(201,169,110,0.18)' : 'rgba(255,255,255,0.05)'}` }}>
                    <Trophy size={10} style={{ color: paused ? GOLD  : 'rgba(255,255,255,0.2)', transition: 'color 0.5s' }} />
                    <span className="text-[9px] font-medium tracking-wider transition-colors duration-500" style={{ color: paused ? GOLD  : 'rgba(255,255,255,0.2)' }}>{current.award}</span>
                  </div>
                )}

                {/* View Project CTA — only on hover/pause */}
                <div className="flex items-center gap-1.5 overflow-hidden transition-all duration-400"
                  style={{ maxHeight: paused ? '28px' : '0px', opacity: paused ? 1 : 0, marginTop: paused ? '10px' : '0px' }}>
                  <span className="text-[10px] font-medium tracking-wider" style={{ color: GOLD }}>
                    {'View Project'}
                  </span>
                  <ChevronRight size={12} style={{ color: GOLD }} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </button>
            </div>
          </div>

          {/* Hover hint — bottom right */}
          <div className="absolute bottom-4 right-6 flex items-center gap-2 sm:bottom-6 sm:right-10 md:right-16 pointer-events-none transition-opacity duration-700" style={{ zIndex: 10, opacity: paused ? 0 : 0.6 }}>
            <span className="text-xs sm:text-sm tracking-[0.15em] text-white/50">{'Hover to pause'}</span>
            <span className="text-xs sm:text-sm text-white/25">·</span>
            <span className="text-xs sm:text-sm tracking-[0.15em] text-white/50">{'Click for details'}</span>
          </div>

          {/* Thin gold borders */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px]" style={{ background: 'rgba(201,169,110,0.15)' }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px]" style={{ background: 'rgba(201,169,110,0.15)' }} />
        </div>

        {/* ===== BOTTOM BAR — Stats & Scroll ===== */}
        <div className="flex flex-shrink-0 flex-col items-center justify-center px-6 pb-8 sm:pb-10" style={{ flex: '0 0 auto' }}>
          <div className="mb-5 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {heroStats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="font-[family-name:var(--font-playfair)] text-base font-bold sm:text-lg md:text-xl" style={{ color: GOLD }}>{stat.value}</span>
                <span className="mt-0.5 text-[8px] tracking-[0.25em] uppercase sm:text-[9px]" style={{ color: 'var(--c-text-muted)' }}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div
            className="flex items-center gap-1"
            style={{
              opacity: mounted ? 1 : 0,
              transition: 'opacity 1s ease 2s',
            }}
          >
            <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: 'var(--c-text-ghost)' }}>{'Explore'}</span>
            <ArrowDown size={12} color={GOLD} />
          </div>
        </div>
      </div>
    </section>
  );
}
