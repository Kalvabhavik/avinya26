import { useState } from 'react';
import {
  Compass,
  Search,
  MapPin,
  Award,
  Users,
  ArrowRight,
  X,
  Bookmark,
  CheckCircle2,
  Mail,
  Play,
} from 'lucide-react';
import { useFestival } from '../context/FestivalContext';
import { ALL_EVENTS } from '../data/festivalData';
import type { FestivalEvent, DayId } from '../types';
import Footer from '../components/Footer';

export default function EventsPage() {
  const {
    eventCategoryFilter,
    setEventCategoryFilter,
    eventDayFilter,
    setEventDayFilter,
    eventSearchQuery,
    setEventSearchQuery,
    navigateTo,
    toggleBookmark,
    bookmarkedEventIds,
    showToast,
  } = useFestival();

  const [selectedEventModal, setSelectedEventModal] = useState<FestivalEvent | null>(null);

  const categories = [
    'ALL',
    'CODING',
    'AI & ROBOTICS',
    'CULTURAL',
    'MUSIC',
    'DRAMA',
    'GAMING',
    'WORKSHOP',
    'PRO-SHOW',
  ];

  const days = [
    { label: 'ALL DAYS', val: 'ALL' },
    { label: 'DAY 01 (OUTPOST)', val: 'day-1' },
    { label: 'DAY 02 (PANDEMONIUM)', val: 'day-2' },
    { label: 'DAY 03 (CARNIVAL)', val: 'day-3' },
  ];

  // Filtering
  const filteredEvents = ALL_EVENTS.filter((event) => {
    // Category match
    if (eventCategoryFilter !== 'ALL' && event.category !== eventCategoryFilter) {
      return false;
    }
    // Day match
    if (eventDayFilter !== 'ALL' && event.dayId !== eventDayFilter) {
      return false;
    }
    // Search query match
    if (eventSearchQuery.trim() !== '') {
      const q = eventSearchQuery.toLowerCase();
      const matchTitle = event.title.toLowerCase().includes(q);
      const matchDesc = event.description.toLowerCase().includes(q);
      const matchTags = event.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  const handleRegisterEvent = (event: FestivalEvent) => {
    showToast(`Registration portal opened for ${event.title}!`, 'gold');
  };

  return (
    <div className="bg-[#0b141e] text-[#f2e9d8] min-h-screen pt-24">
      {/* Header */}
      <section className="relative py-14 px-4 sm:px-6 lg:px-8 border-b border-[#c5a059]/20 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#c5a059]/40 bg-[#1d3045]/60 text-[#c5a059] text-[10px] sm:text-xs font-bold tracking-[0.26em] uppercase">
            <Compass size={13} className="animate-spin" style={{ animationDuration: '15s' }} />
            <span>FESTIVAL COMPETITIONS & HAPPENINGS</span>
          </div>

          <h1 className="font-['Cinzel'] text-4xl sm:text-6xl font-extrabold tracking-[0.16em] text-[#f2e9d8] uppercase drop-shadow-md">
            EVENTS CATALOGUE
          </h1>

          <div className="w-24 h-[2px] bg-[#c5a059] mx-auto my-3" />

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#f2e9d8]/80 leading-relaxed font-light">
            Explore 25+ flagship hackathons, robotic battle arenas, dance wars, fashion runways, esports tournaments,
            and celebrity concerts across all three realms.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#142333]/80 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 backdrop-blur-md">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c5a059]" size={16} />
            <input
              type="text"
              value={eventSearchQuery}
              onChange={(e) => setEventSearchQuery(e.target.value)}
              placeholder="Search events by name, keyword, tech, or tags..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b141e] border border-white/10 text-xs text-[#f2e9d8] focus:border-[#c5a059] focus:outline-none transition-colors"
            />
          </div>

          {/* Day Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#c5a059] mr-2">
              DAY REALM:
            </span>
            {days.map((d) => (
              <button
                key={d.val}
                type="button"
                onClick={() => setEventDayFilter(d.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                  eventDayFilter === d.val
                    ? 'bg-[#c5a059] text-[#0b141e] font-bold shadow-md'
                    : 'bg-[#0b141e]/60 text-[#f2e9d8]/70 hover:text-[#f2e9d8] border border-white/5'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#c5a059] mr-2">
              CATEGORY:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setEventCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide uppercase transition-all ${
                  eventCategoryFilter === cat
                    ? 'bg-[#b65e3c] text-[#f2e9d8] font-bold'
                    : 'bg-white/5 text-[#f2e9d8]/65 hover:bg-white/10 hover:text-[#f2e9d8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mt-6 mb-4 px-2">
          <span className="text-xs font-mono text-[#f2e9d8]/60">
            SHOWING <strong className="text-[#c5a059]">{filteredEvents.length}</strong> EVENTS
          </span>
          <span className="text-xs font-mono text-[#f2e9d8]/60">
            TOTAL PRIZE POOL: <strong className="text-[#c5a059]">₹2,50,000+</strong>
          </span>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isBookmarked = bookmarkedEventIds.includes(event.id);

            return (
              <div
                key={event.id}
                className="bg-[#142333]/60 border border-[#c5a059]/25 hover:border-[#c5a059] rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#c5a059]/10 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Badge Row */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-[#1d3045] text-[#c5a059] text-[10px] font-bold tracking-widest uppercase border border-[#c5a059]/30">
                      {event.category}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(event.id)}
                      className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
                      aria-label="Bookmark"
                    >
                      <Bookmark
                        size={16}
                        className={isBookmarked ? 'fill-current text-[#448e6c]' : 'text-white/40'}
                      />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#c5a059] uppercase block mb-1">
                      DAY 0{event.dayNumber} · {event.timing}
                    </span>
                    <h3 className="font-['Cinzel'] text-lg font-bold text-[#f2e9d8] group-hover:text-[#c5a059] transition-colors">
                      {event.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#f2e9d8]/75 leading-relaxed font-light line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px] text-[#f2e9d8]/70">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-[#c5a059]" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={13} className="text-[#c5a059]" />
                      <span className="text-[#c5a059] font-semibold">{event.prizePool}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={13} className="text-[#c5a059]" />
                      <span>Team: {event.teamSize}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedEventModal(event)}
                    className="text-xs font-semibold text-[#c5a059] hover:underline flex items-center gap-1"
                  >
                    <span>RULES & DETAILS</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('voyage-map', event.dayId as DayId)}
                    className="px-3 py-1.5 rounded-lg bg-[#1d3045] hover:bg-[#c5a059] hover:text-[#0b141e] text-[#f2e9d8] text-[11px] font-medium tracking-wide uppercase transition-colors flex items-center gap-1.5 border border-[#c5a059]/40"
                  >
                    <Play size={11} />
                    <span>VOYAGE MAP</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* EVENT DETAILS MODAL                                                       */}
      {/* ========================================================================= */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#142333] border border-[#c5a059] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedEventModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#f2e9d8] transition-colors"
              aria-label="Close Modal"
            >
              <X size={18} />
            </button>

            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded bg-[#b65e3c] text-[#f2e9d8] text-[10px] font-mono font-bold tracking-widest uppercase">
                {selectedEventModal.category} // DAY 0{selectedEventModal.dayNumber}
              </span>
              <h2 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold text-[#f2e9d8]">
                {selectedEventModal.title}
              </h2>
              <p className="text-xs font-mono text-[#c5a059]">
                {selectedEventModal.timing} · {selectedEventModal.venue}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#0b141e] border border-white/5 text-xs">
              <div>
                <span className="text-[10px] text-white/50 uppercase block">PRIZE POOL</span>
                <span className="text-[#c5a059] font-bold text-sm">{selectedEventModal.prizePool}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/50 uppercase block">TEAM SIZE</span>
                <span className="font-semibold">{selectedEventModal.teamSize}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold tracking-widest uppercase text-[#c5a059]">
                DESCRIPTION
              </h4>
              <p className="text-xs sm:text-sm text-[#f2e9d8]/85 leading-relaxed font-light">
                {selectedEventModal.description}
              </p>
            </div>

            {selectedEventModal.rules && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold tracking-widest uppercase text-[#c5a059]">
                  EVENT RULES & GUIDELINES
                </h4>
                <ul className="space-y-1.5 text-xs text-[#f2e9d8]/80">
                  {selectedEventModal.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[#c5a059] shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 rounded-xl bg-[#1d3045]/60 border border-white/10 flex items-center justify-between text-xs">
              <div>
                <p className="text-[10px] text-white/50 uppercase">STUDENT COORDINATOR</p>
                <p className="font-semibold text-[#f2e9d8]">{selectedEventModal.coordinatorName}</p>
              </div>
              <a
                href={`mailto:${selectedEventModal.coordinatorContact}`}
                className="text-[#c5a059] hover:underline flex items-center gap-1 font-mono"
              >
                <Mail size={13} />
                <span>{selectedEventModal.coordinatorContact}</span>
              </a>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleRegisterEvent(selectedEventModal)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#b65e3c] to-[#d8815e] hover:from-[#c56d49] hover:to-[#e28e6c] text-[#f2e9d8] text-xs font-bold tracking-[0.2em] uppercase shadow-lg transition-all text-center border border-[#e5b79e]/30"
              >
                REGISTER FOR THIS EVENT
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetDay = selectedEventModal.dayId as DayId;
                  setSelectedEventModal(null);
                  navigateTo('voyage-map', targetDay);
                }}
                className="py-3 px-5 rounded-xl bg-[#1d3045] hover:bg-[#c5a059] hover:text-[#0b141e] text-[#f2e9d8] text-xs font-bold tracking-wider uppercase border border-[#c5a059]/40 transition-colors"
              >
                SEE ON MAP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
