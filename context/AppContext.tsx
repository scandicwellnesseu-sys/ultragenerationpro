
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Language, SupportedLanguage, GenerationRecord, RegenerationData } from '../types';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean, token?: string) => void;
  logout: () => void;
  token: string | null;
  brandVoice: string;
  setBrandVoice: (voice: string) => void; // This will now simulate a DB update
  language: Language;
  setLanguage: (language: Language) => void;
  supportedLanguages: SupportedLanguage[];
  history: GenerationRecord[];
  addToHistory: (record: Omit<GenerationRecord, 'id' | 'timestamp'>) => void; // This will now simulate a DB update
  toast: Toast | null;
  showToast: (message: string, type: 'success' | 'error') => void;
  regenerationData: RegenerationData | null;
  setRegenerationData: (data: RegenerationData | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const supportedLanguages: SupportedLanguage[] = [
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'no', name: 'Norsk', flag: '🇳🇴' },
    { code: 'da', name: 'Dansk', flag: '🇩🇰' },
    { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
];

// In a real app, this would be fetched from a DB. We simulate it here.
const initialBrandVoice = 'Our brand is friendly, approachable, and focuses on quality and craftsmanship. We use clear, concise language and avoid overly technical jargon. The tone should be enthusiastic and inspiring, making customers feel excited about our products.';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setAuthState] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [brandVoice, setBrandVoiceState] = useState<string>(initialBrandVoice);
  const [language, setLanguage] = useState<Language>('sv');
  const [history, setHistory] = useState<GenerationRecord[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [regenerationData, setRegenerationData] = useState<RegenerationData | null>(null);

  const setIsAuthenticated = (auth: boolean, token?: string) => {
    setAuthState(auth);
    setToken(token || null);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setHistory([]);
    setBrandVoiceState(initialBrandVoice);
    console.log("User logged out, state cleared.");
  };

  // Simulate fetching data on login
  useEffect(() => {
    if (isAuthenticated && token) {
        // In a real app:
        // fetch('/api/user/data', { headers: { 'Authorization': `Bearer ${token}` } })
        // .then(res => res.json()).then(data => {
        //   setBrandVoiceState(data.brandVoice);
        //   setHistory(data.history);
        // });
        console.log("User authenticated with token. Fetching data...");
    }
  }, [isAuthenticated, token]);

  const setBrandVoice = useCallback((voice: string) => {
    setBrandVoiceState(voice);
    // In a real app:
    // fetch('/api/settings/brand-voice', { method: 'POST', body: JSON.stringify({ voice }), headers: { 'Authorization': `Bearer ${token}` } });
    console.log("Simulating update brand voice in DB:", voice);
  }, []);

  const addToHistory = useCallback((record: Omit<GenerationRecord, 'id' | 'timestamp'>) => {
    const newRecord: GenerationRecord = {
      ...record,
      id: `hist-${Date.now()}`,
      timestamp: Date.now(),
    };
    setHistory(prev => [newRecord, ...prev]);
    // In a real app:
    // fetch('/api/history', { method: 'POST', body: JSON.stringify(newRecord), headers: { 'Authorization': `Bearer ${token}` } });
    console.log("Simulating adding record to DB history:", newRecord);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <AppContext.Provider value={{ isAuthenticated, setIsAuthenticated, logout, token, brandVoice, setBrandVoice, language, setLanguage, supportedLanguages, history, addToHistory, toast, showToast, regenerationData, setRegenerationData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
