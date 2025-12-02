
import React, { useState, useRef, useEffect } from 'react';
import { LogoIcon } from './Icons';
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
  const langRef = useRef<HTMLDivElement>(null);

  const navItems: { id: View; label: string }[] = [
    { id: 'dashboard', label: t.navDashboard },
    { id: 'single', label: t.navSingle },
    { id: 'bulk', label: t.navBulk },
    { id: 'import', label: 'Import' },
    { id: 'integrations', label: 'Integrationer' },
    { id: 'report', label: 'Rapport' },
    { id: 'influencer', label: t.navInfluencer },
    { id: 'history', label: t.navHistory },
    { id: 'billing', label: t.navBilling },
    { id: 'settings', label: t.navSettings },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = supportedLanguages.find(l => l.code === language);

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <LogoIcon className="h-8 w-8 text-yellow-400" />
            <span className="text-xl font-bold tracking-tight text-white">
              Ultra<span className="text-yellow-400">Gen</span>
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
          </nav>
          <div className="flex items-center gap-4">
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
