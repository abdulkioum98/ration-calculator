import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CattleInfoPage, { CowData } from './pages/CattleInfoPage';
import CalculatorFattening, { FatteningCowData } from './pages/FatteningInfoPage';
import CalculatorPage from './pages/CalculatorDairyPage';
import CalculatorFatteningPage from './pages/CalculatorFatteningPage';
import NourishFeedPage from './pages/NourishFeedPage';
import PriceListPage from './pages/PriceListPage';
import FeedNutrientsPage from './pages/FeedNutrientsPage';
import DmReferencePage from './pages/DmReferencePage';
import AdminPage from './pages/AdminPage'; // Admin Page Import

export type CattleData = CowData | FatteningCowData;

type PageType =
  | 'cattle-info'
  | 'calculator-fattening'
  | 'calculator'
  | 'fatteningcalculator'
  | 'nourish-feeds'
  | 'price-list'
  | 'feed-nutrients'
  | 'dm-reference'
  | 'admin'; // Hidden Admin Page State

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('cattle-info');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [refPageTitle, setRefPageTitle] = useState<string>('');

  // Isolated states
  const [dairyData, setDairyData] = useState<CowData | null>(null);
  const [fatteningData, setFatteningData] = useState<FatteningCowData | null>(null);

  // ব্রাউজারের URL চেক করা (yourwebsite.com/admin থাকলে সরাসরি AdminPage ওপেন করবে)
  useEffect(() => {
    const handleUrlCheck = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || path === '/admin/') {
        setCurrentPage('admin');
      }
    };

    handleUrlCheck();

    // Browser-এর back/forward বাটন হ্যান্ডেল করার জন্য
    window.addEventListener('popstate', handleUrlCheck);
    return () => window.removeEventListener('popstate', handleUrlCheck);
  }, []);

  const handleSidebarNavigate = (id: string, label: string) => {
    // সাইডবার দিয়ে অন্য পেজে গেলে ইউআরএল থেকে /admin মুছে ক্লিন পাথ সেট করবে
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }

    if (id === 'calculator') {
      setCurrentPage(dairyData ? 'calculator' : 'cattle-info');
    } else if (id === 'calculator-fattening') {
      setCurrentPage('calculator-fattening');
    } else {
      setRefPageTitle(label);
      setCurrentPage(id as PageType);
    }
  };

  const handleBackToCalculator = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }

    if (currentPage === 'fatteningcalculator' || fatteningData) {
      setCurrentPage('fatteningcalculator');
    } else if (dairyData) {
      setCurrentPage('calculator');
    } else {
      setCurrentPage('cattle-info');
    }
  };

  const isFormPage = currentPage === 'cattle-info' || currentPage === 'calculator-fattening';

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <Navbar
        onOpenSidebar={() => setSidebarOpen(true)}
        onGoHome={() => {
          if (window.location.pathname !== '/') {
            window.history.pushState({}, '', '/');
          }
          setCurrentPage('cattle-info');
        }}
        onGoCalculator={() => {
          if (window.location.pathname !== '/') {
            window.history.pushState({}, '', '/');
          }
          if (fatteningData && currentPage === 'calculator-fattening') {
            setCurrentPage('fatteningcalculator');
          } else {
            setCurrentPage(dairyData ? 'calculator' : 'cattle-info');
          }
        }}
        hasCowData={!!dairyData || !!fatteningData}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleSidebarNavigate}
      />

      <main className={`p-3 sm:p-5 mx-auto transition-all duration-300 ${
        isFormPage ? 'max-w-2xl' : 'w-full max-w-6xl'
      }`}>

        {/* MAIN TOGGLE (Dairy vs Fattening) */}
        {isFormPage && (
          <div className="flex bg-slate-200 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setCurrentPage('cattle-info')}
              className={`flex-1 py-2.5 text-center rounded-lg text-sm font-bold transition-all ${
                currentPage === 'cattle-info'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dairy
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage('calculator-fattening')}
              className={`flex-1 py-2.5 text-center rounded-lg text-sm font-bold transition-all ${
                currentPage === 'calculator-fattening'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fattening
            </button>
          </div>
        )}
        
        {/* DAIRY INPUT FORM */}
        {currentPage === 'cattle-info' && (
          <CattleInfoPage
            initialData={dairyData}
            onSaveAndNext={(data) => {
              setDairyData(data);
              setCurrentPage('calculator');
            }}
          />
        )}

        {/* FATTENING INPUT FORM */}
        {currentPage === 'calculator-fattening' && (
          <CalculatorFattening
            initialData={fatteningData}
            onSaveAndNext={(data) => {
              setFatteningData(data);
              setCurrentPage('fatteningcalculator');
            }}
          />
        )}

        {/* DAIRY CALCULATOR PAGE */}
        {currentPage === 'calculator' && (
          <CalculatorPage
            cowData={dairyData}
            onEditCowInfo={() => setCurrentPage('cattle-info')}
          />
        )}

        {/* FATTENING CALCULATOR PAGE */}
        {currentPage === 'fatteningcalculator' && (
          <CalculatorFatteningPage
            fatteningData={fatteningData}
            onEditInfo={() => setCurrentPage('calculator-fattening')}
          />
        )}

        {/* OTHER PAGES */}
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

        {/* 🔒 HIDDEN ADMIN PAGE (Accessed only via /admin URL) */}
        {currentPage === 'admin' && (
          <AdminPage onBack={handleBackToCalculator} />
        )}

      </main>
    </div>
  );
}