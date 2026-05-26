'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ThemeToggleProps {
  showLabel?: boolean;
  gold?: boolean;
}

export default function ThemeToggle({ showLabel = false, gold = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  if (!mounted) return <div className={showLabel ? 'w-auto h-8' : 'w-8 h-8'} />; // Prevent layout shift

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative flex items-center justify-center transition-all duration-300 hover:scale-110 ${
        showLabel ? 'gap-2 rounded-lg px-3 py-1.5' : 'rounded-full'
      }`}
      style={{ color: gold ? '#C9A96E' : 'var(--c-text-secondary)' }}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A96E')}
      onMouseLeave={(e) => (e.currentTarget.style.color = gold ? '#C9A96E' : 'var(--c-text-secondary)')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* CSS-only icon transition — no framer-motion AnimatePresence needed */}
      <span
        className="theme-icon-enter"
        key={isDark ? 'sun' : 'moon'}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </span>
      {showLabel && (
        <span className="text-sm tracking-wider uppercase" style={{ color: 'inherit' }}>
          Theme
        </span>
      )}
    </button>
  );
}
