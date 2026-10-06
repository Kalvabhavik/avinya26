import { useState, useEffect, useRef } from 'react';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Calendar,
  MapPin,
  Mail,
  Send,
  CheckCircle2,
  Code2,
  Cpu,
  Music,
  Award,
  ExternalLink,
} from 'lucide-react';
import { useFestival } from '../context/FestivalContext';
import { FESTIVAL_INFO, SPONSORS_CURRENT, SPONSORS_PREVIOUS } from '../data/festivalData';
import Footer from '../components/Footer';

export default function HomePage() {
  const { navigateTo, showToast } = useFestival();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Countdown timer state to October 30, 2026
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Contact form state
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    category: 'General Query',
    subject: '',
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const targetDate = new Date('2026-10-30T09:00:00+05:30').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
      showToast('Please fill out all required fields.', 'info');
      return;
    }
    setFormSubmitted(true);
    showToast('Your message has been sent to the festival secretariat!', 'gold');
    setTimeout(() => {
      setFormState({
        name: '',
        email: '',
        category: 'General Query',
        subject: '',
        message: '',
      });
      setFormSubmitted(false);
    }, 4000);
  };

  return (
    <div className="bg-[#0b141e] text-[#f2e9d8] min-h-screen">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-24 pb-16">
        {/* Background Video Reel */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            ref={videoRef}
            src="/videos/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-35 scale-105 filter saturate-125 brightness-90"
          />
          {/* Subtle Nautical Radial Vignette & Grid */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0b141e]/70 to-[#0b141e]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b141e]/50 via-transparent to-[#0b141e]" />
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(rgba(197, 160, 89, 0.4) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
          {/* Overline Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#c5a059]/40 bg-[#1d3045]/70 backdrop-blur-md mb-6 animate-pulse">
            <Compass className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#c5a059]">
              IIIT DHARWAD PRESENTS
            </span>
            <span className="w-1 h-1 rounded-full bg-[#c5a059]" />
            <span className="text-[11px] font-medium tracking-[0.2em] text-[#f2e9d8]/90">
              30 OCT — 01 NOV 2026
            </span>
          </div>

          {/* Grand Festival Name */}
          <h1 className="font-['Cinzel'] text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[0.16em] text-[#f2e9d8] drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)] uppercase">
            AVINYA
          </h1>

          {/* Tagline / Subtitle */}
          <p className="font-['Cinzel'] text-lg sm:text-2xl md:text-3xl font-semibold tracking-[0.34em] text-[#c5a059] uppercase mt-2 drop-shadow-md">
            LIFE IS A VOYAGE
          </p>

          <p className="max-w-2xl text-xs sm:text-sm text-[#f2e9d8]/80 mt-4 leading-relaxed font-light tracking-wide">
            The Annual Flagship Techno-Cultural Festival of Indian Institute of Information Technology Dharwad.
            Embark on an unforgettable odyssey across three thematic realms of code, robotics, art, and music.
          </p>

          {/* Countdown Clock */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 my-8 max-w-md w-full">
            {[
              { label: 'DAYS', val: timeLeft.days },
              { label: 'HOURS', val: timeLeft.hours },
              { label: 'MINUTES', val: timeLeft.minutes },
              { label: 'SECONDS', val: timeLeft.seconds },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[#1d3045]/80 border border-[#c5a059]/30 rounded-xl p-2.5 sm:p-3 text-center backdrop-blur-md shadow-lg"
              >
                <span className="block font-mono text-xl sm:text-3xl font-bold text-[#f2e9d8]">
                  {String(item.val).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#c5a059] font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <button
              type="button"
              onClick={() => navigateTo('timeline')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#b65e3c] to-[#d8815e] hover:from-[#c56d49] hover:to-[#e28e6c] text-[#f2e9d8] font-semibold text-xs tracking-[0.22em] uppercase shadow-lg shadow-[#b65e3c]/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 border border-[#e5b79e]/30"
            >
              <Compass size={16} />
              <span>EXPLORE TIMELINE</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('events')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1d3045]/90 hover:bg-[#1d3045] text-[#f2e9d8] font-semibold text-xs tracking-[0.22em] uppercase border border-[#c5a059]/50 hover:border-[#c5a059] transition-all flex items-center justify-center gap-2.5 shadow-md"
            >
              <Sparkles size={16} className="text-[#c5a059]" />
              <span>DISCOVER EVENTS</span>
            </button>
          </div>
        </div>

        {/* Scroll Whisper */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-70">
          <span className="text-[9px] tracking-[0.28em] uppercase text-[#c5a059]">VOYAGE LOG</span>
          <span className="w-[1px] h-6 bg-gradient-to-b from-[#c5a059] to-transparent animate-pulse" />
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="border-y border-[#c5a059]/20 bg-[#080e15] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            {FESTIVAL_INFO.stats.map((stat) => (
              <div key={stat.label} className="p-3 border-r last:border-r-0 border-white/5">
                <p className="font-['Cinzel'] text-2xl sm:text-3xl font-bold text-[#c5a059] tracking-wider">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#f2e9d8]/75 mt-1 font-['Plus_Jakarta_Sans']">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ABOUT FEST SECTION                                                     */}
      {/* ========================================================================= */}
      <section id="about" className="py-24 relative overflow-hidden bg-[#0d1824]">
        {/* Subtle Watermark */}
        <div className="absolute top-1/2 -right-24 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] font-['Cinzel'] text-[18rem] font-bold text-[#f2e9d8]">
          AVINYA
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Layout */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-[#c5a059] font-bold mb-3">
              <span>AVINYA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
              <span>TECHNOCULTURAL</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
              <span>IIIT DHARWAD</span>
            </div>

            <h2 className="font-['Cinzel'] text-3xl sm:text-5xl font-extrabold tracking-[0.18em] text-[#f2e9d8] uppercase">
              ABOUT FEST
            </h2>

            <div className="w-20 h-[2px] bg-[#c5a059] mx-auto my-4" />

            <h3 className="font-['Cinzel'] text-lg sm:text-xl font-bold tracking-[0.14em] text-[#c5a059]">
              AVINYA 2026 — The Techno-Cultural Fest of IIIT Dharwad
            </h3>
          </div>

          {/* Main Narrative Card */}
          <div className="bg-[#142333]/80 border border-[#c5a059]/30 rounded-2xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden mb-16 backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-bl-full pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-5 text-sm sm:text-base leading-relaxed text-[#f2e9d8]/90 font-['Plus_Jakarta_Sans'] font-light">
                {/* The exact narrative requested by the user */}
                <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-[#c5a059] first-letter:mr-2 first-letter:float-left first-letter:font-['Cinzel']">
                  Avinya is the flagship Techno-Cultural Fest of IIIT Dharwad, where innovation meets
                  imagination. It's a vibrant celebration of technology, creativity, and talent — uniting
                  brilliant minds, passionate artists, and enthusiastic performers under one roof.
                </p>
                <p>
                  From electrifying coding battles, insightful startup conclaves, and hands-on technical
                  workshops to high-octane gaming events, Avinya offers a platform for every innovator, creator,
                  and dreamer. Beyond technology, it's a fusion of art, culture, and energy — a festival that
                  celebrates ideas, expression, and collaboration.
                </p>
                <p className="font-medium text-[#c5a059]">
                  Join us for Avinya 2026 — where the sparks of innovation light up the stage of creativity!
                </p>
              </div>

              {/* Fest Highlights Box */}
              <div className="lg:col-span-4 bg-[#0b141e]/90 border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#c5a059] uppercase">
                  <Compass size={16} />
                  <span>VOYAGE HIGHLIGHTS</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#c5a059] shrink-0 mt-0.5" />
                    <span>3 Unique Themed Days: Outpost, Pandemonium, Carnival</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#c5a059] shrink-0 mt-0.5" />
                    <span>National 24-Hour Hackathon with Enterprise Tracks</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#c5a059] shrink-0 mt-0.5" />
                    <span>Combat RoboWars, FPV Drone Derby & Esports</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#c5a059] shrink-0 mt-0.5" />
                    <span>Star-Studded Celebrity Musical Pro-Nights</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigateTo('timeline')}
                    className="w-full py-2.5 rounded-lg bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#f2e9d8] text-xs font-semibold tracking-wider uppercase border border-[#c5a059]/40 flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>EXPLORE DAY THEMES</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Four Core Pillars of Avinya */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Code2,
                title: 'TECH & CODE ARENA',
                desc: 'Hackathons, algorithmic coding duels, open source workshops, and Web3 AI incubators.',
                color: 'from-[#315e63] to-[#1d3045]',
              },
              {
                icon: Cpu,
                title: 'ROBOTICS & HARDWARE',
                desc: 'Heavyweight combat bot battles, FPV drone obstacle speed races, and IoT exhibitions.',
                color: 'from-[#b65e3c] to-[#1d3045]',
              },
              {
                icon: Music,
                title: 'CULTURAL SPECTACLE',
                desc: 'Street dance cyphers, battle of the bands, nukkad natak drama, and haute couture runways.',
                color: 'from-[#c5a059] to-[#1d3045]',
              },
              {
                icon: Award,
                title: 'CELEBRITY PRO-NIGHT',
                desc: 'Grand musical concert finale with chart-topping artists, electronic DJs, and laser shows.',
                color: 'from-[#447e85] to-[#1d3045]',
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="bg-[#142333]/50 border border-white/10 hover:border-[#c5a059]/50 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1d3045] border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] group-hover:scale-110 transition-transform mb-4">
                    <Icon size={20} />
                  </div>
                  <h4 className="font-['Cinzel'] text-sm font-bold tracking-wider text-[#f2e9d8] uppercase mb-2">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-[#f2e9d8]/70 leading-relaxed font-light">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SPONSORS & PREVIOUS SPONSORS SECTION                                   */}
      {/* ========================================================================= */}
      <section id="sponsors" className="py-24 bg-[#080e15] border-t border-[#c5a059]/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#c5a059] mb-2 font-['Cinzel']">
              OUR PATRONS & PARTNERS
            </p>
            <h2 className="font-['Cinzel'] text-3xl sm:text-5xl font-extrabold tracking-[0.18em] text-[#f2e9d8] uppercase">
              SPONSORS & ALLIANCES
            </h2>
            <div className="w-20 h-[2px] bg-[#c5a059] mx-auto my-4" />
            <p className="text-xs text-[#f2e9d8]/70 max-w-xl mx-auto font-light leading-relaxed">
              Empowered by industry leaders, pioneering tech giants, and visionary brands who share our quest
              for innovation and creative exploration.
            </p>
          </div>

          {/* Current 2026 Sponsors */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/10">
              <span className="text-xs font-bold tracking-[0.24em] uppercase text-[#c5a059] font-['Cinzel']">
                AVINYA 2026 PARTNERS
              </span>
              <span className="text-[10px] text-[#f2e9d8]/50 uppercase tracking-widest">
                OFFICIAL FLEET SPONSORS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SPONSORS_CURRENT.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="bg-[#142333]/60 border border-[#c5a059]/30 hover:border-[#c5a059] rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#c5a059]/10 group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded bg-[#c5a059]/15 text-[#c5a059] text-[10px] font-bold tracking-widest uppercase border border-[#c5a059]/30">
                      {sponsor.tier}
                    </span>
                    <span className="text-[10px] text-[#f2e9d8]/50 uppercase tracking-wider">
                      {sponsor.category}
                    </span>
                  </div>

                  {/* Stylized Logo Frame */}
                  <div className="h-20 rounded-xl bg-[#0b141e]/80 border border-white/5 flex items-center justify-center text-center p-3 mb-4 group-hover:bg-[#1d3045]/60 transition-colors">
                    <span className="font-['Cinzel'] text-xl sm:text-2xl font-black tracking-[0.2em] text-[#f2e9d8] group-hover:text-[#c5a059] transition-colors uppercase">
                      {sponsor.logoText}
                    </span>
                  </div>

                  <p className="text-xs text-[#f2e9d8]/70 leading-relaxed font-light">
                    {sponsor.subtext}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Previous Sponsors Showcase */}
          <div>
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/10">
              <span className="text-xs font-bold tracking-[0.24em] uppercase text-[#c5a059] font-['Cinzel']">
                PREVIOUS SPONSORS & ALLIANCES
              </span>
              <span className="text-[10px] text-[#f2e9d8]/50 uppercase tracking-widest">
                LEGACY PARTNERS
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {SPONSORS_PREVIOUS.map((prev) => (
                <div
                  key={prev.id}
                  className="bg-[#142333]/30 hover:bg-[#142333]/70 border border-white/5 hover:border-[#c5a059]/40 rounded-xl p-4 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[90px] group"
                >
                  <span className="font-['Cinzel'] text-sm sm:text-base font-bold tracking-wider text-[#f2e9d8]/85 group-hover:text-[#c5a059] transition-colors uppercase">
                    {prev.logoText}
                  </span>
                  <span className="text-[9px] text-[#f2e9d8]/50 tracking-wide mt-1 uppercase font-light">
                    {prev.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsor Call to Action */}
          <div className="mt-16 bg-gradient-to-r from-[#1d3045] via-[#142333] to-[#0b141e] border border-[#c5a059]/40 rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-['Cinzel'] text-xl sm:text-2xl font-bold tracking-wider text-[#f2e9d8]">
                PARTNER WITH AVINYA 2026
              </h3>
              <p className="text-xs text-[#f2e9d8]/75 max-w-xl font-light">
                Position your brand before 5,000+ top engineering minds, creators, and innovators.
                Custom partnership tiers, recruitment pipelines, and campus activations available.
              </p>
            </div>
            <a
              href="mailto:sponsorship@iiitdwd.ac.in"
              className="px-6 py-3 rounded-xl bg-[#c5a059] hover:bg-[#d6b16a] text-[#0b141e] font-bold text-xs tracking-[0.2em] uppercase shrink-0 transition-colors shadow-lg flex items-center gap-2"
            >
              <span>REQUEST SPONSOR DECK</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CONTACT SESSION (AT LAST)                                              */}
      {/* ========================================================================= */}
      <section id="contact" className="py-24 bg-[#0d1824] border-t border-[#c5a059]/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#c5a059] mb-2 font-['Cinzel']">
              GET IN TOUCH
            </p>
            <h2 className="font-['Cinzel'] text-3xl sm:text-5xl font-extrabold tracking-[0.18em] text-[#f2e9d8] uppercase">
              CONTACT SESSION
            </h2>
            <div className="w-20 h-[2px] bg-[#c5a059] mx-auto my-4" />
            <p className="text-xs text-[#f2e9d8]/70 max-w-xl mx-auto font-light leading-relaxed">
              Have queries regarding event participation, team accommodations, sponsorships, or festival access?
              Our organizing committee is standing by to guide your voyage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Festival Secretariat & Key Contacts */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#142333]/70 border border-[#c5a059]/30 rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.24em] text-[#c5a059] uppercase block mb-1">
                    FESTIVAL SECRETARIAT
                  </span>
                  <h3 className="font-['Cinzel'] text-xl font-bold text-[#f2e9d8]">
                    IIIT DHARWAD FEST DESK
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-[#c5a059] shrink-0 mt-1" size={17} />
                    <div className="space-y-0.5 text-[#f2e9d8]/80 leading-relaxed font-light">
                      <p className="font-medium text-[#f2e9d8]">Campus Address:</p>
                      <p>{FESTIVAL_INFO.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="text-[#c5a059] shrink-0 mt-1" size={17} />
                    <div className="space-y-0.5 text-[#f2e9d8]/80 leading-relaxed font-light">
                      <p className="font-medium text-[#f2e9d8]">Official Inquiries:</p>
                      <a
                        href={`mailto:${FESTIVAL_INFO.officialEmail}`}
                        className="text-[#c5a059] hover:underline"
                      >
                        {FESTIVAL_INFO.officialEmail}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="text-[#c5a059] shrink-0 mt-1" size={17} />
                    <div className="space-y-0.5 text-[#f2e9d8]/80 leading-relaxed font-light">
                      <p className="font-medium text-[#f2e9d8]">Festival Dates:</p>
                      <p>30 October — 01 November 2026</p>
                    </div>
                  </div>
                </div>

                {/* Key Student Organizers Mentioned in Original Code */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] font-bold tracking-widest text-[#c5a059] uppercase mb-3">
                    KEY STUDENT CONTACTS
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#0b141e]/60 border border-white/5 rounded-xl p-3 text-center">
                      <p className="font-semibold text-xs text-[#f2e9d8]">SPARSH MITTAL</p>
                      <p className="text-[9px] text-[#c5a059] uppercase mt-0.5">Cultural Sec</p>
                    </div>
                    <div className="bg-[#0b141e]/60 border border-white/5 rounded-xl p-3 text-center">
                      <p className="font-semibold text-xs text-[#f2e9d8]">ARYA SAJJAN</p>
                      <p className="text-[9px] text-[#c5a059] uppercase mt-0.5">Technical Sec</p>
                    </div>
                    <div className="bg-[#0b141e]/60 border border-white/5 rounded-xl p-3 text-center">
                      <p className="font-semibold text-xs text-[#f2e9d8]">MIKU</p>
                      <p className="text-[9px] text-[#c5a059] uppercase mt-0.5">Event Mgmt Lead</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-[#142333]/70 border border-[#c5a059]/30 rounded-2xl p-6 sm:p-8">
                <h3 className="font-['Cinzel'] text-xl font-bold text-[#f2e9d8] mb-2">
                  TRANSMIT A MESSAGE
                </h3>
                <p className="text-xs text-[#f2e9d8]/70 mb-6 font-light">
                  Fill out the form below. Our festival coordinators will respond within 24 hours.
                </p>

                {formSubmitted ? (
                  <div className="bg-[#15342a]/80 border border-[#448e6c] rounded-xl p-6 text-center space-y-3">
                    <CheckCircle2 size={36} className="text-[#448e6c] mx-auto" />
                    <h4 className="font-['Cinzel'] text-base font-bold text-[#d4f2e0]">
                      MESSAGE TRANSMITTED
                    </h4>
                    <p className="text-xs text-[#d4f2e0]/80">
                      Thank you for reaching out to Avinya 2026. The organizing crew has logged your inquiry.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c5a059] mb-1.5">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          placeholder="e.g. Aditi Rao"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#0b141e] border border-white/10 text-xs text-[#f2e9d8] focus:border-[#c5a059] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c5a059] mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          placeholder="e.g. aditi@college.edu"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#0b141e] border border-white/10 text-xs text-[#f2e9d8] focus:border-[#c5a059] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c5a059] mb-1.5">
                          Inquiry Category
                        </label>
                        <select
                          value={formState.category}
                          onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#0b141e] border border-white/10 text-xs text-[#f2e9d8] focus:border-[#c5a059] focus:outline-none transition-colors"
                        >
                          <option value="General Query">General Query</option>
                          <option value="Event Participation">Event Participation</option>
                          <option value="Sponsorship">Sponsorship & Alliances</option>
                          <option value="Accommodation">Accommodation & Hospitality</option>
                          <option value="Media Pass">Press & Media Pass</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c5a059] mb-1.5">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={formState.subject}
                          onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                          placeholder="e.g. HackVoyage Team Query"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#0b141e] border border-white/10 text-xs text-[#f2e9d8] focus:border-[#c5a059] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c5a059] mb-1.5">
                        Your Message *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        placeholder="Write your question, proposal, or message for the festival team..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#0b141e] border border-white/10 text-xs text-[#f2e9d8] focus:border-[#c5a059] focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#b65e3c] to-[#d8815e] hover:from-[#c56d49] hover:to-[#e28e6c] text-[#f2e9d8] font-bold text-xs tracking-[0.2em] uppercase transition-all shadow-lg flex items-center justify-center gap-2 border border-[#e5b79e]/30"
                    >
                      <Send size={15} />
                      <span>DISPATCH MESSAGE</span>
                    </button>
                  </form>
                )}
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
