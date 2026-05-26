'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, useDeferredValue } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Building2, Briefcase, Trophy, Star, Globe, MapPin, ArrowDown, X, ChevronRight } from 'lucide-react';
import {
  projects,
  awards,
  experiences,
  competencies,
  partners,
  mapLocations,
} from '@/lib/portfolio-data';
import { GOLD, globalSearchHints } from '@/components/shared/constants';
import type { SearchResultItem } from '@/components/shared/types';

export default function GlobalSearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [activeTab, setActiveTab] = useState<'all' | 'project' | 'experience' | 'award' | 'competency' | 'partner' | 'location'>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
      setQuery('');
      setActiveTab('all');
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    };
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = deferredQuery.toLowerCase().trim();
    if (!q) return [] as SearchResultItem[];

    const items: SearchResultItem[] = [];

    projects.forEach((p) => {
      const haystack = [p.title, p.category, p.location, p.client, p.description, p.year, p.role, p.budget, p.award]
        .filter(Boolean).join(' ').toLowerCase();
      if (haystack.includes(q)) {
        items.push({
          type: 'project',
          id: `project-${p.id}`,
          title: p.title,
          subtitle: p.category,
          meta: `${p.location} · ${p.year}`,
          sectionRoute: '/projects',
          image: p.images[0],
          extra: { 'project-id': String(p.id) },
        });
      }
    });

    experiences.forEach((exp, i) => {
      const haystack = [exp.company, exp.role, exp.description, exp.period, exp.location, exp.type]
        .filter(Boolean).join(' ').toLowerCase();
      if (haystack.includes(q)) {
        items.push({
          type: 'experience',
          id: `exp-${i}`,
          title: exp.role,
          subtitle: exp.company,
          meta: `${exp.period} · ${exp.location}`,
          sectionRoute: '/experience',
        });
      }
    });

    awards.forEach((aw, i) => {
      const haystack = [aw.title, aw.project, aw.type, aw.year]
        .filter(Boolean).join(' ').toLowerCase();
      if (haystack.includes(q)) {
        items.push({
          type: 'award',
          id: `award-${i}`,
          title: aw.project,
          subtitle: `${aw.title} — ${aw.type}`,
          meta: aw.year,
          sectionRoute: '/awards',
        });
      }
    });

    competencies.forEach((comp, ci) => {
      const categoryMatch = comp.category.toLowerCase().includes(q);
      comp.items.forEach((item, ii) => {
        if (categoryMatch || item.toLowerCase().includes(q)) {
          items.push({
            type: 'competency',
            id: `comp-${ci}-${ii}`,
            title: item,
            subtitle: comp.category,
            sectionRoute: '/competencies',
          });
        }
      });
    });

    partners.forEach((group) => {
      group.entries.forEach((entry, ei) => {
        const haystack = [entry.name, group.category, entry.logo || '']
          .filter(Boolean).join(' ').toLowerCase();
        if (haystack.includes(q)) {
          items.push({
            type: 'partner',
            id: `partner-${ei}-${entry.name}`,
            title: entry.name,
            subtitle: group.category,
            sectionRoute: '/network',
            image: entry.logo,
          });
        }
      });
    });

    mapLocations.forEach((loc, li) => {
      const haystack = [loc.city, loc.country, ...loc.projects].join(' ').toLowerCase();
      if (haystack.includes(q)) {
        items.push({
          type: 'location',
          id: `loc-${li}`,
          title: loc.city,
          subtitle: loc.country,
          meta: loc.projects.slice(0, 3).join(', ') + (loc.projects.length > 3 ? ` +${loc.projects.length - 3} more` : ''),
          sectionRoute: '/map',
        });
      }
    });

    return items;
  }, [deferredQuery]);

  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return results;
    return results.filter((r) => r.type === activeTab);
  }, [results, activeTab]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    results.forEach((r) => { counts[r.type] = (counts[r.type] || 0) + 1; });
    return counts;
  }, [results]);

  if (!open) return null;

  const tabs: { key: typeof activeTab; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <Search size={13} /> },
    { key: 'project', label: 'Projects', icon: <Building2 size={13} /> },
    { key: 'experience', label: 'Experience', icon: <Briefcase size={13} /> },
    { key: 'award', label: 'Awards', icon: <Trophy size={13} /> },
    { key: 'competency', label: 'Skills', icon: <Star size={13} /> },
    { key: 'partner', label: 'Network', icon: <Globe size={13} /> },
    { key: 'location', label: 'Locations', icon: <MapPin size={13} /> },
  ];

  const typeColors: Record<string, string> = {
    project: GOLD,
    experience: '#60A5FA',
    award: '#F59E0B',
    competency: '#34D399',
    partner: '#A78BFA',
    location: '#FB7185',
  };

  const typeLabels: Record<string, string> = {
    project: 'Project',
    experience: 'Experience',
    award: 'Award',
    competency: 'Skill',
    partner: 'Partner',
    location: 'Location',
  };

  const handleResultClick = (item: SearchResultItem) => {
    onClose();
    // Navigate to the section page; for projects also dispatch open-project-detail
    if (item.type === 'project' && item.extra?.['project-id']) {
      router.push(`/projects?projectId=${item.extra['project-id']}`);
      return;
    }
    router.push(item.sectionRoute);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col search-overlay-bg search-overlay-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-auto w-full max-w-2xl px-6 pt-24 sm:pt-32">
        <div
          className="relative search-input-in"
        >
          <Search size={20} style={{ color: GOLD, position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search everything — projects, experience, awards, skills, partners..."
            className="w-full rounded-2xl border-2 py-4 pl-14 pr-14 text-base text-foreground placeholder:text-muted-foreground outline-none transition-colors duration-300 search-input-bg"
            style={{ borderColor: '#C9A96E' }}
          />
          <button
            onClick={onClose}
            className="search-clear-btn absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors duration-200"
            style={{ color: 'var(--c-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="mt-4 flex flex-wrap items-center gap-2 search-overlay-in"
          style={{ animationDelay: '0.2s' }}
        >
          <span className="mr-1 text-xs tracking-wider" style={{ color: 'var(--c-text-muted)' }}>
            {query.trim()
              ? `${results.length} result${results.length !== 1 ? 's' : ''}`
              : 'Type to search across the entire site'}
          </span>
        </div>
        {query.trim() && results.length > 0 && (
          <div
            className="mt-3 flex flex-wrap gap-1.5 search-overlay-in"
            style={{ animationDelay: '0.25s' }}
          >
            {tabs.map((tab) => {
              const count = tab.key === 'all' ? results.length : (typeCounts[tab.key] || 0);
              if (tab.key !== 'all' && count === 0) return null;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] tracking-wide transition-all duration-200"
                  style={{
                    borderColor: activeTab === tab.key ? (typeColors[tab.key] || GOLD) : 'var(--c-border-subtle)',
                    backgroundColor: activeTab === tab.key ? (typeColors[tab.key] || GOLD) + '18' : 'transparent',
                    color: activeTab === tab.key ? (typeColors[tab.key] || GOLD) : 'var(--c-text-muted)',
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span
                    className="ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                    style={{
                      backgroundColor: activeTab === tab.key ? (typeColors[tab.key] || GOLD) + '30' : 'var(--c-text-micro)',
                      color: activeTab === tab.key ? (typeColors[tab.key] || GOLD) : 'var(--c-text-faint)',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mx-auto mt-6 w-full max-w-4xl flex-1 overflow-y-auto px-6 pb-24">
        <div className="grid gap-3 sm:grid-cols-2">
          {query.trim() && filteredResults.length === 0 ? (
            <div
              className="col-span-full flex flex-col items-center justify-center py-20 search-overlay-in"
            >
              <Search size={48} style={{ color: 'var(--c-text-micro)' }} />
              <p className="mt-4 text-sm" style={{ color: 'var(--c-text-muted)' }}>
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--c-text-ghost)' }}>
                Try searching for project names, skills, locations, or companies
              </p>
            </div>
          ) : !query.trim() ? (
            <div
              className="col-span-full flex flex-col items-center justify-center py-16 search-overlay-in"
            >
              <Search size={40} style={{ color: 'var(--c-text-micro)' }} />
              <p className="mt-4 text-sm" style={{ color: 'var(--c-text-faint)' }}>
                Start typing to search across the entire site
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {globalSearchHints.map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setQuery(hint)}
                    className="search-hint-btn rounded-full border px-3 py-1.5 text-[11px] tracking-wide transition-all duration-200"
                    style={{
                      borderColor: 'rgba(201,169,110,0.15)',
                      color: 'var(--c-text-muted)',
                    }}
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            filteredResults.map((item, index) => (
              <button
                key={item.id}
                className="search-result-card search-result-in group flex items-center gap-4 rounded-2xl border p-3 text-left transition-all duration-300 sm:p-4"
                style={{
                  backgroundColor: 'var(--c-surface-dark)',
                  borderColor: 'rgba(201,169,110,0.12)',
                  animationDelay: `${Math.min(index * 0.025, 0.5)}s`,
                }}
                onClick={() => handleResultClick(item)}
              >
                {item.image ? (
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl sm:h-20 sm:w-20"
                    style={{ backgroundColor: (typeColors[item.type] || GOLD) + '12' }}
                  >
                    {item.type === 'experience' && <Briefcase size={22} style={{ color: typeColors[item.type] }} />}
                    {item.type === 'award' && <Trophy size={22} style={{ color: typeColors[item.type] }} />}
                    {item.type === 'competency' && <Star size={22} style={{ color: typeColors[item.type] }} />}
                    {item.type === 'partner' && <Globe size={22} style={{ color: typeColors[item.type] }} />}
                    {item.type === 'location' && <MapPin size={22} style={{ color: typeColors[item.type] }} />}
                    {item.type === 'section' && <ArrowDown size={22} style={{ color: typeColors[item.type] }} />}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[9px] font-medium tracking-wider uppercase"
                    style={{ backgroundColor: (typeColors[item.type] || GOLD) + '18', color: typeColors[item.type] || GOLD }}
                  >
                    {typeLabels[item.type] || item.type}
                  </span>
                  <p className="mt-1 truncate text-sm font-medium text-[var(--c-text-primary)]">{item.title}</p>
                  {item.subtitle && (
                    <p className="mt-0.5 truncate text-[11px]" style={{ color: 'var(--c-text-muted)' }}>
                      {item.subtitle}
                    </p>
                  )}
                  {item.meta && (
                    <p className="mt-0.5 truncate text-[10px]" style={{ color: 'var(--c-text-faint)' }}>
                      {item.meta}
                    </p>
                  )}
                </div>
                <ChevronRight size={16} className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1" style={{ color: 'var(--c-text-faint)' }} />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
