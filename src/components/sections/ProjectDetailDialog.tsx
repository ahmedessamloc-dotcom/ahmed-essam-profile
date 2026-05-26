'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Building2, ChevronRight, ExternalLink, Trophy, Star, Globe, ZoomIn, MapPin, FileDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { projects, type Project } from '@/lib/portfolio-data';
import { GOLD, GOLD_LIGHT } from '@/components/shared/constants';
import Image from 'next/image';
import { Maximize2, Lock, ChevronLeft, KeyRound, UserCheck } from 'lucide-react';

// =============================================================================
// NONO Easter Egg — Hidden inside Ras Sidr project (id 39)
// =============================================================================
// A tiny lock icon is hidden at the bottom of the project detail.
// Click it → password prompt ("mahmadty")
// Correct password → name prompt ("What's your name?")
// Answer "nono" → full NONO reveal with particle burst
// =============================================================================

function NonoEasterEgg({ project }: { project: Project }) {
  const [revealed, setRevealed] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; angle: number; dist: number; size: number; delay: number }[]>([]);

  // Challenge state
  const [showChallenge, setShowChallenge] = useState(false);
  const [step, setStep] = useState<'password' | 'name'>('password');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (showChallenge && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showChallenge, step]);

  const handleLockClick = useCallback(() => {
    setShowChallenge(true);
    setStep('password');
    setInputValue('');
    setError('');
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'password') {
      if (inputValue.toLowerCase() === 'mahmadty') {
        setStep('name');
        setInputValue('');
        setError('');
      } else {
        setError("That's not it");
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
      }
    } else if (step === 'name') {
      if (inputValue.toLowerCase().trim() === 'nono') {
        setRevealed(true);
        setShowChallenge(false);
        // Generate gold particles
        const pts = Array.from({ length: 28 }, (_, i) => ({
          id: i,
          x: 50 + (Math.random() - 0.5) * 20,
          y: 50 + (Math.random() - 0.5) * 20,
          angle: (i / 28) * 360,
          dist: 70 + Math.random() * 90,
          size: 4 + Math.random() * 7,
          delay: Math.random() * 0.4,
        }));
        setParticles(pts);
      } else {
        setError("That's not the right name");
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
      }
    }
  }, [step, inputValue]);

  if (project.id !== 39) return null;

  return (
    <>
      {/* Hidden lock icon — tiny, bottom-right of the project detail */}
      {!revealed && (
        <div className="relative mt-6 flex items-center justify-end">
          <motion.button
            type="button"
            onClick={handleLockClick}
            className="group/lock flex items-center justify-center rounded-full p-1.5 transition-all duration-500 hover:bg-[#C9A96E]10"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Secret"
          >
            <Lock
              size={11}
              className="transition-all duration-500 group-hover/lock:text-[#C9A96E]"
              style={{ color: 'var(--c-text-micro)' }}
            />
          </motion.button>
        </div>
      )}

      {/* Challenge Modal */}
      <AnimatePresence>
        {showChallenge && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowChallenge(false); setError(''); }}
          >
            <motion.div
              className="relative w-[340px] overflow-hidden rounded-2xl border border-[#C9A96E]33 p-6"
              style={{
                background: 'linear-gradient(145deg, #111111 0%, #0A0A0A 100%)',
                boxShadow: '0 0 60px rgba(201,169,110,0.12), 0 0 120px rgba(201,169,110,0.05)',
              }}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Shimmer line at top */}
              <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)' }} />

              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-[#C9A96E]44 bg-[#C9A96E]10"
                  animate={{ boxShadow: ['0 0 0 rgba(201,169,110,0)', '0 0 20px rgba(201,169,110,0.2)', '0 0 0 rgba(201,169,110,0)'] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  {step === 'password' ? (
                    <UserCheck size={24} style={{ color: '#C9A96E' }} />
                  ) : (
                    <UserCheck size={24} style={{ color: '#C9A96E' }} />
                  )}
                </motion.div>
              </div>

              {/* Step indicator */}
              <div className="mb-4 flex items-center justify-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${step === 'password' ? 'bg-[#C9A96E] scale-125' : 'bg-[#C9A96E]/40'}`} />
                <div className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${step === 'name' ? 'bg-[#C9A96E] scale-125' : 'bg-[#C9A96E]/40'}`} />
              </div>

              {/* Title */}
              <h3 className="mb-1 text-center font-[family-name:var(--font-playfair)] text-lg font-semibold text-[var(--c-text-primary)]">
                {step === 'password' ? "What's my name?" : "What's your name?"}
              </h3>
              <p className="mb-5 text-center text-[11px] tracking-wide text-[var(--c-text-faint)]">
                {step === 'password' ? 'If you know me, you know this' : 'Tell me who you really are'}
              </p>

              {/* Input form */}
              <form onSubmit={handleSubmit}>
                <motion.div animate={shakeError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value); setError(''); }}
                    placeholder={step === 'password' ? 'My name' : 'Your name'}
                    className="w-full rounded-lg border bg-[var(--c-gold-bg-alpha)] px-4 py-3 text-sm text-[var(--c-text-primary)] placeholder-[var(--c-text-ghost)] outline-none transition-all duration-300 focus:border-[#C9A96E]66 focus:bg-[var(--c-gold-bg-alpha)]"
                    style={{ borderColor: error ? '#EF4444' : 'rgba(201,169,110,0.2)' }}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </motion.div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      className="mt-2 text-center text-xs text-red-400"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  className="mt-4 w-full rounded-lg py-2.5 text-sm font-medium tracking-wider text-black transition-all duration-300 hover:shadow-[0_0_24px_rgba(201,169,110,0.3)]"
                  style={{ backgroundColor: '#C9A96E' }}
                >
                  {step === 'password' ? 'Next' : 'Reveal'}
                </button>
              </form>

              {/* Cancel */}
              <button
                type="button"
                onClick={() => { setShowChallenge(false); setError(''); }}
                className="mt-3 w-full rounded-lg border border-[var(--c-border-subtle)] py-2 text-xs text-[var(--c-text-faint)] transition-all duration-300 hover:border-[var(--c-border-subtle)] hover:text-[var(--c-text-muted)]"
              >
                Cancel
              </button>

              {/* Decorative corner accents */}
              <div className="absolute top-3 left-3 h-3 w-3 border-t border-l border-[#C9A96E]33" />
              <div className="absolute top-3 right-3 h-3 w-3 border-t border-r border-[#C9A96E]33" />
              <div className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-[#C9A96E]33" />
              <div className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-[#C9A96E]33" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NONO Reveal */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative mt-6 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-[#C9A96E]33 p-8"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(201,169,110,0.08) 0%, rgba(10,10,10,0.95) 70%)',
            }}
          >
            {/* Gold particles */}
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  background: `radial-gradient(circle, #E8D5B0, #C9A96E)`,
                  boxShadow: `0 0 ${p.size * 2}px rgba(201,169,110,0.6)`,
                }}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.2, 1, 0.5],
                  x: [0, Math.cos((p.angle * Math.PI) / 180) * p.dist],
                  y: [0, Math.sin((p.angle * Math.PI) / 180) * p.dist],
                }}
                transition={{
                  duration: 1.8,
                  delay: p.delay,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* NONO text */}
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ scale: 0.18, opacity: 0 }}
              animate={{ scale: 0.6, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
            >
              <motion.span
                className="font-[family-name:var(--font-playfair)] text-3xl font-black tracking-[0.15em] sm:text-4xl nono-glow-text"
                style={{
                  background: 'linear-gradient(135deg, #C9A96E 0%, #E8D5B0 40%, #FFF8E7 55%, #E8D5B0 70%, #C9A96E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 16px rgba(201,169,110,0.5)) drop-shadow(0 0 40px rgba(201,169,110,0.2))',
                }}
                animate={{
                  opacity: [1, 0.7, 1],
                  scale: [1, 1.03, 1],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                I{' '}
                <motion.span
                  style={{
                    background: 'linear-gradient(135deg, #FF4D6D 0%, #FF1744 40%, #FF6B8A 55%, #FF1744 70%, #FF4D6D 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                    margin: '0 0.15em',
                  }}
                  animate={{
                    scale: [1, 1.15, 1],
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ❤
                </motion.span>
                {' '}NONO
              </motion.span>

              {/* Subtitle */}
              <motion.p
                className="mt-3 text-xs tracking-[0.4em] uppercase"
                style={{ color: 'rgba(201,169,110,0.6)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                You found the secret
              </motion.p>

              {/* Decorative gold line */}
              <motion.div
                className="mt-4 h-[1px]"
                style={{ background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)' }}
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
              />
            </motion.div>

            {/* Shimmer overlay — CSS-only for compositor performance */}
            <div
              className="absolute inset-0 pointer-events-none nono-shimmer"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(201,169,110,0.06) 45%, rgba(201,169,110,0.12) 50%, rgba(201,169,110,0.06) 55%, transparent 60%)',
                backgroundSize: '200% 100%',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ProjectDetailDialog({ project, open, onOpenChange, onOpenLightbox }: { project: Project | null; open: boolean; onOpenChange: (v: boolean) => void; onOpenLightbox?: (images: string[], index: number) => void }) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] sm:max-h-[90vh] overflow-y-auto border-[var(--c-border-subtle)] bg-[var(--bg-primary)] sm:max-w-4xl rounded-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-playfair)] text-2xl text-[var(--c-text-primary)]">
            {project.title}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 pt-2">
            <Badge
              className="border-[#C9A96E]66 bg-[#C9A96E]15 text-[#C9A96E]"
            >
              {project.category.includes('/') ? project.category.split('/').slice(-1)[0] : project.category}
            </Badge>
            <span className="text-xs text-[var(--c-text-muted)]">{project.year}</span>
            <span className="text-xs text-[var(--c-text-ghost)]">•</span>
            <span className="text-xs text-[var(--c-text-muted)]">{project.location}</span>
            {project.budget && (
              <>
                <span className="text-xs text-[var(--c-text-ghost)]">•</span>
                <span className="text-xs font-medium" style={{ color: GOLD }}>{project.budget}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Image gallery — clickable to enlarge (ALL projects look normal) */}
        {project.images.length > 0 ? (
          <>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {project.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className="group/img relative aspect-[16/10] cursor-zoom-in overflow-hidden border border-[var(--c-border-subtle)] transition-all duration-300 hover:border-[#C9A96E]44"
                  onClick={(e) => { e.stopPropagation(); onOpenLightbox?.(project.images, i); }}
                >
                  <Image
                    src={img}
                    alt={`${project.title} - Image ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  {/* Zoom overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover/img:bg-black/30">
                    <div className="flex items-center gap-2 rounded-full border border-[var(--c-border-subtle)] bg-black/60 px-3 py-1.5 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover/img:opacity-100">
                      <Maximize2 size={14} color="white" />
                      <span className="text-xs text-[var(--c-text-primary)]">{'Enlarge'}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-[10px] tracking-wider text-[var(--c-text-ghost)]">{'Click any image to enlarge'}</p>
          </>
        ) : (
          <div className="mt-2 flex items-center justify-center rounded-lg border border-dashed border-[var(--c-border-subtle)] p-8" style={{ backgroundColor: 'var(--c-surface-dark)' }}>
            <div className="text-center">
              <Lock size={24} className="mx-auto mb-2 text-[var(--c-text-micro)]" />
              <p className="text-xs tracking-wider text-[var(--c-text-ghost)]">{'CONFIDENTIAL — Images not available'}</p>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold tracking-widest uppercase" style={{ color: GOLD }}>
            {'Description'}
          </h4>
          <p className="text-sm leading-relaxed text-[var(--c-text-secondary)]">{project.description}</p>
        </div>

        {/* Role & Scope */}
        <div className="mt-4 rounded-lg p-4" style={{ backgroundColor: GOLD_LIGHT }}>
          <h4 className="mb-2 text-xs font-semibold tracking-widest uppercase" style={{ color: GOLD }}>
            {'Role & Scope'}
          </h4>
          <p className="text-sm leading-relaxed text-[var(--c-text-secondary)]">{project.role}</p>
        </div>

        {/* Client */}
        <div className="mt-4 flex items-center gap-2">
          <Building2 size={14} style={{ color: GOLD }} />
          <span className="text-xs text-[var(--c-text-muted)]">{'Client:'}</span>
          <span className="text-xs text-[var(--c-text-secondary)]">{project.client}</span>
        </div>

        {/* Website & Portfolio Links */}
        {(project.websiteLink || project.portfolioLink) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {project.websiteLink && (
              <a
                href={project.websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--c-border-subtle)] px-3 py-2 text-xs transition-all duration-300 hover:border-[#C9A96E]44 hover:bg-[#C9A96E]08"
                style={{ color: 'var(--c-text-secondary)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Globe size={13} style={{ color: GOLD }} />
                {'Visit Website'}
                <ExternalLink size={10} style={{ color: GOLD }} />
              </a>
            )}
            {project.portfolioLink && (
              <a
                href={project.portfolioLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group/cta relative inline-flex items-center gap-2.5 rounded-xl border border-[#C9A96E]44 px-5 py-3 text-sm font-medium tracking-wide transition-all duration-500 hover:border-[#C9A96E]88 hover:shadow-[0_0_30px_rgba(201,169,110,0.15)] overflow-hidden"
                style={{ color: GOLD }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Shimmer sweep on hover */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#C9A96E]/10 to-transparent transition-transform duration-700 group-hover/cta:translate-x-full" />
                {/* Play icon circle */}
                <span className="flex items-center justify-center w-7 h-7 rounded-full border border-[#C9A96E]55 bg-[#C9A96E]10 transition-all duration-300 group-hover/cta:bg-[#C9A96E]20 group-hover/cta:border-[#C9A96E]88 group-hover/cta:scale-110">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: GOLD, marginLeft: '1px' }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="relative">{project.portfolioLinkLabel || 'View Portfolio'}</span>
                <ExternalLink size={12} className="transition-transform duration-300 group-hover/cta:translate-x-0.5" />
              </a>
            )}
          </div>
        )}

        {project.award && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#C9A96E]33 p-3">
            <Trophy size={16} style={{ color: GOLD }} />
            <span className="text-xs font-medium" style={{ color: GOLD }}>{project.award}</span>
          </div>
        )}

        {/* Hidden NONO easter egg — only for Ras Sidr (id 39) */}
        <NonoEasterEgg project={project} />
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Projects Section
// =============================================================================
