'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

import Image from 'next/image';
import { experiences } from '@/lib/portfolio-data';
import { GOLD } from '@/components/shared/constants';
import SectionHeading from '@/components/shared/SectionHeading';
import { ChevronUp, ChevronDown } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  Consulting: '#C9A96E',
  'Project Management': '#8B7355',
  Freelance: '#A0A0A0',
  Management: '#C9A96E',
  Design: '#D4AF37',
};

function TimelineItem({ exp, index }: { exp: typeof experiences[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const isLeft = index % 2 === 0;
  const dotColor = TYPE_COLORS[exp.type] || GOLD;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className={`relative flex items-start gap-6 md:gap-0 ${
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* Content card with logo inside */}
      <div className={`ml-3 w-[calc(100%-24px)] md:ml-0 md:w-[calc(50%-30px)] ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
        <div className="rounded-lg border border-[var(--c-border-subtle)] p-4 sm:p-5 transition-all duration-300 hover:border-[#C9A96E]33" style={{ backgroundColor: 'var(--c-surface-dark)' }}>
          {/* Top row: type badge + logo */}
          <div className={`flex items-center gap-2 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
            <span className="text-[10px] tracking-widest uppercase" style={{ color: dotColor }}>
              {exp.type}
            </span>
            {exp.logo && (
              <div className={`relative h-7 w-14 sm:h-8 sm:w-16 shrink-0 rounded bg-white p-1 ${isLeft ? 'md:ml-0 md:mr-auto' : 'md:mr-0 md:ml-auto'}`}>
                <Image src={exp.logo} alt={exp.company} fill className="object-contain" sizes="64px" />
              </div>
            )}
          </div>
          <h3 className="mt-1 font-[family-name:var(--font-playfair)] text-base font-semibold text-[var(--c-text-primary)] sm:text-lg">
            {exp.company}
          </h3>
          <p className="mt-0.5 text-sm font-medium" style={{ color: GOLD }}>
            {exp.role}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--c-text-faint)]">
            <span>{exp.period}</span>
            <span>•</span>
            <span>{exp.location}</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--c-text-muted)]">
            {exp.description}
          </p>
        </div>
      </div>

      {/* Timeline dot */}
      <div
        className="absolute left-1 top-2 z-10 h-2.5 w-2.5 -translate-x-[5px] rounded-full border-2 md:left-1/2 md:-translate-x-[5px]"
        style={{ borderColor: dotColor, backgroundColor: dotColor + '44' }}
      />
    </motion.div>
  );
}


export default function ExperienceSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [showAllJourney, setShowAllJourney] = useState(false);
  const VISIBLE_COUNT = 5;

  return (
    <section id="experience" className="py-16 px-4 sm:py-24 sm:px-6 bg-[var(--bg-secondary)]">
      <div className="mx-auto max-w-5xl">
        <SectionHeading title={'Professional Journey'} subtitle={'Career Timeline'} />

        <div ref={ref} className="relative">
          {/* Vertical gold line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute left-[11px] top-0 w-[1px] md:left-1/2 md:-translate-x-[0.5px]"
            style={{ backgroundColor: `${GOLD}44`, transformOrigin: 'top' }}
          />

          <div className="space-y-8 sm:space-y-12">
            {experiences.map((exp, index) => {
              if (!showAllJourney && index >= VISIBLE_COUNT) return null;
              return <TimelineItem key={index} exp={exp} index={index} />;
            })}
          </div>
        </div>

        {/* Show All / Show Less toggle */}
        {experiences.length > VISIBLE_COUNT && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-center"
          >
            <button
              onClick={() => setShowAllJourney(!showAllJourney)}
              className="flex items-center gap-2 rounded-full border px-6 py-2.5 text-xs tracking-wider uppercase transition-all duration-300 hover:scale-105"
              style={{
                borderColor: 'rgba(201,169,110,0.4)',
                color: GOLD,
                backgroundColor: 'rgba(201,169,110,0.08)',
              }}
            >
              {showAllJourney ? 'Show Less' : 'Show All Experience'}
              {showAllJourney ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// =============================================================================
// Project Timeline Section
// =============================================================================

