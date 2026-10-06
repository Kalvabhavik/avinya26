export type PageRoute = 'home' | 'timeline' | 'voyage-map' | 'events' | 'team';

export type DayId = 'day-1' | 'day-2' | 'day-3';

export interface DayTheme {
  id: DayId;
  dayNumber: number;
  date: string;
  name: string;
  subtitle: string;
  themeKicker: string;
  lore: string;
  bannerVideo?: string;
  colorAccent: string;
  islandsCount: number;
  flagshipEvents: string[];
}

export interface IslandEvent {
  id: string;
  dayId: DayId;
  islandIndex: number;
  islandName: string;
  islandCode: string;
  islandType: 'haven' | 'atoll' | 'citadel' | 'reef' | 'sanctuary' | 'summit';
  title: string;
  subtitle: string;
  timeStart: string;
  timeEnd: string;
  duration: string;
  venue: string;
  category: 'CODING' | 'AI & ROBOTICS' | 'CULTURAL' | 'MUSIC' | 'DRAMA' | 'GAMING' | 'WORKSHOP' | 'PRO-SHOW';
  description: string;
  prizePool: string;
  teamSize: string;
  rulesHighlight: string[];
  coordX: number; // 0-100 percentage on canvas
  coordY: number; // 0-100 percentage on canvas
  registrationUrl?: string;
}

export interface FestivalEvent {
  id: string;
  dayId: DayId;
  dayNumber: number;
  title: string;
  category: 'CODING' | 'AI & ROBOTICS' | 'CULTURAL' | 'MUSIC' | 'DRAMA' | 'GAMING' | 'WORKSHOP' | 'PRO-SHOW';
  timing: string;
  venue: string;
  prizePool: string;
  teamSize: string;
  description: string;
  tags: string[];
  rules: string[];
  coordinatorName: string;
  coordinatorContact: string;
  isFlagship?: boolean;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: 'Title Partner' | 'Powered By' | 'Associate Partner' | 'Tech Partner' | 'Energy Partner' | 'Gaming Partner' | 'Previous Partner';
  category: string;
  logoText: string;
  subtext?: string;
  isPrevious?: boolean;
  website?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  wing: 'PATRON' | 'CORE' | 'TECHNICAL' | 'CULTURAL' | 'DESIGN' | 'SPONSORSHIP' | 'OPERATIONS';
  avatarInitials: string;
  bio?: string;
  email?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  interest: 'General Query' | 'Sponsorship' | 'Event Participation' | 'Media Pass';
}
