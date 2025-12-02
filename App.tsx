
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Generator from './components/Generator';
import BulkGenerator from './components/BulkGenerator';
import Dashboard from './components/Dashboard';
import Billing from './components/Billing';
import Settings from './components/Settings';
import History from './components/History';
import InfluencerToolkit from './components/InfluencerToolkit';
import Toast from './components/Toast';
import AuthView from './components/AuthView';
import AdminPanel from './components/AdminPanel';
import { SparklesIcon } from './components/Icons';
import { AppProvider, useAppContext } from './context/AppContext';
import { useTranslations } from './lib/i18n';
import ProductImport from './components/ProductImport';
import AiVsOriginalReport from './components/AiVsOriginalReport';
import Integrations from './components/Integrations';
import ApiDocs from './components/ApiDocs';
import ActivityLog from './components/ActivityLog';
import Analytics from './components/Analytics';
import ImageGenerator from './components/ImageGenerator';
import './src/index.css';

export type View = 'dashboard' | 'single' | 'bulk' | 'history' | 'influencer' | 'billing' | 'settings' | 'import' | 'report' | 'integrations' | 'admin' | 'api-docs' | 'activity-log' | 'analytics' | 'image-generator';

// Map routes to view names
const routeToView: Record<string, View> = {
  '/': 'single',
  '/dashboard': 'dashboard',
  '/single': 'single',
  '/bulk': 'bulk',
  '/history': 'history',
  '/influencer': 'influencer',
  '/billing': 'billing',
  '/settings': 'settings',
  '/import': 'import',
  '/report': 'report',
  '/integrations': 'integrations',
  '/admin': 'admin',
  '/api-docs': 'api-docs',
  '/activity-log': 'activity-log',
  '/analytics': 'analytics',
  '/image-generator': 'image-generator',
};

const viewToRoute: Record<View, string> = {
  'single': '/single',
  'dashboard': '/dashboard',
  'bulk': '/bulk',
  'history': '/history',
  'influencer': '/influencer',
  'billing': '/billing',
  'settings': '/settings',
  'import': '/import',
  'report': '/report',
  'integrations': '/integrations',
  'admin': '/admin',
  'api-docs': '/api-docs',
  'activity-log': '/activity-log',
  'analytics': '/analytics',
  'image-generator': '/image-generator',
};

const MainApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslations();
  
  const currentView = routeToView[location.pathname] || 'single';
  
  const handleNavigate = (view: View) => {
    navigate(viewToRoute[view]);
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
      case 'admin':
        return { title: t.adminPanel || 'Adminpanel', description: t.adminDesc || 'Hantera användare och roller.' };
      case 'api-docs':
        return { title: t.apiDocs || 'API-dokumentation', description: t.apiDocsDesc || 'Dokumentation och API-nycklar.' };
      case 'activity-log':
        return { title: t.activityLog || 'Aktivitetslogg', description: t.activityLogDesc || 'Historik över händelser.' };
      case 'analytics':
        return { title: t.analytics || 'Analytics', description: t.analyticsDesc || 'Insikter och statistik.' };
      case 'image-generator':
        return { title: '🎨 AI Bildskapare', description: 'Skapa professionella bilder för sociala medier med AI.' };
      default:
        return { title: t.titleSingle, description: t.descSingle };
    }
  }

  const { title, description } = getTitleAndDescription();

  return (
    <>
      <Header currentView={currentView} onNavigate={handleNavigate} />
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
          <Routes>
            <Route path="/" element={<Navigate to="/single" replace />} />
            <Route path="/dashboard" element={<Dashboard onNavigate={handleNavigate} />} />
            <Route path="/single" element={<Generator />} />
            <Route path="/bulk" element={<BulkGenerator />} />
            <Route path="/history" element={<History onNavigate={handleNavigate} />} />
            <Route path="/influencer" element={<InfluencerToolkit />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/import" element={<ProductImport />} />
            <Route path="/report" element={<AiVsOriginalReport />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/activity-log" element={<ActivityLog />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/image-generator" element={<ImageGenerator />} />
            <Route path="*" element={<Navigate to="/single" replace />} />
          </Routes>
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
  <BrowserRouter>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </BrowserRouter>
);

export default App;
