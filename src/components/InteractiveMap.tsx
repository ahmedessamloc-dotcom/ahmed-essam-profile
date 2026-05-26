'use client';

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { mapLocations, projects, parentCategory, type Project } from '@/lib/portfolio-data';

// O(1) project lookup by title and by id instead of O(n) .find()
const projectByTitle = new Map(projects.map(p => [p.title, p]));
const projectById = new Map(projects.map(p => [p.id, p]));

// =============================================================================
// Category Color Theme — each category gets a unique glowing color
// =============================================================================

const CATEGORY_COLORS: Record<string, { main: string; glow: string; label: string }> = {
  'Hospitality':               { main: '#F59E0B', glow: 'rgba(245,158,11,0.25)',  label: '#FBBF24' },
  'Mega Projects':             { main: '#EF4444', glow: 'rgba(239,68,68,0.25)',   label: '#F87171' },
  'Educational':               { main: '#3B82F6', glow: 'rgba(59,130,246,0.25)',  label: '#60A5FA' },
  'Health':                    { main: '#10B981', glow: 'rgba(16,185,129,0.25)',  label: '#34D399' },
  'Renovation':                { main: '#F97316', glow: 'rgba(249,115,22,0.25)',  label: '#FB923C' },
  'Interior Design':           { main: '#EC4899', glow: 'rgba(236,72,153,0.25)',  label: '#F472B6' },
  'Urban Planning':            { main: '#8B5CF6', glow: 'rgba(139,92,246,0.25)',  label: '#A78BFA' },
  'Residential':               { main: '#06B6D4', glow: 'rgba(6,182,212,0.25)',   label: '#22D3EE' },
  'Commercial':                { main: '#14B8A6', glow: 'rgba(20,184,166,0.25)',  label: '#2DD4BF' },
  'Recreational & Social Club': { main: '#A855F7', glow: 'rgba(168,85,247,0.25)', label: '#C084FC' },
  'Industrial':                { main: '#6B7280', glow: 'rgba(107,114,128,0.25)', label: '#9CA3AF' },
  'Confidential':              { main: '#6366F1', glow: 'rgba(99,102,241,0.25)',  label: '#818CF8' },
};

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || { main: '#C9A96E', glow: 'rgba(201,169,110,0.25)', label: '#E8D5B0' };
}

// =============================================================================
// Types
// =============================================================================

interface ProjectMarker {
  projectId: number;
  title: string;
  category: string;
  year: string;
  award?: string;
  thumbnail: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

interface CareerMarker {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

interface InteractiveMapProps {
  onProjectClick: (p: Project) => void;
  activeCategory?: string;
}

// =============================================================================
// Glowing circle marker — colored by category
// =============================================================================

// Simplified marker — CSS-animated instead of SMIL for better compositor performance
function createGlowingCircleIcon(category: string, isAward?: boolean) {
  const colors = getCategoryColor(category);
  const color = colors.main;
  const glow = colors.glow;
  const size = 24;
  const half = size / 2;

  // Static SVG with CSS animation classes — no SMIL <animate> (main-thread overhead)
  const html = `<div class="map-marker-dot" style="--marker-color:${color}; --marker-glow:${glow}">
    <span class="map-marker-ring"></span>
    <span class="map-marker-core"></span>
    <span class="map-marker-highlight"></span>
  </div>`;

  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -half - 2],
  });
}

// =============================================================================
// Silver career-only marker (dim glowing dot)
// =============================================================================

function createCareerIcon() {
  const size = 19;
  const half = size / 2;
  const html = `<div class="map-career-dot">
    <span class="map-career-core"></span>
  </div>`;

  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -half - 2],
  });
}

const CAREER_ICON = createCareerIcon();

// =============================================================================
// Icon cache per category (avoid recreating SVGs on every render)
// =============================================================================

const iconCache = new Map<string, L.DivIcon>();

function getCategoryIcon(category: string, isAward?: boolean) {
  const key = `${category}_${isAward ? 'award' : 'normal'}`;
  if (!iconCache.has(key)) {
    iconCache.set(key, createGlowingCircleIcon(category, isAward));
  }
  return iconCache.get(key)!;
}

// =============================================================================
// Spread overlapping markers in a circle pattern
// =============================================================================

