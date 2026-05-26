'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2, MapPin, Briefcase, Trophy, Star, Globe,
  FileDown, Phone, User, Clock, ChevronRight,
} from 'lucide-react';
import { GOLD } from '@/components/shared/constants';
import HeroSection from '@/components/sections/HeroSection';

// INP: Removed framer-motion from grid cards — CSS animations are cheaper
// The stagger animation is now handled by CSS @keyframes with animation-delay

const sectionCards = [
  { label: 'About', href: '/about', icon: <User size={24} />, description: 'Professional background & specialties' },
  { label: 'Projects', href: '/projects', icon: <Building2 size={24} />, description: '150+ projects across 6+ countries' },
  { label: 'Timeline', href: '/timeline', icon: <Clock size={24} />, description: 'Project timeline & milestones' },
  { label: 'Map', href: '/map', icon: <MapPin size={24} />, description: 'Global project distribution' },
  { label: 'Experience', href: '/experience', icon: <Briefcase size={24} />, description: '20 years of professional experience' },
  { label: 'Awards', href: '/awards', icon: <Trophy size={24} />, description: 'Recognition & achievements' },
  { label: 'Competencies', href: '/competencies', icon: <Star size={24} />, description: 'Skills & expertise' },
  { label: 'Network', href: '/network', icon: <Globe size={24} />, description: 'Partners & collaborators' },
  { label: 'Download', href: '/download', icon: <FileDown size={24} />, description: 'CV, Portfolio & documents' },
  { label: 'Contact', href: '/contact', icon: <Phone size={24} />, description: 'Get in touch' },
];

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Quick Navigation Grid — INP optimized: CSS animations instead of framer-motion */}
      <section className="py-16 px-4 sm:py-24 sm:px-6 bg-[var(--bg-primary)]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center sm:mb-16 nav-grid-fade-in">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight text-[var(--c-text-primary)] sm:text-4xl md:text-5xl">
              Explore the Portfolio
            </h2>
            <div
              className="mx-auto mt-6 h-[2px] nav-grid-line-expand"
              style={{ backgroundColor: GOLD }}
            />
            <p className="mt-4 text-sm tracking-widest uppercase" style={{ color: GOLD }}>
              Navigate through each section
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {sectionCards.map((card, index) => (
              <div
                key={card.label}
                className="nav-card-fade-in"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <Link
                  href={card.href}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-[var(--c-border-subtle)] bg-[var(--c-gold-bg-alpha)] p-5 text-center transition-all duration-300 hover:border-[#C9A96E]/30 hover:bg-[var(--c-gold-bg-alpha)]"
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${GOLD}18` }}
                  >
                    <span style={{ color: GOLD }}>{card.icon}</span>
                  </div>
                  <h3 className="text-sm font-medium tracking-wide text-[var(--c-text-secondary)] group-hover:text-[var(--c-text-primary)]">
                    {card.label}
                  </h3>
                  <p className="text-[11px] leading-snug text-[var(--c-text-ghost)] group-hover:text-[var(--c-text-muted)] hidden sm:block">
                    {card.description}
                  </p>
                  <ChevronRight size={14} className="text-[var(--c-text-micro)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#C9A96E]" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
