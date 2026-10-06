import { useState, useEffect, useRef } from 'react';
import {
  Compass,
  ArrowLeft,
  ArrowRight,
  Anchor,
  Clock,
  MapPin,
  Sparkles,
  Play,
  Pause,
  Award,
  Bookmark,
  Share2,
} from 'lucide-react';
import { useFestival } from '../context/FestivalContext';
import { DAY_THEMES, ISLAND_EVENTS } from '../data/festivalData';
import type { DayId } from '../types';
import Footer from '../components/Footer';

export default function VoyageMapPage() {
  const {
    activeDayId,
    setActiveDayId,
    activeIslandIndex,
    sailToIsland,
    nextIsland,
    prevIsland,
    isSailing,
    isAutoCruising,
    toggleAutoCruise,
    toggleBookmark,
    bookmarkedEventIds,
    navigateTo,
    showToast,
  } = useFestival();

  const currentTheme = DAY_THEMES.find((d) => d.id === activeDayId) || DAY_THEMES[0];
  const islands = ISLAND_EVENTS[activeDayId] || [];
  const currentIsland = islands[activeIslandIndex] || islands[0];

  const svgPathRef = useRef<SVGPathElement>(null);

  // Ship position (x, y) and heading angle (degrees)
  const [shipPos, setShipPos] = useState({ x: 140, y: 360, angle: 25 });
  const [pathProgress, setPathProgress] = useState(0);

  // Archipelago waypoints on the 1000x560 map canvas
  const waypoints = [
    { x: 140, y: 360 },
    { x: 350, y: 170 },
    { x: 580, y: 400 },
    { x: 770, y: 190 },
    { x: 920, y: 350 },
  ];

  // SVG curved path connecting all 5 islands in sequence
  const voyagePathD =
    'M 140 360 C 230 220, 270 170, 350 170 C 440 170, 500 400, 580 400 C 660 400, 700 190, 770 190 C 830 190, 870 350, 920 350';

  // Smoothly animate the ship along the SVG curve when activeIslandIndex changes
  useEffect(() => {
    const path = svgPathRef.current;
    if (!path) return;

    const totalLength = path.getTotalLength();
    // Island index fractions: 0, 0.25, 0.50, 0.75, 1.0
    const targetFraction = islands.length > 1 ? activeIslandIndex / (islands.length - 1) : 0;
    const targetLength = targetFraction * totalLength;

    let startLength = pathProgress * totalLength;
    let startTime: number | null = null;
    const duration = isSailing ? 650 : 400;

    let animFrame: number;

    const animateShip = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Ease in-out cubic
      const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentL = startLength + (targetLength - startLength) * ease;
      const pt = path.getPointAtLength(Math.max(0, Math.min(totalLength, currentL)));

      // Calculate tangent angle for ship rotation
      const nextL = Math.min(totalLength, currentL + 4);
      const nextPt = path.getPointAtLength(nextL);
      const dx = nextPt.x - pt.x;
      const dy = nextPt.y - pt.y;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      setShipPos({ x: pt.x, y: pt.y, angle });

      if (progress < 1) {
        animFrame = requestAnimationFrame(animateShip);
      } else {
        setPathProgress(targetFraction);
      }
    };

    animFrame = requestAnimationFrame(animateShip);
    return () => cancelAnimationFrame(animFrame);
  }, [activeIslandIndex, islands.length, isSailing]);

  const handleShareVoyage = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Voyage Map URL copied to clipboard!', 'gold');
    }
  };

  const isBookmarked = bookmarkedEventIds.includes(currentIsland?.id || '');

  return (
    <div className="bg-[#0b141e] text-[#f2e9d8] min-h-screen pt-20">
      {/* ========================================================================= */}
      {/* 1. TOP NAV / CONTROLS BAR                                                 */}
      {/* ========================================================================= */}
      <section className="bg-[#142333]/90 border-b border-[#c5a059]/25 py-4 px-4 sm:px-6 lg:px-8 sticky top-[69px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Back button and Current Day Lore */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo('timeline')}
              className="p-2 rounded-lg bg-[#1d3045] hover:bg-[#c5a059] hover:text-[#0b141e] text-[#f2e9d8] border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase"
              aria-label="Back to Timeline"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">TIMELINE</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase font-bold">
                  DAY 0{currentTheme.dayNumber} REALM:
                </span>
                <span className="font-['Cinzel'] text-sm sm:text-base font-bold text-[#f2e9d8] uppercase">
                  {currentTheme.name}
                </span>
              </div>
              <p className="text-[10px] text-[#f2e9d8]/60 hidden sm:block">
                {currentTheme.subtitle} · {currentTheme.date}
              </p>
            </div>
          </div>

          {/* Day Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0b141e]/80 border border-white/10 self-start md:self-center overflow-x-auto max-w-full">
            {DAY_THEMES.map((theme) => {
              const active = theme.id === activeDayId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setActiveDayId(theme.id as DayId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap ${
                    active
                      ? 'bg-[#c5a059] text-[#0b141e] font-bold shadow-md'
                      : 'text-[#f2e9d8]/70 hover:text-[#f2e9d8] hover:bg-white/5'
                  }`}
                >
                  <span>DAY 0{theme.dayNumber}</span>
                  <span className="hidden lg:inline ml-1 text-[10px] opacity-80">({theme.name.split(' ')[0]})</span>
                </button>
              );
            })}
          </div>

          {/* Auto Cruise & Voyage Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAutoCruise}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                isAutoCruising
                  ? 'bg-[#b65e3c] border-[#e5b79e] text-[#f2e9d8] animate-pulse'
                  : 'bg-[#1d3045] border-white/10 text-[#f2e9d8]/80 hover:border-[#c5a059]'
              }`}
              title="Auto-cruise ship along the event route"
            >
              {isAutoCruising ? <Pause size={13} /> : <Play size={13} />}
              <span>{isAutoCruising ? 'PAUSE CRUISE' : 'AUTO SAIL'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareVoyage}
              className="p-2 rounded-lg bg-[#1d3045] hover:bg-white/10 border border-white/10 text-[#f2e9d8]/80 hover:text-[#c5a059] transition-colors"
              title="Share Voyage Route"
              aria-label="Share"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE NAUTICAL ARCHIPELAGO CANVAS / INTERACTIVE SHIP VOYAGE MAP          */}
      {/* ========================================================================= */}
      <section className="relative px-2 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-[#c5a059]/40 bg-[#07131e] shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
          {/* Ambient Ocean Waves Shimmer */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at center, rgba(49, 94, 99, 0.4) 0%, transparent 70%), radial-gradient(rgba(197, 160, 89, 0.2) 1px, transparent 1px)',
              backgroundSize: '100% 100%, 32px 32px',
            }}
          />

          {/* Compass Rose Watermark */}
          <div className="absolute top-6 right-6 opacity-25 pointer-events-none">
            <Compass size={140} className="text-[#c5a059] animate-[spin_60s_linear_infinite]" />
          </div>

          {/* Map Coordinates & Header HUD */}
          <div className="absolute top-5 left-6 z-20 flex flex-col pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase font-bold">
                VOYAGE COURSE // LIVE TELEMETRY
              </span>
            </div>
            <span className="text-xs font-['Cinzel'] tracking-wider text-[#f2e9d8]/90 font-bold">
              {currentTheme.name} ARCHIPELAGO
            </span>
            <span className="text-[9px] font-mono text-white/40 tracking-wider">
              LAT 15.3524° N · CURRENTS: {isSailing ? 'IN TRANSIT...' : 'ANCHORED AT ISLE'}
            </span>
          </div>

          {/* The Main Interactive SVG Archipelago Canvas */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] min-h-[380px] max-h-[580px]">
            <svg
              className="w-full h-full select-none"
              viewBox="0 0 1000 560"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Island Gradient */}
                <radialGradient id="islandGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c5a059" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#315e63" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>

                {/* Ocean Depth Gradient */}
                <radialGradient id="activeIslandAura" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#d8815e" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="#b65e3c" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>

                {/* Route Linear Gradient */}
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#315e63" />
                  <stop offset="50%" stopColor="#c5a059" />
                  <stop offset="100%" stopColor="#d8815e" />
                </linearGradient>

                {/* Filter for glowing beacons */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Ocean Depth Contour Rings */}
              <circle cx="500" cy="280" r="420" fill="none" stroke="#315e63" strokeWidth="0.6" strokeDasharray="6 8" opacity="0.2" />
              <circle cx="500" cy="280" r="280" fill="none" stroke="#315e63" strokeWidth="0.6" strokeDasharray="4 6" opacity="0.25" />

              {/* Latitude and Longitude Grid Lines */}
              <line x1="80" y1="200" x2="920" y2="200" stroke="#c5a059" strokeWidth="0.5" strokeDasharray="2 10" opacity="0.15" />
              <line x1="80" y1="380" x2="920" y2="380" stroke="#c5a059" strokeWidth="0.5" strokeDasharray="2 10" opacity="0.15" />
              <line x1="300" y1="60" x2="300" y2="500" stroke="#c5a059" strokeWidth="0.5" strokeDasharray="2 10" opacity="0.15" />
              <line x1="700" y1="60" x2="700" y2="500" stroke="#c5a059" strokeWidth="0.5" strokeDasharray="2 10" opacity="0.15" />

              {/* The Nautical Voyage Path (Dashed & Curved) */}
              <path
                ref={svgPathRef}
                d={voyagePathD}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="3.5"
                strokeDasharray="8 8"
                strokeLinecap="round"
                className="opacity-80"
              />

              {/* Waypoint Directional Wave Arrows along the course */}
              {[0.12, 0.38, 0.62, 0.88].map((fraction, i) => {
                const path = svgPathRef.current;
                if (!path) return null;
                const len = path.getTotalLength() * fraction;
                const p = path.getPointAtLength(len);
                return (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="2.5"
                    fill="#c5a059"
                    opacity="0.6"
                    className="animate-pulse"
                  />
                );
              })}

              {/* ------------------------------------------------------------- */}
              {/* ISLANDS (EACH REPRESENTS AN EVENT ON THIS DAY)                */}
              {/* ------------------------------------------------------------- */}
              {islands.map((island, index) => {
                const pt = waypoints[index] || { x: 100 + index * 180, y: 300 };
                const isActive = activeIslandIndex === index;

                return (
                  <g
                    key={island.id}
                    className="cursor-pointer transition-transform duration-300 group/island"
                    onClick={() => sailToIsland(index)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Island ${index + 1}: ${island.islandName} (${island.title})`}
                  >
                    {/* Glowing Aura if Active */}
                    {isActive && (
                      <>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="68"
                          fill="url(#activeIslandAura)"
                          className="animate-pulse"
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="45"
                          fill="none"
                          stroke="#c5a059"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          className="animate-[spin_10s_linear_infinite]"
                          style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                        />
                      </>
                    )}

                    {/* Island Ambient Glow */}
                    <circle cx={pt.x} cy={pt.y} r="38" fill="url(#islandGlow)" />

                    {/* Island Landmass Contour / Silhouette */}
                    <path
                      d={`M ${pt.x - 24} ${pt.y + 6} 
                          C ${pt.x - 30} ${pt.y - 12}, ${pt.x - 14} ${pt.y - 24}, ${pt.x + 2} ${pt.y - 22} 
                          C ${pt.x + 20} ${pt.y - 20}, ${pt.x + 28} ${pt.y - 4}, ${pt.x + 24} ${pt.y + 12} 
                          C ${pt.x + 18} ${pt.y + 24}, ${pt.x - 8} ${pt.y + 26}, ${pt.x - 24} ${pt.y + 6} Z`}
                      fill={isActive ? '#1d3045' : '#142333'}
                      stroke={isActive ? '#c5a059' : '#315e63'}
                      strokeWidth={isActive ? '2.5' : '1.5'}
                      filter="url(#glow)"
                      className="transition-all duration-300"
                    />

                    {/* Island Terrain Details: Palm trees / Citadel Icon */}
                    <g transform={`translate(${pt.x - 12}, ${pt.y - 14}) scale(0.8)`}>
                      <path
                        d="M 15 18 L 15 6 M 15 6 Q 8 2 5 7 M 15 6 Q 22 2 25 7 M 15 10 Q 7 8 7 14 M 15 10 Q 23 8 23 14"
                        stroke={isActive ? '#c5a059' : '#447e85'}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </g>

                    {/* Central Island Beacon / Lighthouse Lantern */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? 6 : 4}
                      fill={isActive ? '#e5b79e' : '#c5a059'}
                      stroke="#0b141e"
                      strokeWidth="1.5"
                    />

                    {/* Island Identifier Badge */}
                    <rect
                      x={pt.x - 28}
                      y={pt.y + 28}
                      width="56"
                      height="16"
                      rx="4"
                      fill={isActive ? '#b65e3c' : '#0b141e'}
                      stroke={isActive ? '#e5b79e' : '#c5a059'}
                      strokeWidth="1"
                    />
                    <text
                      x={pt.x}
                      y={pt.y + 39}
                      textAnchor="middle"
                      fill="#f2e9d8"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="1px"
                    >
                      ISLE 0{index + 1}
                    </text>

                    {/* Island Event Time Badge */}
                    <text
                      x={pt.x}
                      y={pt.y - 28}
                      textAnchor="middle"
                      fill={isActive ? '#c5a059' : '#f2e9d8'}
                      fontSize="10"
                      fontFamily="'Cinzel', Georgia, serif"
                      fontWeight="bold"
                      letterSpacing="0.5px"
                      className="drop-shadow-md"
                    >
                      {island.timeStart}
                    </text>

                    <text
                      x={pt.x}
                      y={pt.y - 41}
                      textAnchor="middle"
                      fill="#f2e9d8"
                      fontSize="9"
                      fontFamily="'Plus Jakarta Sans', sans-serif"
                      opacity={isActive ? 0.95 : 0.65}
                      className="transition-opacity"
                    >
                      {island.islandName}
                    </text>
                  </g>
                );
              })}

              {/* ------------------------------------------------------------- */}
              {/* THE ANIMATED VOYAGE SHIP                                      */}
              {/* ------------------------------------------------------------- */}
              <g
                transform={`translate(${shipPos.x}, ${shipPos.y}) rotate(${shipPos.angle})`}
                className="transition-transform duration-75 ease-out select-none pointer-events-none"
              >
                {/* Water Ripples / Wake Trail Behind the Ship Keel */}
                <ellipse cx="-20" cy="0" rx="14" ry="4" fill="none" stroke="#447e85" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                <ellipse cx="-32" cy="0" rx="20" ry="6" fill="none" stroke="#315e63" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />

                {/* Ship Keel / Wooden Hull */}
                <path
                  d="M -16 -7 
                     C -10 -8, 12 -8, 22 0 
                     C 12 8, -10 8, -16 7 
                     C -19 4, -19 -4, -16 -7 Z"
                  fill="#b65e3c"
                  stroke="#e5b79e"
                  strokeWidth="1.4"
                />

                {/* Deck Layer */}
                <path
                  d="M -12 -4 L 14 -4 L 17 0 L 14 4 L -12 4 Z"
                  fill="#1d3045"
                  stroke="#c5a059"
                  strokeWidth="0.8"
                />

                {/* Main Mast & Billowing White Sails */}
                {/* Main Mast crossbeam */}
                <line x1="2" y1="-12" x2="2" y2="12" stroke="#f2e9d8" strokeWidth="1.2" />
                {/* Billowing Main Sail */}
                <path
                  d="M 2 -11 C 9 -7, 9 7, 2 11 C 6 6, 6 -6, 2 -11 Z"
                  fill="#f7f1e5"
                  stroke="#0b141e"
                  strokeWidth="0.6"
                />

                {/* Fore Mast Sail */}
                <line x1="12" y1="-8" x2="12" y2="8" stroke="#f2e9d8" strokeWidth="1" />
                <path
                  d="M 12 -7 C 16 -4, 16 4, 12 7 C 14 3, 14 -3, 12 -7 Z"
                  fill="#f7f1e5"
                  stroke="#0b141e"
                  strokeWidth="0.5"
                />

                {/* Golden Pennant Flag atop the mast */}
                <path d="M 2 -12 L -6 -15 L 2 -9 Z" fill="#c5a059" />

                {/* Glowing Stern Lantern */}
                <circle cx="-16" cy="0" r="2.5" fill="#f7d070" filter="url(#glow)" />
              </g>
            </svg>
          </div>

          {/* Bottom Archipelago Navigation Controls */}
          <div className="border-t border-[#c5a059]/30 bg-[#091522] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Island Steps Pills */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
              {islands.map((island, idx) => {
                const isActive = activeIslandIndex === idx;
                return (
                  <button
                    key={island.id}
                    type="button"
                    onClick={() => sailToIsland(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#c5a059] text-[#0b141e] font-bold shadow-md'
                        : 'bg-[#142333] text-[#f2e9d8]/70 hover:bg-[#1d3045] hover:text-[#f2e9d8] border border-white/5'
                    }`}
                  >
                    <Anchor size={11} className={isActive ? 'text-[#0b141e]' : 'text-[#c5a059]'} />
                    <span>0{idx + 1}. {island.islandName}</span>
                  </button>
                );
              })}
            </div>

            {/* Previous / Next Island Sailing Arrows */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={prevIsland}
                className="px-3.5 py-1.5 rounded-lg bg-[#142333] hover:bg-[#c5a059] hover:text-[#0b141e] text-[#f2e9d8] border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase"
                title="Sail to Previous Island"
              >
                <ArrowLeft size={14} />
                <span>PREV ISLE</span>
              </button>

              <button
                type="button"
                onClick={nextIsland}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#b65e3c] to-[#d8815e] hover:from-[#c56d49] hover:to-[#e28e6c] text-[#f2e9d8] border border-[#e5b79e]/30 transition-all flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase shadow-md"
                title="Sail to Next Island"
              >
                <span>NEXT ISLE</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. EVENT LOGBOOK HUD (DOCKED ISLAND DETAILS)                              */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-[#142333]/80 border border-[#c5a059]/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Subtle Decorative Nautical Accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#c5a059]/10 to-transparent pointer-events-none rounded-bl-full" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Island Badge & Overview */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-md bg-[#b65e3c] text-[#f2e9d8] text-xs font-mono font-bold tracking-widest uppercase">
                  {currentIsland.islandCode}
                </span>

                <span className="px-3 py-1 rounded-md bg-[#1d3045] text-[#c5a059] text-xs font-bold tracking-wider uppercase border border-[#c5a059]/30 flex items-center gap-1.5">
                  <Compass size={13} />
                  <span>{currentIsland.islandName}</span>
                </span>

                <span className="px-3 py-1 rounded-md bg-white/5 text-[#f2e9d8]/80 text-xs font-semibold tracking-wider uppercase border border-white/10">
                  {currentIsland.category}
                </span>
              </div>

              <div>
                <h2 className="font-['Cinzel'] text-2xl sm:text-4xl font-extrabold tracking-[0.12em] text-[#f2e9d8] uppercase drop-shadow">
                  {currentIsland.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#c5a059] font-medium tracking-widest uppercase mt-1">
                  {currentIsland.subtitle}
                </p>
              </div>

              {/* Timing, Venue, Prize Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-[#0b141e]/80 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1d3045] flex items-center justify-center text-[#c5a059]">
                    <Clock size={16} />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#f2e9d8]/50 block">EVENT TIMING</span>
                    <span className="text-xs font-mono font-bold text-[#f2e9d8]">
                      {currentIsland.timeStart} — {currentIsland.timeEnd}
                    </span>
                  </div>
                </div>

                <div className="bg-[#0b141e]/80 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1d3045] flex items-center justify-center text-[#c5a059]">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#f2e9d8]/50 block">DOCK / VENUE</span>
                    <span className="text-xs font-medium text-[#f2e9d8] truncate block max-w-[140px]">
                      {currentIsland.venue}
                    </span>
                  </div>
                </div>

                <div className="bg-[#0b141e]/80 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1d3045] flex items-center justify-center text-[#c5a059]">
                    <Award size={16} />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#c5a059] block">PRIZE POOL</span>
                    <span className="text-xs font-bold text-[#f2e9d8]">
                      {currentIsland.prizePool}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="space-y-2 text-xs sm:text-sm text-[#f2e9d8]/85 leading-relaxed font-light">
                <p>{currentIsland.description}</p>
              </div>

              {/* Rules & Guidelines */}
              {currentIsland.rulesHighlight && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#c5a059] flex items-center gap-1.5">
                    <Sparkles size={12} />
                    <span>EXPEDITION RULES & PROTOCOLS:</span>
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#f2e9d8]/75">
                    {currentIsland.rulesHighlight.map((rule, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: Action Box & Day Itinerary Overview */}
            <div className="lg:col-span-4 bg-[#0b141e]/90 border border-white/10 rounded-2xl p-6 space-y-6">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#c5a059] uppercase block mb-1">
                  CURRENT ANCHORAGE
                </span>
                <h4 className="font-['Cinzel'] text-lg font-bold text-[#f2e9d8]">
                  ISLAND 0{activeIslandIndex + 1} OF 0{islands.length}
                </h4>
                <p className="text-[11px] text-[#f2e9d8]/60 mt-0.5">
                  Ship docked at {currentIsland.islandName}.
                </p>
              </div>

              {/* Bookmark & Register Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => toggleBookmark(currentIsland.id)}
                  className={`w-full py-3 rounded-xl border text-xs font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 ${
                    isBookmarked
                      ? 'bg-[#15342a] border-[#448e6c] text-[#d4f2e0]'
                      : 'bg-[#1d3045] border-[#c5a059]/40 hover:border-[#c5a059] text-[#f2e9d8]'
                  }`}
                >
                  <Bookmark size={15} className={isBookmarked ? 'fill-current text-[#448e6c]' : 'text-[#c5a059]'} />
                  <span>{isBookmarked ? 'BOOKMARKED IN ITINERARY' : 'SAVE TO VOYAGE LOG'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('events')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#b65e3c] to-[#d8815e] hover:from-[#c56d49] hover:to-[#e28e6c] text-[#f2e9d8] text-xs font-bold tracking-[0.2em] uppercase shadow-lg transition-all flex items-center justify-center gap-2 border border-[#e5b79e]/30"
                >
                  <span>VIEW ALL EVENTS</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Day Timeline Progress List */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#c5a059]">
                  DAY 0{currentTheme.dayNumber} ITINERARY LOG:
                </p>
                <div className="space-y-2">
                  {islands.map((isle, i) => (
                    <button
                      key={isle.id}
                      type="button"
                      onClick={() => sailToIsland(i)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                        activeIslandIndex === i
                          ? 'bg-[#1d3045] border-[#c5a059] text-[#f2e9d8]'
                          : 'bg-white/5 border-transparent text-[#f2e9d8]/65 hover:bg-white/10 hover:text-[#f2e9d8]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="font-mono text-[10px] text-[#c5a059]">0{i + 1}</span>
                        <span className="truncate font-medium">{isle.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#c5a059] shrink-0 ml-2">
                        {isle.timeStart}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
