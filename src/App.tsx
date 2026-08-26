import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CattleInfoPage, { CowData } from './pages/CattleInfoPage'; // নাম পরিবর্তিত
import CalculatorPage from './pages/CalculatorPage';
import NourishFeedPage from './pages/NourishFeedPage';
import PriceListPage from './pages/PriceListPage';
import FeedNutrientsPage from './pages/FeedNutrientsPage';
import DmReferencePage from './pages/DmReferencePage';

type PageType =
  | 'cattle-info'
  | 'calculator'
  | 'nourish-feeds'
  | 'price-list'
  | 'feed-nutrients'
  | 'dm-reference';

export default function App() {
  // Default home page is now 'cattle-info'
  const [currentPage, setCurrentPage] = useState<PageType>('cattle-info');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [refPageTitle, setRefPageTitle] = useState<string>('');
  const [cowData, setCowData] = useState<CowData | null>(null);

  const handleSidebarNavigate = (id: string, label: string) => {
    if (id === 'calculator') {
      setCurrentPage(cowData ? 'calculator' : 'cattle-info');
    } else {
      setRefPageTitle(label);
      setCurrentPage(id as PageType);
    }
  };

  const handleBackToCalculator = () => {
    if (cowData) {
      setCurrentPage('calculator');
    } else {
      setCurrentPage('cattle-info');
    }
  };

  const isFormPage = currentPage === 'cattle-info';

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <Navbar
        onOpenSidebar={() => setSidebarOpen(true)}
        onGoHome={() => setCurrentPage('cattle-info')}
        onGoCalculator={() => setCurrentPage(cowData ? 'calculator' : 'cattle-info')}
        hasCowData={!!cowData}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleSidebarNavigate}
      />

      <main className={`p-3 sm:p-5 mx-auto transition-all duration-300 ${
        isFormPage ? 'max-w-2xl' : 'w-full max-w-6xl'
      }`}>
        
        {/* HOMEPAGE: CATTLE INFO PAGE */}
        {currentPage === 'cattle-info' && (
          <CattleInfoPage
            initialData={cowData}
            onSaveAndNext={(data) => {
              setCowData(data);
              setCurrentPage('calculator');
            }}
          />
        )}

        {currentPage === 'calculator' && (
          <CalculatorPage
            cowData={cowData}
            onEditCowInfo={() => setCurrentPage('cattle-info')}
          />
        )}

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