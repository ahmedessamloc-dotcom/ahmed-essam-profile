'use client';

import React, { useRef, useMemo } from 'react';
import { useInView } from 'framer-motion';
import { Phone, Mail, Cake } from 'lucide-react';
import { LinkedinIcon } from '@/components/shared/CustomIcons';
import { aboutData, mapLocations } from '@/lib/portfolio-data';
import { GOLD, GOLD_LIGHT } from '@/components/shared/constants';
import SectionHeading from '@/components/shared/SectionHeading';
import Image from 'next/image';
import GoldLine from '@/components/shared/GoldLine';
import { ExternalLink } from 'lucide-react';

export default function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-50px' });
  // Dynamic stats computed from data
  const aboutStats = useMemo(() => {
    const cities = new Set(mapLocations.map((l) => l.city));
    const countries = new Set(mapLocations.map((l) => l.country));
    return [
      { value: 20, suffix: '+', label: 'Years Experience' },
      { value: 150, suffix: '+', label: 'Projects Completed' },
      { value: countries.size, suffix: '', label: 'Countries' },
      { value: cities.size, suffix: '', label: 'Cities' },
      { value: 1.5, suffix: 'B+', label: 'Portfolio Value (Last 10 Yrs)' },
    ];
  }, []);

  return (
    <section id="about" className="py-16 px-4 sm:py-24 sm:px-6 bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={'About Me'} subtitle={'Background & Expertise'} />

        <div ref={ref}>
          {/* Photo beside bio */}
          <div className="mt-4 grid gap-6 md:grid-cols-[280px_1fr] items-start">
            {/* Portrait — CSS animation replaces framer-motion, lazy loading replaces priority */}
            <div
              className={`relative mx-auto w-full max-w-[240px] md:mx-0 ${isInView ? 'about-portrait-in' : ''}`}
              style={{ opacity: isInView ? undefined : 0 }}
            >
              <div
                className="relative aspect-[3/4] overflow-hidden"
                style={{ border: `1px solid ${GOLD}33` }}
              >
                <Image
                  src={aboutData.portrait}
                  alt="Ahmed Essam Portrait"
                  fill
                  className="object-cover"
                  sizes="240px"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 border-b-2 border-r-2" style={{ borderColor: GOLD }} />
            </div>

            {/* Bio content — CSS animation replaces framer-motion */}
            <div
              className={`flex flex-col ${isInView ? 'about-bio-in' : ''}`}
              style={{ opacity: isInView ? undefined : 0 }}
            >
              <h3
                className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[var(--c-text-primary)] md:text-3xl"
              >
                {aboutData.name}
              </h3>
              <p className="mt-1 text-sm tracking-wider" style={{ color: GOLD }}>
                {aboutData.title}
              </p>

              <p className="mt-6 text-sm leading-relaxed text-[var(--c-text-secondary)]">
                {aboutData.bio}
              </p>

              {/* Birthday line */}
              <div className="mt-4 flex items-center gap-2">
                <Cake size={13} style={{ color: GOLD, opacity: 0.7 }} />
                <span className="text-xs tracking-wider" style={{ color: `${GOLD}99` }}>
                  {'Born 20 May 1982'}
                </span>
              </div>

              {/* Specialty badges — clickable to filter projects */}
              <div className="mt-6 flex flex-wrap gap-2">
                {aboutData.specialties.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('filter-projects', { detail: s }));
                      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="specialty-badge rounded-full border px-4 py-2 text-xs tracking-wider transition-all duration-300 cursor-pointer"
                    style={{
                      borderColor : 'var(--c-border-subtle)',
                      color : 'var(--c-text-secondary)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats — CSS animation replaces framer-motion */}
          <div
            ref={statsRef}
            className="mt-10 grid grid-cols-3 gap-4 sm:mt-12 sm:gap-6 sm:grid-cols-5"
          >
            {aboutStats.map((stat, idx) => (
              <div
                key={stat.label}
                className={`text-center ${statsInView ? 'about-stat-in' : ''}`}
                style={{ opacity: statsInView ? undefined : 0, animationDelay: statsInView ? `${idx * 0.12}s` : '0s' }}
              >
                <div
                  className="font-[family-name:var(--font-playfair)] text-2xl font-bold sm:text-3xl"
                  style={{ color: GOLD }}
                >
                  {stat.value}{stat.suffix}
                </div>
                <div className="mt-1 text-[10px] tracking-wider uppercase text-[var(--c-text-muted)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Contact info */}
          <GoldLine />
          <div className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2">
            <a
              href={`tel:${aboutData.phone.replace(/\s/g, '')}`}
              className="group flex items-center gap-3 rounded-lg border border-[var(--c-border-subtle)] p-3 sm:p-4 transition-all duration-500 hover:border-[#C9A96E]44"
              style={{ backgroundColor: 'var(--c-surface-dark)' }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: GOLD_LIGHT }}>
                <Phone size={16} style={{ color: GOLD }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] tracking-widest uppercase text-[var(--c-text-faint)]">Phone</p>
                <p className="mt-0.5 text-sm font-medium text-[var(--c-text-secondary)] transition-colors duration-300 group-hover:text-[var(--c-text-primary)]">{aboutData.phone}</p>
              </div>
              <ExternalLink size={12} className="ml-auto shrink-0 text-[var(--c-text-ghost)]" />
            </a>
            <a
              href={`mailto:${aboutData.email}`}
              className="group flex items-center gap-3 rounded-lg border border-[var(--c-border-subtle)] p-3 sm:p-4 transition-all duration-500 hover:border-[#C9A96E]44"
              style={{ backgroundColor: 'var(--c-surface-dark)' }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: GOLD_LIGHT }}>
                <Mail size={16} style={{ color: GOLD }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] tracking-widest uppercase text-[var(--c-text-faint)]">Email</p>
                <p className="mt-0.5 text-sm font-medium text-[var(--c-text-secondary)] transition-colors duration-300 group-hover:text-[var(--c-text-primary)]">{aboutData.email}</p>
              </div>
              <ExternalLink size={12} className="ml-auto shrink-0 text-[var(--c-text-ghost)]" />
            </a>
            <a
              href={`https://${aboutData.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg border border-[var(--c-border-subtle)] p-3 sm:p-4 transition-all duration-500 hover:border-[#C9A96E]44"
              style={{ backgroundColor: 'var(--c-surface-dark)' }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: GOLD_LIGHT }}>
                <LinkedinIcon size={16} style={{ color: GOLD }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] tracking-widest uppercase text-[var(--c-text-faint)]">LinkedIn</p>
                <p className="mt-0.5 truncate text-sm font-medium text-[var(--c-text-secondary)] transition-colors duration-300 group-hover:text-[var(--c-text-primary)]">{aboutData.linkedin}</p>
              </div>
              <ExternalLink size={12} className="ml-auto shrink-0 text-[var(--c-text-ghost)]" />
            </a>

          </div>
        </div>
      </div>
    </section>
  );
}
