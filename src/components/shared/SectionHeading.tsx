'use client';

import React, { useRef } from 'react';
import { useInView } from 'framer-motion';
import { GOLD } from '@/components/shared/constants';

export default function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="mb-10 text-center sm:mb-16">
      <h2
        className={`font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight text-[var(--c-text-primary)] sm:text-4xl md:text-5xl ${isInView ? 'section-heading-in' : ''}`}
        style={{ opacity: isInView ? undefined : 0 }}
      >
        {title}
      </h2>
      <div
        className={`mx-auto mt-6 h-[2px] ${isInView ? 'section-line-expand' : ''}`}
        style={{ backgroundColor: GOLD, width: isInView ? undefined : 0 }}
      />
      {subtitle && (
        <p
          className={`mt-4 text-sm tracking-widest uppercase ${isInView ? 'section-sub-in' : ''}`}
          style={{ color: GOLD, opacity: isInView ? undefined : 0 }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
