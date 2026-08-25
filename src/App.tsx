import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import CowInfoPage, { CowData } from './pages/CowInfoPage';
import CalculatorPage from './pages/CalculatorPage';
import NourishFeedPage from './pages/NourishFeedPage';
import PriceListPage from './pages/PriceListPage';
import FeedNutrientsPage from './pages/FeedNutrientsPage';
import DmReferencePage from './pages/DmReferencePage';


type PageType =
  | 'landing'
  | 'cow-info'
  | 'calculator'
  | 'nourish-feeds'
  | 'price-list'
  | 'feed-nutrients'
  | 'dm-reference';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [refPageTitle, setRefPageTitle] = useState<string>('');
  const [cowData, setCowData] = useState<CowData | null>(null);

  const handleSidebarNavigate = (id: string, label: string) => {
    if (id === 'calculator') {
      setCurrentPage(cowData ? 'calculator' : 'cow-info');
    } else {
      setRefPageTitle(label);
      setCurrentPage(id as PageType);
    }
  };

  const handleBackToCalculator = () => {
    if (cowData) {
      setCurrentPage('calculator');
    } else {
      setCurrentPage('cow-info');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <Navbar
        onOpenSidebar={() => setSidebarOpen(true)}
        onGoHome={() => setCurrentPage('landing')}
        onGoCalculator={() => setCurrentPage(cowData ? 'calculator' : 'cow-info')}
        hasCowData={!!cowData}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleSidebarNavigate}
      />

      <main className="p-4 max-w-md mx-auto">
        {currentPage === 'landing' && (
          <LandingPage onSelectDairy={() => setCurrentPage('cow-info')} />
        )}

        {currentPage === 'cow-info' && (
          <CowInfoPage onSaveAndNext={(data) => {
            setCowData(data);
            setCurrentPage('calculator');
          }} />
        )}

        {currentPage === 'calculator' && (
          <CalculatorPage
            cowData={cowData}
            onEditInfo={() => setCurrentPage('cow-info')}
          />
        )}

        {/* Nourish Feed Page connected directly to Supabase */}
        {currentPage === 'nourish-feeds' && (
          <NourishFeedPage onBack={handleBackToCalculator} />
        )}

        {currentPage === 'price-list' && (
          <PriceListPage onBack={handleBackToCalculator} />
        )}

        {currentPage === 'feed-nutrients' && (
          <FeedNutrientsPage onBack={handleBackToCalculator} />
        )}

        {currentPage === 'dm-reference' && (
          <DmReferencePage onBack={handleBackToCalculator} />
        )}


      </main>
    </div>
  );
}