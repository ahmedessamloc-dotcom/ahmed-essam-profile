'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { FileDown } from 'lucide-react';
import { GOLD, GOLD_LIGHT, scaleIn, staggerContainer } from '@/components/shared/constants';
import SectionHeading from '@/components/shared/SectionHeading';
import { Globe, ListChecks } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import dynamic from 'next/dynamic';

const QRCode = dynamic(() => import('qrcode.react').then(mod => ({ default: mod.QRCodeSVG })), { ssr: false });

export default function DownloadSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ url: string; name: string } | null>(null);
  const [expandedQR, setExpandedQR] = useState<string | null>(null);

  const downloadCards = [
    {
      title: 'Curriculum Vitae',
      subtitle: 'Ahmed_Essam_CV',
      fileName: 'Ahmed_Essam_CV.pdf',
      url: 'https://drive.google.com/uc?export=download&id=1gWqKYc0i9tVAoSJgN7PKoi1WLUGibiCP',
      qrUrl: 'https://drive.google.com/file/d/1gWqKYc0i9tVAoSJgN7PKoi1WLUGibiCP/view',
      icon: <FileDown size={28} style={{ color: GOLD }} />,
      btnText: 'Download CV',
    },
    {
      title: 'Portfolio',
      subtitle: 'Ahmed_Essam_Portfolio',
      fileName: 'Ahmed_Essam_Portfolio.pdf',
      url: 'https://drive.google.com/uc?export=download&id=16WWk7Lw-SY-wELQTL2-l_dw_dVuXlExz',
      qrUrl: 'https://drive.google.com/file/d/16WWk7Lw-SY-wELQTL2-l_dw_dVuXlExz/view',
      icon: <Globe size={28} style={{ color: GOLD }} />,
      btnText: 'Download Portfolio',
    },
    {
      title: 'Projects List',
      subtitle: 'Ahmed_Essam_Projects_List',
      fileName: 'Ahmed_Essam_Projects_List.pdf',
      url: 'https://drive.google.com/uc?export=download&id=164SZ9PbrOARqV8fpkCoVCWiWfjljVOVf',
      qrUrl: 'https://drive.google.com/file/d/164SZ9PbrOARqV8fpkCoVCWiWfjljVOVf/view',
      icon: <ListChecks size={28} style={{ color: GOLD }} />,
      btnText: 'Download Projects List',
    },
  ];

  const handleDownloadClick = useCallback((url: string, name: string) => {
    setPendingFile({ url, name });
    setConfirmOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    if (pendingFile) {
      const a = document.createElement('a');
      a.href = pendingFile.url;
      a.download = pendingFile.name;
      a.click();
    }
    setConfirmOpen(false);
    setPendingFile(null);
  }, [pendingFile]);

  const handleCancel = useCallback(() => {
    setConfirmOpen(false);
    setPendingFile(null);
  }, []);

  return (
    <section id="download" className="py-16 px-4 sm:py-24 sm:px-6 bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-4xl">
        <SectionHeading title={'Downloads'} subtitle={'CV, Portfolio & Projects List'} />

        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : {}}
          className="grid gap-4 sm:gap-6 sm:grid-cols-3"
        >
          {downloadCards.map((card) => {
            return (
              <motion.div
                key={card.fileName}
                variants={scaleIn}
                className="download-card group relative flex flex-col items-center gap-4 rounded-lg border border-[var(--c-border-subtle)] p-6 text-center transition-all duration-500 hover:border-[#C9A96E]44 sm:p-8"
                style={{ backgroundColor: 'var(--c-surface-dark)' }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 sm:h-16 sm:w-16"
                  style={{ backgroundColor: GOLD_LIGHT }}
                >
                  {card.icon}
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[var(--c-text-primary)] transition-colors duration-300 group-hover:text-[#C9A96E]">
                    {card.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleDownloadClick(card.url, card.fileName)}
                  className="download-btn flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium tracking-wider transition-all duration-300"
                  style={{
                    borderColor: `${GOLD}44`,
                    color: GOLD,
                  }}
                >
                  <FileDown size={14} />
                  {card.btnText}
                </button>

                {/* QR Code — scan to download on mobile */}
                <div className="mt-2 w-full">
                  <div
                    className="mx-auto flex cursor-pointer flex-col items-center rounded-xl p-2 transition-all duration-300 hover:scale-[1.02]"
                    style={{ backgroundColor: 'var(--c-surface-dark)', maxWidth: '140px' }}
                    onClick={() => setExpandedQR(expandedQR === card.fileName ? null : card.fileName)}
                  >
                    <QRCode
                      value={card.qrUrl}
                      size={100}
                      level="M"
                      fgColor="#0A0A0A"
                      bgColor="#ffffff"
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-[var(--c-text-ghost)]">
                    {'Scan with phone to download'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Expanded QR overlay dialog */}
        <Dialog open={!!expandedQR} onOpenChange={() => setExpandedQR(null)}>
          <DialogContent
            className="flex flex-col items-center border-[var(--c-border-subtle)] py-10 sm:py-14 bg-[var(--bg-primary)]"
          >
            <DialogTitle className="sr-only">QR Code — Download Document</DialogTitle>
            <DialogDescription className="sr-only">Scan this QR code with your phone camera to download the document</DialogDescription>
            {expandedQR && (() => {
              const card = downloadCards.find((c) => c.fileName === expandedQR);
              if (!card) return null;
              return (
                <>
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full mb-4"
                    style={{ backgroundColor: `${GOLD}22` }}
                  >
                    {card.icon}
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[var(--c-text-primary)] mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[var(--c-text-ghost)] mb-6">
                    {'Scan with your phone camera to download'}
                  </p>
                  <div className="rounded-2xl bg-white p-4 shadow-2xl">
                    <QRCode
                      value={card.qrUrl}
                      size={220}
                      level="M"
                      fgColor="#0A0A0A"
                      bgColor="#ffffff"
                    />
                  </div>
                  <p className="mt-5 text-[11px] text-[var(--c-text-micro)]">
                    {card.qrUrl}
                  </p>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-[11px] tracking-wider text-[var(--c-text-ghost)]"
        >
          {'Click to download or scan the QR code with your phone'}
        </motion.p>
      </div>

      {/* Download Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm border-[var(--c-border-subtle)] bg-[var(--bg-primary)] mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-playfair)] text-xl text-[var(--c-text-primary)]">
              {'Confirm Download'}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-[var(--c-text-muted)]">
              {'You are about to download:'}
            </DialogDescription>
            {pendingFile && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-[var(--c-border-subtle)] p-3" style={{ backgroundColor: 'var(--c-surface-dark)' }}>
                <FileDown size={20} style={{ color: GOLD }} />
                <div className="text-left">
                  <span className="text-sm font-medium text-[var(--c-text-primary)]">{pendingFile.name}</span>
                  <span className="text-[11px] text-[var(--c-text-faint)]">{'PDF Document'}</span>
                </div>
              </div>
            )}
          </DialogHeader>
          <div className="mt-2 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="rounded-full border border-[var(--c-border-subtle)] px-5 py-2 text-xs font-medium tracking-wider text-[var(--c-text-secondary)] transition-all duration-300 hover:border-[var(--c-border-subtle)] hover:text-[var(--c-text-primary)]"
            >
              {'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              className="download-btn rounded-full px-5 py-2 text-xs font-medium tracking-wider transition-all duration-300"
              style={{ backgroundColor: GOLD, color: 'var(--c-text-primary)' }}
            >
              {'Confirm Download'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// =============================================================================
// QR Code Panel
// =============================================================================
