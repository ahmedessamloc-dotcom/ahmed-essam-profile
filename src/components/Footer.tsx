'use client';

import React from 'react';
import Image from 'next/image';
import { GOLD, SITE_LAUNCH_DATE } from '@/components/shared/constants';
import { Calendar } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t px-4 py-6 sm:px-6 sm:py-10 bg-[var(--bg-primary)]" style={{ borderColor: `${GOLD}33` }}>
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center">
        {/* Copyright */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--c-text-ghost)]">© 2026</span>
          <Image src="/my-logo.webp" alt="Ahmed Essam" width={160} height={48} className="h-10 w-auto object-contain opacity-30" />
          <span className="text-xs text-[var(--c-text-ghost)]">. All rights reserved.</span>
        </div>

        {/* Launch date */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={10} style={{ color: GOLD, opacity: 0.4 }} />
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: `${GOLD}55` }}>
              Launched {SITE_LAUNCH_DATE}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