interface AnyMarker {
  lat: number;
  lng: number;
}

function applyMarkerOffsets(markers: AnyMarker[]): void {
  const groups = new Map<string, AnyMarker[]>();
  markers.forEach((m) => {
    const key = `${Math.round(m.lat * 100)}_${Math.round(m.lng * 100)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  });

  groups.forEach((group) => {
    if (group.length <= 1) return;
    const radius = Math.max(0.02, Math.sqrt(group.length) * 0.025);
    const angleStep = (2 * Math.PI) / group.length;
    group.forEach((m, i) => {
      const angle = i * angleStep - Math.PI / 2;
      m.lat += Math.cos(angle) * radius;
      m.lng += Math.sin(angle) * radius;
    });
  });
}

// =============================================================================
// Fit bounds on load / when filter changes
// =============================================================================

function FitBounds({ allMarkers }: { allMarkers: AnyMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (allMarkers.length === 0) return;
    const bounds = L.latLngBounds(allMarkers.map((m) => [m.lat, m.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
  }, [map, allMarkers]);
  return null;
}

// =============================================================================
// Map instance ref holder
// =============================================================================

function MapRefHolder({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

// =============================================================================
// Main InteractiveMap component
// =============================================================================

export default function InteractiveMap({ onProjectClick, activeCategory = 'All' }: InteractiveMapProps) {
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Close all Leaflet popups on the map
  const closeMapPopups = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.closePopup();
    }
  }, []);

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '',
      iconUrl: '',
      shadowUrl: '',
    });
  }, []);

  // Separate project markers and career-only markers, with category filtering
  const { projectMarkers, careerMarkers }: { projectMarkers: ProjectMarker[]; careerMarkers: CareerMarker[] } = useMemo(() => {
    const pMarkers: ProjectMarker[] = [];
    const cMarkers: CareerMarker[] = [];

    mapLocations.forEach((loc) => {
      // Filter projects by category if one is selected
      const filteredProjectNames = activeCategory === 'All'
        ? loc.projects
        : loc.projects.filter((pName) => {
            const found = projectByTitle.get(pName);
            return found && parentCategory(found.category) === activeCategory;
          });

      // If no projects match the filter, treat as career-only city
      if (filteredProjectNames.length === 0 && loc.projects.length === 0) {
        cMarkers.push({
          city: loc.city,
          country: loc.country,
          lat: loc.lat,
          lng: loc.lng,
        });
      } else if (filteredProjectNames.length === 0 && loc.projects.length > 0) {
        // City has projects but none match the filter — hide city entirely
        return;
      } else {
        filteredProjectNames.forEach((pName) => {
          const found = projectByTitle.get(pName);
          if (!found) return;
          pMarkers.push({
            projectId: found.id,
            title: found.title,
            category: found.category,
            year: found.year,
            award: found.award,
            thumbnail: found.images[0],
            city: loc.city,
            country: loc.country,
            lat: loc.lat,
            lng: loc.lng,
          });
        });
      }
    });

    return { projectMarkers: pMarkers, careerMarkers: cMarkers };
  }, [activeCategory]);

  // Apply offsets to all markers together
  const allMarkers = useMemo(() => {
    const combined: AnyMarker[] = [...projectMarkers, ...careerMarkers];
    applyMarkerOffsets(combined);
    return { projectMarkers: combined.slice(0, projectMarkers.length) as ProjectMarker[], careerMarkers: combined.slice(projectMarkers.length) as CareerMarker[] };
  }, [projectMarkers, careerMarkers]);

  // Combined list for FitBounds and zoom-extend
  const allLatLngs = useMemo(() => {
    return [...allMarkers.projectMarkers, ...allMarkers.careerMarkers] as AnyMarker[];
  }, [allMarkers]);

  const handleFitBounds = useCallback(() => {
    if (!mapInstanceRef.current || allLatLngs.length === 0) return;
    const bounds = L.latLngBounds(
      allLatLngs.map((m) => [m.lat, m.lng] as [number, number])
    );
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 5, animate: true });
  }, [allLatLngs]);

  const handleMapReady = useCallback((map: L.Map) => {
    mapInstanceRef.current = map;
  }, []);

  // Get the active category color for popup accents
  const activeFilterColor = activeCategory !== 'All' ? getCategoryColor(activeCategory) : null;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[26, 32]}
        zoom={4}
        minZoom={3}
        maxZoom={12}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={false}
        style={{ height: '100%', width: '100%', background: 'var(--bg-secondary)' }}
      >
        <TileLayer 
          url={isDark ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'}
        />
        <FitBounds allMarkers={allLatLngs} />
        <MapRefHolder onMapReady={handleMapReady} />

        {/* Project markers — colored glowing circles by category */}
        {allMarkers.projectMarkers.map((marker) => {
          const catColor = getCategoryColor(parentCategory(marker.category));
          const icon = getCategoryIcon(parentCategory(marker.category), !!marker.award);
          const accentColor = activeFilterColor || catColor;

          return (
            <Marker
              key={`p-${marker.projectId}-${marker.city}`}
              position={[marker.lat, marker.lng]}
              icon={icon}
            >
              <Popup maxWidth={260} minWidth={180} className="custom-gold-popup">
                <div style={{ fontFamily: 'system-ui, sans-serif' }}>
                  {/* Category color accent bar */}
                  <div style={{
                    height: '3px', borderRadius: '2px',
                    background: `linear-gradient(90deg, ${catColor.main}, ${catColor.glow})`,
                    marginBottom: '10px',
                  }} />
                  <div style={{ fontSize: '13px', fontWeight: 700, color: catColor.label, marginBottom: '1px' }}>
                    {marker.city}
                  </div>
                  <div style={{
                    fontSize: '10px', color: 'var(--c-text-muted)', marginBottom: '6px',
                    textTransform: 'uppercase', letterSpacing: '1px',
                  }}>
                    {marker.country}
                  </div>
                  {/* Category badge */}
                  <div style={{
                    display: 'inline-block', fontSize: '9px', fontWeight: 600,
                    color: catColor.main, backgroundColor: `${catColor.main}18`,
                    border: `1px solid ${catColor.main}33`,
                    borderRadius: '4px', padding: '2px 6px', marginBottom: '8px',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>
                    {marker.category.includes('/') ? marker.category.split('/').slice(-1)[0] : marker.category}
                  </div>
                  <div style={{
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, ${catColor.glow}, transparent)`,
                    marginBottom: '8px',
                  }} />
                  <button
                    className="map-project-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const proj = projectById.get(marker.projectId);
                      if (proj) {
                        closeMapPopups();
                        // Small delay to let Leaflet close popup & release focus before opening dialog
                        setTimeout(() => onProjectClick(proj), 50);
                      }
                    }}
                    style={{
                      borderColor: `${catColor.main}25`,
                    }}
                  >
                    <img src={marker.thumbnail} alt={marker.title} className="map-thumb" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="map-title">{marker.title}</div>
                      <div className="map-meta" style={{ color: catColor.label }}>
                        {marker.year}
                        {marker.award && (
                          <span style={{ color: '#FFD700', marginLeft: '6px' }}>
                            ★ Award
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Career-only markers (dim dots) — only shown when no category filter */}
        {allMarkers.careerMarkers.map((marker) => (
          <Marker
            key={`c-${marker.city}`}
            position={[marker.lat, marker.lng]}
            icon={CAREER_ICON}
          >
            <Popup maxWidth={220} minWidth={160} className="custom-gold-popup">
              <div style={{ fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#C9A96E', marginBottom: '1px' }}>
                  {marker.city}
                </div>
                <div style={{
                  fontSize: '10px', color: 'var(--c-text-muted)', marginBottom: '8px',
                  textTransform: 'uppercase', letterSpacing: '1px',
                }}>
                  {marker.country}
                </div>
                <div style={{
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.27), transparent)',
                  marginBottom: '8px',
                }} />
                <div style={{ fontSize: '11px', color: 'var(--c-text-faint)', lineHeight: '1.4' }}>
                  Career presence — professional experience in this city
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Zoom Extend Button */}
      <button
        onClick={handleFitBounds}
        title="Zoom to fit all markers"
        className="absolute top-2.5 right-2.5 z-[1000] flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: 'var(--c-surface-card)',
          borderColor: 'var(--border-accent)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Maximize2 size={16} style={{ color: '#C9A96E' }} />
      </button>
    </div>
  );
}
