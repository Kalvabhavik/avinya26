import { useState, useEffect } from 'react';
import { Compass, Volume2, VolumeX, Menu, X, ArrowUpRight } from 'lucide-react';
import { useFestival } from '../context/FestivalContext';
import type { PageRoute } from '../types';

export default function Navbar() {
  const { currentPage, navigateTo, soundEnabled, toggleSound } = useFestival();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { label: string; page: PageRoute }[] = [
    { label: 'HOME', page: 'home' },
    { label: 'TIMELINE', page: 'timeline' },
    { label: 'EVENTS', page: 'events' },
    { label: 'TEAM', page: 'team' },
  ];

  const handleNavClick = (page: PageRoute) => {
    setMobileMenuOpen(false);
    navigateTo(page);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0b141e]/90 backdrop-blur-md py-3.5 border-b border-[#c5a059]/20 shadow-2xl shadow-black/40'
            : 'bg-gradient-to-b from-[#0b141e]/80 via-[#0b141e]/40 to-transparent py-5 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo / Brand */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group transition-transform duration-200 hover:scale-[1.02]"
            aria-label="Avinya Home"
          >
            <div className="relative w-8 h-8 rounded-full border border-[#c5a059]/40 bg-[#1d3045]/60 flex items-center justify-center text-[#c5a059] group-hover:border-[#c5a059] transition-colors">
              <Compass className="w-4 h-4 animate-[spin_12s_linear_infinite]" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Cinzel'] text-base sm:text-lg font-bold tracking-[0.24em] text-[#f2e9d8] group-hover:text-[#c5a059] transition-colors">
                AVINYA
              </span>
              <span className="text-[9px] font-medium tracking-[0.18em] text-[#c5a059]/80 uppercase -mt-0.5">
                IIIT DHARWAD
              </span>
            </div>
          </button>

          {/* Desktop Navigation: Exactly 4 Buttons (HOME, TIMELINE, EVENTS, TEAM) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.page || (item.page === 'timeline' && currentPage === 'voyage-map');
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item.page)}
                  className={`relative px-4 py-2 text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-200 rounded-md ${
                    isActive
                      ? 'text-[#f2e9d8] bg-[#1d3045]/60 border border-[#c5a059]/40 shadow-sm'
                      : 'text-[#f2e9d8]/75 hover:text-[#f2e9d8] hover:bg-white/5'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#c5a059] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons (Sound toggle & Mobile burger) */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded-full border transition-all text-xs flex items-center gap-1.5 ${
                soundEnabled
                  ? 'border-[#c5a059] text-[#c5a059] bg-[#c5a059]/10'
                  : 'border-white/10 text-white/50 hover:text-white/80 hover:border-white/20'
              }`}
              title={soundEnabled ? 'Mute nautical soundscape' : 'Enable nautical soundscape'}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hidden lg:inline text-[10px] tracking-wider uppercase font-semibold">
                {soundEnabled ? 'AUDIO ON' : 'AUDIO OFF'}
              </span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-white/10 text-[#f2e9d8] hover:bg-white/5 transition-colors"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation (Exactly 4 Links) */}
      <div
        className={`fixed inset-0 z-40 bg-[#0b141e]/98 backdrop-blur-xl transition-all duration-300 md:hidden flex flex-col justify-between p-6 pt-24 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c5a059]/80 mb-2">
            CHART YOUR VOYAGE
          </p>
          {navItems.map((item, idx) => {
            const isActive = currentPage === item.page || (item.page === 'timeline' && currentPage === 'voyage-map');
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavClick(item.page)}
                className={`flex items-center justify-between p-4 rounded-xl text-left border transition-all ${
                  isActive
                    ? 'bg-[#1d3045] border-[#c5a059] text-[#f2e9d8]'
                    : 'bg-[#1d3045]/30 border-white/5 text-[#f2e9d8]/80 hover:bg-[#1d3045]/60 hover:text-[#f2e9d8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#c5a059]">0{idx + 1}</span>
                  <span className="font-['Cinzel'] text-lg font-bold tracking-[0.16em] uppercase">
                    {item.label}
                  </span>
                </div>
                <ArrowUpRight size={18} className="text-[#c5a059]" />
              </button>
            );
          })}
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col gap-2 text-center">
          <p className="font-['Cinzel'] text-sm tracking-[0.2em] text-[#c5a059] font-bold">AVINYA 2026</p>
          <p className="text-xs tracking-widest text-[#f2e9d8]/60 uppercase">The Techno-Cultural Fest of IIIT Dharwad</p>
          <p className="text-[10px] text-white/40 tracking-wider">30 OCT — 01 NOV 2026</p>
        </div>
      </div>
    </>
  );
}
