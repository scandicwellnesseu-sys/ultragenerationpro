
import React, { useState } from 'react';
import Header from './components/Header';
import Generator from './components/Generator';
import BulkGenerator from './components/BulkGenerator';
import Dashboard from './components/Dashboard';
import Billing from './components/Billing';
import Settings from './components/Settings';
import History from './components/History';
import InfluencerToolkit from './components/InfluencerToolkit';
import Analytics from './components/Analytics';
import ApiKeys from './components/ApiKeys';
import TeamManagement from './components/TeamManagement';
import Integrations from './components/Integrations';
import Toast from './components/Toast';
import AuthView from './components/AuthView';
import { SparklesIcon } from './components/Icons';
import { AppProvider, useAppContext } from './context/AppContext';
import { useTranslations } from './lib/i18n';

export type View = 'dashboard' | 'single' | 'bulk' | 'history' | 'influencer' | 'billing' | 'settings' | 'analytics' | 'api' | 'team' | 'integrations';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('single');
  const t = useTranslations();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'single':
        return <Generator />;
      case 'bulk':
        return <BulkGenerator />;
      case 'history':
        return <History onNavigate={setCurrentView} />;
      case 'influencer':
        return <InfluencerToolkit />;
      case 'billing':
        return <Billing />;
      case 'settings':
        return <Settings />;
      case 'analytics':
        return <Analytics />;
      case 'api':
        return <ApiKeys />;
      case 'team':
        return <TeamManagement />;
      case 'integrations':
        return <Integrations />;
      default:
        return <Generator />;
    }
  };
  
  const getTitleAndDescription = () => {
     switch (currentView) {
      case 'dashboard':
        return { title: t.titleDashboard, description: t.descDashboard };
      case 'single':
        return { title: t.titleSingle, description: t.descSingle };
      case 'bulk':
        return { title: t.titleBulk, description: t.descBulk };
      case 'history':
        return { title: t.titleHistory, description: t.descHistory };
      case 'influencer':
        return { title: t.titleInfluencer, description: t.descInfluencer };
      case 'billing':
        return { title: t.titleBilling, description: t.descBilling };
      case 'settings':
        return { title: t.titleSettings, description: t.descSettings };
      case 'analytics':
        return { title: 'Analys & Statistik', description: 'Se din användning, ROI och insikter i realtid.' };
      case 'api':
        return { title: 'API-nycklar', description: 'Hantera dina API-nycklar för externa integrationer.' };
      case 'team':
        return { title: 'Teamhantering', description: 'Bjud in teammedlemmar och hantera roller.' };
      case 'integrations':
        return { title: 'Integrationer', description: 'Koppla samman med Shopify, WooCommerce och mer.' };
      default:
        return { title: t.titleSingle, description: t.descSingle };
    }
  }

  const { title, description } = getTitleAndDescription();

  return (
    <>
      <Header currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight gold-text-gradient inline-flex items-center">
            <SparklesIcon className="w-8 h-8 md:w-10 md:h-10 mr-3 text-yellow-400" />
            {title}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        <div className="animate-fade-in">
          {renderView()}
        </div>
      </main>
    </>
  );
};

const AppContent: React.FC = () => {
  const { toast, isAuthenticated, setIsAuthenticated } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {isAuthenticated ? (
        <MainApp />
      ) : (
        <AuthView onAuthSuccess={(token) => setIsAuthenticated(true, token)} />
      )}
      <footer className="text-center py-6 border-t border-gray-800">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} UltragenerationPro. All rights reserved.</p>
      </footer>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
