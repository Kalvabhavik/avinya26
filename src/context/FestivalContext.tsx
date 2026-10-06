import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { PageRoute, DayId } from '../types';
import { ISLAND_EVENTS } from '../data/festivalData';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'gold';
}

interface FestivalContextType {
  currentPage: PageRoute;
  activeDayId: DayId;
  activeIslandIndex: number;
  isSailing: boolean;
  isAutoCruising: boolean;
  soundEnabled: boolean;
  bookmarkedEventIds: string[];
  toasts: Toast[];
  // Filters for Events
  eventCategoryFilter: string;
  eventDayFilter: string;
  eventSearchQuery: string;
  // Actions
  navigateTo: (page: PageRoute, dayId?: DayId, islandIndex?: number) => void;
  setActiveDayId: (dayId: DayId) => void;
  sailToIsland: (islandIndex: number) => void;
  nextIsland: () => void;
  prevIsland: () => void;
  toggleAutoCruise: () => void;
  toggleSound: () => void;
  toggleBookmark: (eventId: string) => void;
  showToast: (message: string, type?: 'info' | 'success' | 'gold') => void;
  setEventCategoryFilter: (category: string) => void;
  setEventDayFilter: (day: string) => void;
  setEventSearchQuery: (query: string) => void;
  playAudioChime: (pitch?: number) => void;
}

const FestivalContext = createContext<FestivalContextType | undefined>(undefined);

// Web Audio synthesizer for nautical bells and maritime ambiance
class NauticalSynthesizer {
  private audioCtx: AudioContext | null = null;

  private initCtx() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }
  }

  playBell(freq = 587.33) {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      // Dual harmonic bell tone
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.5, now);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.25);
      osc2.stop(now + 1.25);
    } catch {
      // Audio playback fails gracefully if browser restricts autoplay
    }
  }

  playClick() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Fallback
    }
  }
}

const synth = new NauticalSynthesizer();

function parseHash(): { page: PageRoute; dayId: DayId; islandIndex: number } {
  if (typeof window === 'undefined') {
    return { page: 'home', dayId: 'day-1', islandIndex: 0 };
  }
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  const parts = hash.split('/');

  let page: PageRoute = 'home';
  let dayId: DayId = 'day-1';
  let islandIndex = 0;

  if (parts[0] === 'timeline') {
    if (parts[1] === 'day' && parts[2]) {
      page = 'voyage-map';
      const cleanDay = parts[2].startsWith('day-') ? parts[2] : `day-${parts[2]}`;
      if (cleanDay === 'day-1' || cleanDay === 'day-2' || cleanDay === 'day-3') {
        dayId = cleanDay as DayId;
      }
      if (parts[3]) {
        const parsed = parseInt(parts[3], 10);
        if (!isNaN(parsed) && parsed >= 0) islandIndex = parsed;
      }
    } else {
      page = 'timeline';
    }
  } else if (parts[0] === 'voyage-map' || parts[0] === 'voyage') {
    page = 'voyage-map';
    if (parts[1]) {
      const cleanDay = parts[1].startsWith('day-') ? parts[1] : `day-${parts[1]}`;
      if (cleanDay === 'day-1' || cleanDay === 'day-2' || cleanDay === 'day-3') {
        dayId = cleanDay as DayId;
      }
    }
    if (parts[2]) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed) && parsed >= 0) islandIndex = parsed;
    }
  } else if (parts[0] === 'events') {
    page = 'events';
  } else if (parts[0] === 'team') {
    page = 'team';
  } else {
    page = 'home';
  }

  return { page, dayId, islandIndex };
}

