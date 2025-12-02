
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslations } from '../lib/i18n';
import { useGemini } from '../hooks/useGemini';
import Spinner from './Spinner';

const Settings: React.FC = () => {
  const { brandVoice, setBrandVoice, showToast } = useAppContext();
  const [localBrandVoice, setLocalBrandVoice] = useState(brandVoice);
  const [textToAnalyze, setTextToAnalyze] = useState('');
  const t = useTranslations();
  const { analyzeBrandVoice, loading } = useGemini();

  useEffect(() => {
    setLocalBrandVoice(brandVoice);
  }, [brandVoice]);

  const handleSave = () => {
    setBrandVoice(localBrandVoice);
    showToast(t.settingsSaved, 'success');
  };

  const handleAnalyze = async () => {
    if (!textToAnalyze.trim()) return;
    try {
        const analysisResult = await analyzeBrandVoice(textToAnalyze);
        if (analysisResult) {
            setLocalBrandVoice(analysisResult);
            showToast('Brand voice analyzed and updated!', 'success');
        }
    } catch (e) {
        showToast('Failed to analyze text.', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-white">{t.brandVoice}</h3>
        <p className="mt-2 text-gray-400">{t.brandVoiceDescription}</p>
        <div className="mt-6">
          <label htmlFor="brand-voice" className="block text-sm font-medium text-gray-300">{t.brandVoiceLabel}</label>
          <textarea
            id="brand-voice"
            rows={6}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
            value={localBrandVoice}
            onChange={(e) => setLocalBrandVoice(e.target.value)}
            placeholder={t.brandVoicePlaceholder}
          />
        </div>
        <div className="mt-6 flex justify-end items-center">
          <button onClick={handleSave} className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-900 gold-gradient">
            {t.saveChanges}
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-white">{t.analyzeText}</h3>
        <p className="mt-2 text-gray-400">{t.analyzeTextDescription}</p>
        <div className="mt-6">
          <textarea
            rows={6}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
            value={textToAnalyze}
            onChange={(e) => setTextToAnalyze(e.target.value)}
            placeholder="Paste your text here..."
          />
        </div>
        <div className="mt-6 flex justify-end items-center">
          <button onClick={handleAnalyze} disabled={loading} className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-900 gold-gradient disabled:opacity-50">
            {loading ? <><Spinner /> {t.analyzing}</> : t.analyzeText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
