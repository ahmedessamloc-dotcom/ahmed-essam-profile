'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// INP: Removed framer-motion from nav — CSS animation is cheaper
import { Menu, Share2, Search } from 'lucide-react';
import ThemeToggle from '@/components/shared/ThemeToggle';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { NAV_LINKS, GOLD } from '@/components/shared/constants';

const GlobalSearchOverlay = dynamic(() => import('@/components/shared/GlobalSearchOverlay'));

function useIsScrolled(threshold = 60) {
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrolledRef = useRef(false);
  useEffect(() => {
    const handler = () => {
      const scrolled = window.scrollY > threshold;
      if (scrolled !== isScrolledRef.current) {
        isScrolledRef.current = scrolled;
        setIsScrolled(scrolled);
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);
  return isScrolled;
}

export default function Navigation() {
  const isScrolled = useIsScrolled();
  const pathname = usePathname();
  const [logoOpen, setLogoOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Listen for open-search custom event (from sidebar)
  useEffect(() => {
    const handler = () => setSearchOpen(true);
    window.addEventListener('open-search', handler);
    return () => window.removeEventListener('open-search', handler);
  }, []);

  // Determine active section from pathname
  const activeSection = (() => {
    if (pathname === '/') return 'Home';
    const match = NAV_LINKS.find((l) => l.href === pathname);
    return match ? match.label : '';
  })();

  return (
    <>
    {/* INP: Using CSS animation instead of framer-motion for nav slide-in */}
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 nav-slide-in ${
        isScrolled ? 'bg-[var(--bg-nav)] backdrop-blur-md' : 'bg-transparent'
      }`}
      style={{ borderBottom: isScrolled ? `1px solid ${GOLD}` : '1px solid transparent' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" onClick={() => setLogoOpen(true)} className="flex items-center gap-2 transition-transform duration-500 logo-pulse-repeat hover:scale-105">
          <Image src="/my-logo.webp" alt="Logo" width={120} height={120} priority className="h-16 w-auto object-contain md:h-20" />
        </Link>

        <Dialog open={logoOpen} onOpenChange={setLogoOpen}>
          <DialogContent className="border-[#C9A96E]22 bg-[var(--bg-primary)] sm:max-w-md rounded-2xl p-0 overflow-hidden">
            <DialogTitle className="sr-only">Ahmed Essam — Project Manager — Design & Development Management</DialogTitle>
            <div className="relative flex flex-col items-center py-10 px-6">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #C9A96E 0%, transparent 70%)' }} />
              {/* INP: CSS animations instead of framer-motion for dialog content */}
              <div
                className="relative z-10 mb-6 logo-dialog-fade-in"
              >
                <Image src="/my-logo.webp" alt="Ahmed Essam Logo" width={200} height={200} className="h-36 w-auto object-contain sm:h-44 drop-shadow-[0_0_40px_rgba(201,169,110,0.3)]" />
              </div>
              <div
                className="relative z-10 text-center logo-dialog-text-in"
              >
                <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold" style={{ color: GOLD }}>
                  Ahmed Essam
                </h3>
                <p className="mt-2 text-xs sm:text-sm tracking-[0.15em] uppercase" style={{ color: 'var(--c-text-muted)' }}>
                  {'Project Manager — Design & Development Management'}
                </p>
                <div className="mt-4 mx-auto h-[1px] w-24" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)' }} />
                <p className="mt-4 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
                  {'20 Years of Excellence in Architecture, Design & Project Management across 6+ Countries'}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="nav-link-gold text-xs md:text-sm tracking-wider uppercase"
              style={{
                color: activeSection === link.label ? GOLD : 'var(--c-text-secondary)',
                fontWeight: activeSection === link.label ? 600 : 400,
              }}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-share-dialog'))}
            className="nav-link-gold flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
            style={{ color: 'var(--c-text-secondary)' }}
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="nav-link-gold flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
            style={{ color: 'var(--c-text-secondary)' }}
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </div>

        {/* Mobile: Theme toggle + Hamburger opens sidebar */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle gold />
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-sidebar'))}
            aria-label="Toggle menu"
          >
            <Menu size={24} color={GOLD} />
          </button>
        </div>
      </div>
    </nav>
    <GlobalSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
