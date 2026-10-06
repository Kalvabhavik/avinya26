import { FestivalProvider, useFestival } from './context/FestivalContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import TimelinePage from './pages/TimelinePage';
import VoyageMapPage from './pages/VoyageMapPage';
import EventsPage from './pages/EventsPage';
import TeamPage from './pages/TeamPage';

function FestivalAppContent() {
  const { currentPage } = useFestival();

  return (
    <div className="min-h-screen bg-[#0b141e] text-[#f2e9d8] flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#c5a059] selection:text-[#0b141e]">
      {/* Top Navbar with exactly 4 buttons: HOME, TIMELINE, EVENTS, TEAM */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'timeline' && <TimelinePage />}
        {currentPage === 'voyage-map' && <VoyageMapPage />}
        {currentPage === 'events' && <EventsPage />}
        {currentPage === 'team' && <TeamPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <FestivalProvider>
      <FestivalAppContent />
    </FestivalProvider>
  );
}
