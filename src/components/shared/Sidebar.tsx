'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home, User, Building2, Clock, MapPin, Briefcase,
  Trophy, Star, Globe, FileDown, Phone, X, ChevronRight,
  Share2, Search,
} from 'lucide-react';
import { NAV_LINKS, GOLD } from '@/components/shared/constants';

const SIDEBAR_ICONS: Record<string, React.ReactNode> = {
  Home: <Home size={18} />,
  About: <User size={18} />,
  Projects: <Building2 size={18} />,
  Timeline: <Clock size={18} />,
  Map: <MapPin size={18} />,
  Experience: <Briefcase size={18} />,
  Awards: <Trophy size={18} />,
  Competencies: <Star size={18} />,
  Network: <Globe size={18} />,
  Download: <FileDown size={18} />,
  Contact: <Phone size={18} />,
};

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const pathname = usePathname();
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close sidebar with exit animation
  const closeSidebar = useCallback(() => {
    setClosing(true);
    // Fallback: force close after animation duration if onAnimationEnd doesn't fire
    exitTimerRef.current = setTimeout(() => {
      setClosing(false);
      setOpen(false);
    }, 350);
  }, []);

  // After exit animation ends, actually close
  const handleExitEnd = useCallback(() => {
    // Only act when closing — ignore enter animation end events
    if (!closing) return;
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    setClosing(false);
    setOpen(false);
  }, [closing]);

  // Close sidebar on route change (instant, no exit animation)
  useEffect(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    setClosing(false);
    setOpen(false);
  }, [pathname]);

  // Listen for custom open event (from navbar hamburger on mobile)
  useEffect(() => {
    const handler = () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setClosing(false);
      setOpen(true);
    };
    window.addEventListener('open-sidebar', handler);
    return () => window.removeEventListener('open-sidebar', handler);
  }, []);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Trigger exit animation on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !closing) closeSidebar();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, closing, closeSidebar]);

  const isOpen = open || closing;

  return (
    <>
      {/* Sidebar Toggle Button — visible on PC only (center-left).
          On mobile, the navbar hamburger triggers the sidebar via custom event. */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="hidden md:flex fixed left-5 top-1/2 -translate-y-1/2 z-[9970] h-10 w-10 items-center justify-center rounded-full border border-[var(--c-border-subtle)] bg-[var(--c-gold-bg-alpha)] backdrop-blur-md transition-all duration-300 hover:border-[#C9A96E]/50 hover:bg-[var(--c-surface-hover)] hover:scale-110 cursor-pointer group"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
          aria-label="Open navigation sidebar"
        >
          <div className="flex flex-col items-center gap-[4px] group-hover:gap-[6px] transition-all duration-300">
            <span className="block h-[1.5px] w-4 rounded-full transition-colors duration-300" style={{ backgroundColor: GOLD }} />
            <span className="block h-[1.5px] w-3 rounded-full transition-colors duration-300" style={{ backgroundColor: `${GOLD}88` }} />
            <span className="block h-[1.5px] w-4 rounded-full transition-colors duration-300" style={{ backgroundColor: GOLD }} />
          </div>
        </button>
      )}

      {/* Backdrop overlay — CSS animation */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm ${closing ? 'sidebar-overlay-exit' : 'sidebar-overlay-enter'}`}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar panel — CSS animation */}
      {isOpen && (
        <aside
          className={`fixed top-0 left-0 bottom-0 z-[10002] w-[280px] sm:w-[300px] flex flex-col overflow-hidden ${closing ? 'sidebar-panel-exit' : 'sidebar-panel-enter'}`}
          style={{
            backgroundColor: 'var(--c-surface-card)',
            borderRight: `1px solid ${GOLD}22`,
            boxShadow: `4px 0 40px rgba(0,0,0,0.3), 0 0 80px ${GOLD}08`,
          }}
          onAnimationEnd={handleExitEnd}
        >
          {/* Header — Logo + Close */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: `${GOLD}22` }}>
            <Link href="/" onClick={closeSidebar} className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
              <Image src="/my-logo.webp" alt="Logo" width={100} height={100} priority className="h-12 w-auto object-contain" />
            </Link>
            <button
              onClick={closeSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--c-border-subtle)] transition-all duration-300 hover:border-[#C9A96E]/40 hover:bg-[var(--c-surface-hover)] cursor-pointer"
              aria-label="Close sidebar"
            >
              <X size={16} style={{ color: GOLD }} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
            <div className="flex flex-col gap-0.5">
              {NAV_LINKS.map((link, idx) => {
                const isActive = link.href === pathname;
                return (
                  <div
                    key={link.label}
                    className="sidebar-item-enter"
                    style={{ animationDelay: closing ? '0s' : `${idx * 0.04}s` }}
                  >
                    <Link
                      href={link.href}
                      onClick={closeSidebar}
                      className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-300"
                      style={{
                        backgroundColor: isActive ? `${GOLD}15` : 'transparent',
                        borderLeft: isActive ? `2px solid ${GOLD}` : '2px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = `${GOLD}08`;
                          e.currentTarget.style.borderLeftColor = `${GOLD}66`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderLeftColor = 'transparent';
                        }
                      }}
                    >
                      <span
                        className="flex items-center justify-center transition-colors duration-300"
                        style={{ color: isActive ? GOLD : 'var(--c-text-ghost)' }}
                      >
                        {SIDEBAR_ICONS[link.label] || <ChevronRight size={18} />}
                      </span>
                      <span
                        className="text-sm tracking-wider uppercase flex-1 transition-colors duration-300"
                        style={{
                          color: isActive ? GOLD : 'var(--c-text-secondary)',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {link.label}
                      </span>
                      {/* Active dot — CSS transition instead of framer-motion layoutId */}
                      {isActive && (
                        <div
                          className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                          style={{ backgroundColor: GOLD }}
                        />
                      )}
                    </Link>
                  </div>
                );
              })}

              {/* Divider before utility links */}
              <div className="my-2 mx-3 h-[1px]" style={{ backgroundColor: `${GOLD}22` }} />

              {/* Share button */}
              <div
                className="sidebar-item-enter"
                style={{ animationDelay: closing ? '0s' : `${NAV_LINKS.length * 0.04}s` }}
              >
                <button
                  onClick={() => { closeSidebar(); window.dispatchEvent(new CustomEvent('open-share-dialog')); }}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 transition-all duration-300"
                  style={{ borderLeft: '2px solid transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${GOLD}08`;
                    e.currentTarget.style.borderLeftColor = `${GOLD}66`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }}
                >
                  <span className="flex items-center justify-center" style={{ color: 'var(--c-text-ghost)' }}>
                    <Share2 size={18} />
                  </span>
                  <span className="text-sm tracking-wider uppercase flex-1" style={{ color: 'var(--c-text-secondary)' }}>
                    Share
                  </span>
                </button>
              </div>

              {/* Search button */}
              <div
                className="sidebar-item-enter"
                style={{ animationDelay: closing ? '0s' : `${(NAV_LINKS.length + 1) * 0.04}s` }}
              >
                <button
                  onClick={() => { closeSidebar(); window.dispatchEvent(new CustomEvent('open-search')); }}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 transition-all duration-300"
                  style={{ borderLeft: '2px solid transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${GOLD}08`;
                    e.currentTarget.style.borderLeftColor = `${GOLD}66`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }}
                >
                  <span className="flex items-center justify-center" style={{ color: 'var(--c-text-ghost)' }}>
                    <Search size={18} />
                  </span>
                  <span className="text-sm tracking-wider uppercase flex-1" style={{ color: 'var(--c-text-secondary)' }}>
                    Search
                  </span>
                </button>
              </div>


            </div>
          </nav>

          {/* Footer — Brand tagline */}
          <div className="px-5 py-4 border-t" style={{ borderColor: `${GOLD}15` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[1px] flex-1" style={{ backgroundColor: `${GOLD}33` }} />
              <span className="text-[8px] tracking-[0.3em] uppercase" style={{ color: `${GOLD}55` }}>
                Architecture & Engineering
              </span>
              <div className="h-[1px] flex-1" style={{ backgroundColor: `${GOLD}33` }} />
            </div>
            <p className="text-center text-[9px] tracking-wider" style={{ color: 'var(--c-text-ghost)' }}>
              20 Years · 150+ Projects · 6+ Countries
            </p>
          </div>
        </aside>
      )}
    </>
  );
}
