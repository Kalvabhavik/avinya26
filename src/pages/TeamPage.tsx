import { useState } from 'react';
import {
  Mail,
  Linkedin,
  Github,
  Instagram,
  Users,
  HeartHandshake,
} from 'lucide-react';
import { TEAM_MEMBERS } from '../data/festivalData';
import Footer from '../components/Footer';

export default function TeamPage() {
  const [selectedWing, setSelectedWing] = useState<string>('ALL');

  const wings = [
    { label: 'ALL CREW', val: 'ALL' },
    { label: 'PATRONS & FACULTY', val: 'PATRON' },
    { label: 'CORE SECRETARIAT', val: 'CORE' },
    { label: 'TECHNICAL WING', val: 'TECHNICAL' },
    { label: 'CULTURAL WING', val: 'CULTURAL' },
    { label: 'DESIGN & MEDIA', val: 'DESIGN' },
    { label: 'SPONSORSHIP & PR', val: 'SPONSORSHIP' },
    { label: 'OPERATIONS', val: 'OPERATIONS' },
  ];

  const filteredMembers = TEAM_MEMBERS.filter((member) => {
    if (selectedWing !== 'ALL' && member.wing !== selectedWing) return false;
    return true;
  });

  return (
    <div className="bg-[#0b141e] text-[#f2e9d8] min-h-screen pt-24">
      {/* Header */}
      <section className="relative py-14 px-4 sm:px-6 lg:px-8 border-b border-[#c5a059]/20 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#c5a059]/40 bg-[#1d3045]/60 text-[#c5a059] text-[10px] sm:text-xs font-bold tracking-[0.26em] uppercase">
            <Users size={13} />
            <span>FESTIVAL STEERING COMMITTEE & LEADS</span>
          </div>

          <h1 className="font-['Cinzel'] text-4xl sm:text-6xl font-extrabold tracking-[0.16em] text-[#f2e9d8] uppercase drop-shadow-md">
            MEET THE CREW
          </h1>

          <div className="w-24 h-[2px] bg-[#c5a059] mx-auto my-3" />

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#f2e9d8]/80 leading-relaxed font-light">
            The student leaders, faculty advisors, technical architects, and creative directors piloting the
            monumental voyage of Avinya 2026 at IIIT Dharwad.
          </p>
        </div>
      </section>

      {/* Wing Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {wings.map((w) => (
            <button
              key={w.val}
              type="button"
              onClick={() => setSelectedWing(w.val)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
                selectedWing === w.val
                  ? 'bg-[#c5a059] text-[#0b141e] font-bold shadow-md shadow-[#c5a059]/20'
                  : 'bg-[#142333]/80 text-[#f2e9d8]/70 hover:bg-[#142333] hover:text-[#f2e9d8] border border-white/5'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-[#142333]/60 border border-[#c5a059]/25 hover:border-[#c5a059] rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#c5a059]/10 group flex flex-col justify-between"
            >
              <div>
                {/* Avatar Initial Circle & Wing Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-full border-2 border-[#c5a059] bg-[#1d3045] flex items-center justify-center font-['Cinzel'] text-lg font-bold text-[#c5a059] shadow-md group-hover:scale-105 transition-transform">
                    {member.avatarInitials}
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#0b141e] text-[9px] font-mono font-bold tracking-widest text-[#c5a059] border border-white/10 uppercase">
                    {member.wing}
                  </span>
                </div>

                {/* Name & Role */}
                <div className="space-y-1 mb-3">
                  <h3 className="font-['Cinzel'] text-base font-bold text-[#f2e9d8] group-hover:text-[#c5a059] transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs text-[#c5a059] font-medium tracking-wide">
                    {member.role}
                  </p>
                </div>

                {/* Bio */}
                {member.bio && (
                  <p className="text-xs text-[#f2e9d8]/70 leading-relaxed font-light mb-4">
                    {member.bio}
                  </p>
                )}
              </div>

              {/* Social / Email Links */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-3 text-white/50">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="hover:text-[#c5a059] transition-colors"
                    title={member.email}
                    aria-label="Email"
                  >
                    <Mail size={16} />
                  </a>
                )}
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#c5a059] transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={16} />
                  </a>
                )}
                {member.github && (
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#c5a059] transition-colors"
                    aria-label="GitHub"
                  >
                    <Github size={16} />
                  </a>
                )}
                {member.instagram && (
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#c5a059] transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram size={16} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Volunteer Callout */}
        <div className="mt-16 bg-gradient-to-r from-[#1d3045] via-[#142333] to-[#0b141e] border border-[#c5a059]/40 rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#c5a059] uppercase">
              <HeartHandshake size={16} />
              <span>JOIN THE VOYAGE CREW</span>
            </div>
            <h3 className="font-['Cinzel'] text-xl sm:text-2xl font-bold tracking-wider text-[#f2e9d8]">
              STUDENT VOLUNTEERS CALLOUT
            </h3>
            <p className="text-xs text-[#f2e9d8]/75 max-w-xl font-light">
              Are you an IIIT Dharwad student passionate about event management, live sound production, web development,
              or artist hospitality? Enlist to join the Avinya 2026 crew.
            </p>
          </div>
          <a
            href="mailto:events@iiitdwd.ac.in?subject=Avinya%202026%20Volunteer%20Enlistment"
            className="px-6 py-3 rounded-xl bg-[#c5a059] hover:bg-[#d6b16a] text-[#0b141e] font-bold text-xs tracking-[0.2em] uppercase shrink-0 transition-colors shadow-lg"
          >
            ENLIST AS VOLUNTEER
          </a>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