export function FestivalProvider({ children }: { children: ReactNode }) {
  const initial = parseHash();
  const [currentPage, setCurrentPage] = useState<PageRoute>(initial.page);
  const [activeDayId, setActiveDayIdState] = useState<DayId>(initial.dayId);
  const [activeIslandIndex, setActiveIslandIndex] = useState<number>(initial.islandIndex);
  const [isSailing, setIsSailing] = useState<boolean>(false);
  const [isAutoCruising, setIsAutoCruising] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [bookmarkedEventIds, setBookmarkedEventIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Events page filtering states
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>('ALL');
  const [eventDayFilter, setEventDayFilter] = useState<string>('ALL');
  const [eventSearchQuery, setEventSearchQuery] = useState<string>('');

  const autoCruiseTimerRef = useRef<number | null>(null);

  // Sync state with browser hash changes (Back/Forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const { page, dayId, islandIndex } = parseHash();
      setCurrentPage(page);
      setActiveDayIdState(dayId);
      setActiveIslandIndex(islandIndex);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update page title
  useEffect(() => {
    const titles: Record<PageRoute, string> = {
      home: 'AVINYA 2026 — Life Is a Voyage | IIIT Dharwad',
      timeline: 'Timeline & Day Themes — AVINYA 2026 | IIIT Dharwad',
      'voyage-map': `Voyage Island Map (${activeDayId.toUpperCase()}) — AVINYA 2026`,
      events: 'Events Catalogue — AVINYA 2026 | IIIT Dharwad',
      team: 'Organizing Team — AVINYA 2026 | IIIT Dharwad',
    };
    document.title = titles[currentPage] || 'AVINYA 2026 | IIIT Dharwad';
  }, [currentPage, activeDayId]);

  // Audio helper
  const playAudioChime = useCallback((pitch = 587.33) => {
    if (soundEnabled) {
      synth.playBell(pitch);
    }
  }, [soundEnabled]);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'gold' = 'gold') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const navigateTo = useCallback(
    (page: PageRoute, dayId?: DayId, islandIndex?: number) => {
      if (soundEnabled) synth.playClick();
      const targetDay = dayId || activeDayId;
      const targetIsland = islandIndex !== undefined ? islandIndex : 0;

      setCurrentPage(page);
      if (dayId) setActiveDayIdState(dayId);
      if (islandIndex !== undefined) setActiveIslandIndex(targetIsland);

      // Build target hash
      let newHash = '';
      if (page === 'home') newHash = '#home';
      else if (page === 'timeline') newHash = '#timeline';
      else if (page === 'voyage-map') newHash = `#timeline/day/${targetDay}/${targetIsland}`;
      else if (page === 'events') newHash = '#events';
      else if (page === 'team') newHash = '#team';

      if (window.location.hash !== newHash) {
        window.history.pushState(null, '', newHash);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [activeDayId, soundEnabled]
  );

  const setActiveDayId = useCallback((dayId: DayId) => {
    setActiveDayIdState(dayId);
    setActiveIslandIndex(0);
    if (window.location.hash.includes('voyage') || window.location.hash.includes('timeline/day')) {
      window.history.replaceState(null, '', `#timeline/day/${dayId}/0`);
    }
  }, []);

  const sailToIsland = useCallback(
    (targetIndex: number) => {
      const currentList = ISLAND_EVENTS[activeDayId] || [];
      if (targetIndex < 0 || targetIndex >= currentList.length) return;
      if (targetIndex === activeIslandIndex) return;

      setIsSailing(true);
      playAudioChime(520 + targetIndex * 45);

      // Animation transition time for ship voyage
      window.setTimeout(() => {
        setActiveIslandIndex(targetIndex);
        setIsSailing(false);
        playAudioChime(784); // Reached destination bell

        if (currentPage === 'voyage-map') {
          window.history.replaceState(null, '', `#timeline/day/${activeDayId}/${targetIndex}`);
        }
      }, 700);
    },
    [activeDayId, activeIslandIndex, currentPage, playAudioChime]
  );

  const nextIsland = useCallback(() => {
    const list = ISLAND_EVENTS[activeDayId] || [];
    const nextIdx = (activeIslandIndex + 1) % list.length;
    sailToIsland(nextIdx);
  }, [activeDayId, activeIslandIndex, sailToIsland]);

  const prevIsland = useCallback(() => {
    const list = ISLAND_EVENTS[activeDayId] || [];
    const prevIdx = (activeIslandIndex - 1 + list.length) % list.length;
    sailToIsland(prevIdx);
  }, [activeDayId, activeIslandIndex, sailToIsland]);

  // Auto Cruise Loop
  useEffect(() => {
    if (!isAutoCruising) {
      if (autoCruiseTimerRef.current) {
        window.clearInterval(autoCruiseTimerRef.current);
        autoCruiseTimerRef.current = null;
      }
      return;
    }

    autoCruiseTimerRef.current = window.setInterval(() => {
      const list = ISLAND_EVENTS[activeDayId] || [];
      setActiveIslandIndex((curr) => {
        const next = (curr + 1) % list.length;
        playAudioChime(660);
        return next;
      });
    }, 4500);

    return () => {
      if (autoCruiseTimerRef.current) {
        window.clearInterval(autoCruiseTimerRef.current);
      }
    };
  }, [isAutoCruising, activeDayId, playAudioChime]);

  const toggleAutoCruise = useCallback(() => {
    setIsAutoCruising((prev) => {
      const next = !prev;
      showToast(next ? '⚓ Auto-Cruise Mode Activated: Ship is sailing the route!' : 'Anchor Dropped: Manual navigation restored.', 'info');
      return next;
    });
  }, [showToast]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (next) {
        synth.playBell(659.25);
        showToast('Nautical soundscape enabled', 'gold');
      } else {
        showToast('Nautical soundscape muted', 'info');
      }
      return next;
    });
  }, [showToast]);

  const toggleBookmark = useCallback(
    (eventId: string) => {
      setBookmarkedEventIds((prev) => {
        const exists = prev.includes(eventId);
        if (exists) {
          showToast('Removed from your Voyage Itinerary', 'info');
          return prev.filter((id) => id !== eventId);
        } else {
          showToast('Added to your Voyage Itinerary!', 'gold');
          playAudioChime(880);
          return [...prev, eventId];
        }
      });
    },
    [playAudioChime, showToast]
  );

  return (
    <FestivalContext.Provider
      value={{
        currentPage,
        activeDayId,
        activeIslandIndex,
        isSailing,
        isAutoCruising,
        soundEnabled,
        bookmarkedEventIds,
        toasts,
        eventCategoryFilter,
        eventDayFilter,
        eventSearchQuery,
        navigateTo,
        setActiveDayId,
        sailToIsland,
        nextIsland,
        prevIsland,
        toggleAutoCruise,
        toggleSound,
        toggleBookmark,
        showToast,
        setEventCategoryFilter,
        setEventDayFilter,
        setEventSearchQuery,
        playAudioChime,
      }}
    >
      {children}

      {/* Global Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-xl text-xs font-medium tracking-wide flex items-center justify-between border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              toast.type === 'gold'
                ? 'bg-[#1d3045]/95 border-[#c5a059]/60 text-[#f2e9d8] shadow-[#c5a059]/10'
                : toast.type === 'success'
                  ? 'bg-[#15342a]/95 border-[#448e6c]/60 text-[#d4f2e0]'
                  : 'bg-[#0b141e]/95 border-[#315e63]/60 text-[#f2e9d8]'
            }`}
          >
            <span>{toast.message}</span>
            <span className="text-[#c5a059] ml-2 text-[10px] font-bold uppercase tracking-widest">AVINYA</span>
          </div>
        ))}
      </div>
    </FestivalContext.Provider>
  );
}

export function useFestival() {
  const context = useContext(FestivalContext);
  if (!context) {
    throw new Error('useFestival must be used within a FestivalProvider');
  }
  return context;
}
