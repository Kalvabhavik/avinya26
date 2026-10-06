import { useState } from 'react';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Clock,
  MapPin,
  Anchor,
  Play,
} from 'lucide-react';
import { useFestival } from '../context/FestivalContext';
import { DAY_THEMES, ISLAND_EVENTS, ALL_EVENTS } from '../data/festivalData';
import type { DayId } from '../types';
import Footer from '../components/Footer';

export default function TimelinePage() {
  const { navigateTo } = useFestival();
  const [selectedDayTab, setSelectedDayTab] = useState<DayId>('day-1');

  const handleExploreDay = (dayId: DayId) => {
    // Redirects directly to the new Island & Ship Voyage Map page for that specific day
    navigateTo('voyage-map', dayId, 0);
  };

  return (
    <div className="bg-[#0b141e] text-[#f2e9d8] min-h-screen pt-24">
      {/* ========================================================================= */}
      {/* 1. TIMELINE HERO / HEADER                                                 */}
      {/* ========================================================================= */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-b border-[#c5a059]/20 overflow-hidden">
        {/* Background glow and subtle nautical chart grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(197, 160, 89, 0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#c5a059]/40 bg-[#1d3045]/60 text-[#c5a059] text-[10px] sm:text-xs font-bold tracking-[0.26em] uppercase">
            <Compass size={13} className="animate-spin" style={{ animationDuration: '15s' }} />
            <span>FESTIVAL CHRONICLES & TIMELINE</span>
          </div>

          <h1 className="font-['Cinzel'] text-4xl sm:text-6xl font-extrabold tracking-[0.16em] text-[#f2e9d8] uppercase drop-shadow-md">
            THE THREE WORLDS
          </h1>

          <div className="w-24 h-[2px] bg-[#c5a059] mx-auto my-3" />

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#f2e9d8]/80 leading-relaxed font-light">
            Every day of Avinya is charted as a distinct thematic world. Select a day and click{' '}
            <strong className="text-[#c5a059] font-medium uppercase tracking-wider">Explore</strong> to navigate its
            interactive island voyage map where the ship sails along the event route.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THREE DAY THEMES WITH EXPLORE BUTTONS                                  */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-16">
          {DAY_THEMES.map((day, idx) => {
            const islandCount = ISLAND_EVENTS[day.id]?.length || 5;
            const isReversed = idx % 2 === 1;

            return (
              <div
                key={day.id}
                className="bg-[#142333]/70 border border-[#c5a059]/30 hover:border-[#c5a059]/70 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 backdrop-blur-md group"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Visual / Video Preview Reel */}
                  <div className={`lg:col-span-6 relative min-h-[320px] lg:min-h-full overflow-hidden ${isReversed ? 'lg:order-2' : ''}`}>
                    {day.bannerVideo ? (
                      <video
                        src={day.bannerVideo}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1d3045] to-[#0b141e] flex items-center justify-center">
                        <Compass size={64} className="text-[#c5a059]/30" />
                      </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#142333] via-[#142333]/30 to-transparent lg:hidden" />
                    <div
                      className={`hidden lg:block absolute inset-0 bg-gradient-to-${
                        isReversed ? 'l' : 'r'
                      } from-transparent to-[#142333]`}
                    />

                    {/* Day Badge */}
                    <div className="absolute top-5 left-5 px-3 py-1.5 rounded-lg bg-[#0b141e]/80 border border-[#c5a059]/40 backdrop-blur-md text-[11px] font-bold font-mono tracking-widest text-[#c5a059] flex items-center gap-2">
                      <Anchor size={13} />
                      <span>DAY 0{day.dayNumber} // REALM {idx + 1}</span>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] font-mono tracking-widest text-white/70 bg-black/50 px-2.5 py-1 rounded backdrop-blur-sm">
                        {islandCount} ISLAND STOPS
                      </span>
                      <span className="text-[10px] font-mono tracking-widest text-[#c5a059] bg-black/50 px-2.5 py-1 rounded backdrop-blur-sm">
                        {day.date}
                      </span>
                    </div>
                  </div>

                  {/* Day Content & Lore */}
                  <div className={`lg:col-span-6 p-8 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 ${isReversed ? 'lg:order-1' : ''}`}>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] uppercase text-[#c5a059]">
                        <span>{day.themeKicker}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
                        <span>{day.subtitle}</span>
                      </div>

                      <h2 className="font-['Cinzel'] text-3xl sm:text-4xl font-extrabold tracking-[0.14em] text-[#f2e9d8] uppercase">
                        {day.name}
                      </h2>

                      <p className="text-xs sm:text-sm text-[#f2e9d8]/80 leading-relaxed font-light">
                        {day.lore}
                      </p>

                      {/* Flagship Itinerary preview */}
                      <div className="pt-2">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-[#c5a059] mb-2 flex items-center gap-1.5">
                          <Sparkles size={12} />
                          <span>FLAGSHIP EXPEDITIONS ON THIS DAY:</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {day.flagshipEvents.map((event) => (
                            <span
                              key={event}
                              className="px-2.5 py-1 rounded-md bg-[#0b141e]/80 border border-white/10 text-[10px] text-[#f2e9d8]/90 font-medium tracking-wide"
                            >
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* The Crucial User-Requested "Explore" Button */}
                    <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="text-[11px] text-[#f2e9d8]/60 flex items-center gap-2">
                        <Clock size={13} className="text-[#c5a059]" />
                        <span>Morning to Midnight Schedule</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExploreDay(day.id)}
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#b65e3c] to-[#d8815e] hover:from-[#c56d49] hover:to-[#e28e6c] text-[#f2e9d8] font-bold text-xs tracking-[0.24em] uppercase transition-all shadow-xl shadow-[#b65e3c]/20 border border-[#e5b79e]/30 flex items-center justify-center gap-3 transform hover:-translate-y-0.5 group/btn"
                        aria-label={`Explore ${day.name} Voyage Map`}
                      >
                        <Compass size={16} className="text-[#f2e9d8] group-hover/btn:rotate-45 transition-transform" />
                        <span>EXPLORE</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MASTER ITINERARY SCHEDULE TABLE (SCAN ALL 3 DAYS)                      */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#c5a059]/20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold tracking-[0.28em] uppercase text-[#c5a059] mb-2 font-['Cinzel']">
              MASTER ITINERARY
            </p>
            <h2 className="font-['Cinzel'] text-2xl sm:text-3xl font-extrabold tracking-[0.14em] text-[#f2e9d8] uppercase">
              ALL EVENTS CHRONOLOGY
            </h2>
          </div>

          {/* Day Filter Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#142333] border border-white/10">
            {DAY_THEMES.map((day) => (
              <button
                key={day.id}
                type="button"
                onClick={() => setSelectedDayTab(day.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                  selectedDayTab === day.id
                    ? 'bg-[#c5a059] text-[#0b141e] shadow-md font-bold'
                    : 'text-[#f2e9d8]/70 hover:text-[#f2e9d8] hover:bg-white/5'
                }`}
              >
                Day 0{day.dayNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-[#142333]/50 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
          {ALL_EVENTS.filter((e) => e.dayId === selectedDayTab).map((event) => (
            <div
              key={event.id}
              className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#142333]/90 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#1d3045] text-[#c5a059] border border-[#c5a059]/30">
                    {event.category}
                  </span>
                  <span className="text-xs font-mono text-[#c5a059]">
                    {event.timing}
                  </span>
                </div>
                <h4 className="font-['Cinzel'] text-base font-bold text-[#f2e9d8]">
                  {event.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-[#f2e9d8]/60 font-light">
                  <MapPin size={13} className="text-[#c5a059]" />
                  <span>{event.venue}</span>
                  <span className="text-white/20">·</span>
                  <span>Prize: {event.prizePool}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleExploreDay(event.dayId)}
                  className="px-4 py-2 rounded-lg bg-[#1d3045] hover:bg-[#c5a059] hover:text-[#0b141e] text-xs font-semibold tracking-wider uppercase border border-[#c5a059]/40 transition-colors flex items-center gap-2"
                >
                  <Play size={11} />
                  <span>SEE ON VOYAGE MAP</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
