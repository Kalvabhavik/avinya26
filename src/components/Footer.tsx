import { Compass, Mail, MapPin, Instagram, Linkedin, Github, ArrowUp } from 'lucide-react';
import { useFestival } from '../context/FestivalContext';
import { FESTIVAL_INFO } from '../data/festivalData';

export default function Footer() {
  const { navigateTo } = useFestival();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#080e15] border-t border-[#c5a059]/20 text-[#f2e9d8] relative overflow-hidden">
      {/* Decorative top border accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#c5a059] to-transparent opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-[#c5a059] bg-[#1d3045] flex items-center justify-center text-[#c5a059]">
                <Compass className="w-4 h-4 animate-[spin_20s_linear_infinite]" />
              </div>
              <div>
                <h3 className="font-['Cinzel'] text-lg font-bold tracking-[0.24em] text-[#f2e9d8]">AVINYA 2026</h3>
                <p className="text-[10px] tracking-[0.16em] text-[#c5a059] uppercase font-semibold">IIIT DHARWAD</p>
              </div>
            </div>
            <p className="text-xs text-[#f2e9d8]/70 leading-relaxed font-['Plus_Jakarta_Sans']">
              The flagship Techno-Cultural Fest of Indian Institute of Information Technology Dharwad. Three days, three unique worlds, one monumental voyage.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[#f2e9d8]/80 hover:text-[#c5a059] hover:border-[#c5a059] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={14} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[#f2e9d8]/80 hover:text-[#c5a059] hover:border-[#c5a059] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={14} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[#f2e9d8]/80 hover:text-[#c5a059] hover:border-[#c5a059] transition-colors"
                aria-label="GitHub"
              >
                <Github size={14} />
              </a>
            </div>
          </div>

          {/* Voyage Navigation */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.24em] uppercase text-[#c5a059] mb-4 font-['Cinzel']">
              EXPEDITION MAP
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('home')}
                  className="text-[#f2e9d8]/75 hover:text-[#c5a059] transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]/40" />
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('timeline')}
                  className="text-[#f2e9d8]/75 hover:text-[#c5a059] transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]/40" />
                  <span>Timeline & Day Themes</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('events')}
                  className="text-[#f2e9d8]/75 hover:text-[#c5a059] transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]/40" />
                  <span>Events Directory</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('team')}
                  className="text-[#f2e9d8]/75 hover:text-[#c5a059] transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]/40" />
                  <span>Organizing Crew & Team</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Day Realms */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.24em] uppercase text-[#c5a059] mb-4 font-['Cinzel']">
              THE THREE REALMS
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('voyage-map', 'day-1')}
                  className="group text-left"
                >
                  <span className="text-[10px] font-mono text-[#c5a059] block">DAY 01 // 30 OCT</span>
                  <span className="text-[#f2e9d8]/85 group-hover:text-[#c5a059] transition-colors font-medium">
                    The Last Outpost
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('voyage-map', 'day-2')}
                  className="group text-left"
                >
                  <span className="text-[10px] font-mono text-[#c5a059] block">DAY 02 // 31 OCT</span>
                  <span className="text-[#f2e9d8]/85 group-hover:text-[#c5a059] transition-colors font-medium">
                    Pandemonium
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('voyage-map', 'day-3')}
                  className="group text-left"
                >
                  <span className="text-[10px] font-mono text-[#c5a059] block">DAY 03 // 01 NOV</span>
                  <span className="text-[#f2e9d8]/85 group-hover:text-[#c5a059] transition-colors font-medium">
                    The Carnival Island
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Festival Headquarters */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.24em] uppercase text-[#c5a059] mb-4 font-['Cinzel']">
              COORDINATES
            </h4>
            <div className="space-y-3 text-xs text-[#f2e9d8]/75">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-[#c5a059] mt-0.5 shrink-0" />
                <span>
                  {FESTIVAL_INFO.location}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-[#c5a059] shrink-0" />
                <a
                  href={`mailto:${FESTIVAL_INFO.officialEmail}`}
                  className="hover:text-[#c5a059] underline decoration-[#c5a059]/40 underline-offset-2 transition-colors"
                >
                  {FESTIVAL_INFO.officialEmail}
                </a>
              </div>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 rounded bg-[#1d3045] border border-[#c5a059]/30 text-[10px] font-mono text-[#c5a059]">
                  LAT 15.3524° N, LONG 75.0592° E
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#f2e9d8]/60">
          <p>© 2026 AVINYA — Indian Institute of Information Technology Dharwad. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="font-['Cinzel'] tracking-widest text-[#c5a059]">LIFE IS A VOYAGE</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="p-1.5 rounded-full border border-white/10 hover:border-[#c5a059] hover:text-[#c5a059] transition-colors"
              aria-label="Back to top"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
