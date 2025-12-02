
import React, { useState, useRef, useEffect } from 'react';
import { LogoIcon, ChartBarIcon, KeyIcon, UsersIcon, LinkIcon } from './Icons';
import { View } from '../App';
import { useAppContext } from '../context/AppContext';
import { useTranslations } from '../lib/i18n';

interface HeaderProps {
    currentView: View;
    onNavigate: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { language, setLanguage, supportedLanguages, logout } = useAppContext();
  const t = useTranslations();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Main navigation items
  const navItems: { id: View; label: string }[] = [
    { id: 'dashboard', label: t.navDashboard },
    { id: 'single', label: t.navSingle },
    { id: 'bulk', label: t.navBulk },
    { id: 'influencer', label: t.navInfluencer },
    { id: 'history', label: t.navHistory },
  ];

  // Pro/Agency features dropdown
  const moreItems: { id: View; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'analytics', label: 'Analys', icon: <ChartBarIcon className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrationer', icon: <LinkIcon className="w-4 h-4" />, badge: 'Pro' },
    { id: 'api', label: 'API-nycklar', icon: <KeyIcon className="w-4 h-4" />, badge: 'Agency' },
    { id: 'team', label: 'Team', icon: <UsersIcon className="w-4 h-4" />, badge: 'Agency' },
  ];

  // Settings items
  const settingsItems: { id: View; label: string }[] = [
    { id: 'billing', label: t.navBilling },
    { id: 'settings', label: t.navSettings },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = supportedLanguages.find(l => l.code === language);
  const isMoreActive = moreItems.some(item => item.id === currentView);
  const isSettingsActive = settingsItems.some(item => item.id === currentView);

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <LogoIcon className="h-8 w-8 text-yellow-400" />
            <span className="text-xl font-bold tracking-tight text-white">
              Ultra<span className="text-yellow-400">Gen</span>
              <span className="text-xs text-gray-500 ml-1">Pro</span>
            </span>
          </div>
          <nav className="hidden lg:flex items-center space-x-1 bg-gray-800/50 p-1 rounded-lg">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                  currentView === item.id
                    ? 'bg-gray-700 text-yellow-300'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
                aria-current={currentView === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
            
            {/* More dropdown for Pro/Agency features */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-1 ${
                  isMoreActive
                    ? 'bg-gray-700 text-yellow-300'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                Mer
                <svg className={`w-4 h-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isMoreOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                  {moreItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { onNavigate(item.id); setIsMoreOpen(false); }}
                      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        currentView === item.id
                          ? 'bg-yellow-500/10 text-yellow-300'
                          : 'text-gray-200 hover:bg-gray-700'
                      }`}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          item.badge === 'Pro' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-700 mx-1" />

            {settingsItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                  currentView === item.id
                    ? 'bg-gray-700 text-yellow-300'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            {/* Credits indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
              <span className="text-yellow-400 text-sm font-semibold">67</span>
              <span className="text-gray-400 text-xs">krediter</span>
            </div>
            
            <div className="relative" ref={langRef}>
                <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                    <span>{currentLang?.flag}</span>
                    <span>{currentLang?.code.toUpperCase()}</span>
                </button>
                {isLangOpen && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                        {supportedLanguages.map(lang => (
                            <button key={lang.code} onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">
                                <span className="text-lg">{lang.flag}</span>
                                <span>{lang.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
             <button onClick={logout} className="hidden md:inline-block text-sm font-semibold text-gray-300 hover:text-white px-4 py-2 rounded-md transition-colors duration-200">
              {t.logout}
            </button>
            <button className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
