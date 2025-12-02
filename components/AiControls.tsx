
import React from 'react';
import { Tone, Audience } from '../types';
import { useTranslations } from '../lib/i18n';

interface AiControlsProps {
  tone: string;
  setTone: (tone: string) => void;
  audience: string;
  setAudience: (audience: string) => void;
  isBulk?: boolean;
}

const AiControls: React.FC<AiControlsProps> = ({ tone, setTone, audience, setAudience, isBulk = false }) => {
  const t = useTranslations();

  const tones: { id: Tone; label: string }[] = [
    { id: 'professional', label: t.tone_professional },
    { id: 'friendly', label: t.tone_friendly },
    { id: 'luxury', label: t.tone_luxury },
    { id: 'playful', label: t.tone_playful },
    { id: 'adventurous', label: t.tone_adventurous },
    { id: 'witty', label: t.tone_witty },
    { id: 'inspirational', label: t.tone_inspirational },
    { id: 'technical', label: t.tone_technical },
    { id: 'minimalist', label: t.tone_minimalist },
    { id: 'urgent', label: t.tone_urgent },
  ];

  const audiences: { id: Audience; label: string }[] = [
    { id: 'gen-z', label: t['audience_gen-z'] },
    { id: 'millennials', label: t['audience_millennials'] },
    { id: 'gen-x', label: t['audience_gen-x'] },
    { id: 'boomers', label: t['audience_boomers'] },
    { id: 'luxury-shoppers', label: t['audience_luxury-shoppers'] },
    { id: 'parents', label: t['audience_parents'] },
    { id: 'tech-enthusiasts', label: t['audience_tech-enthusiasts'] },
    { id: 'budget-shoppers', label: t['audience_budget-shoppers'] },
    { id: 'eco-conscious', label: t['audience_eco-conscious'] },
    { id: 'fitness-enthusiasts', label: t['audience_fitness-enthusiasts'] },
    { id: 'gamers', label: t['audience_gamers'] },
  ];

  const controlTitle = isBulk ? "2. AI Style (for all products)" : "2. AI Style";
  const isCustomTone = !tones.some(t => t.id === tone);
  const isCustomAudience = !audiences.some(a => a.id === audience);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">{controlTitle}</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t.tone}</label>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  tone === t.id
                    ? 'bg-yellow-400 text-gray-900 font-bold'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={isCustomTone ? tone : ''}
            onChange={(e) => setTone(e.target.value)}
            placeholder={t.custom_input_placeholder_tone}
            className="mt-3 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t.audience}</label>
          <div className="flex flex-wrap gap-2">
            {audiences.map((a) => (
              <button
                key={a.id}
                onClick={() => setAudience(a.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  audience === a.id
                    ? 'bg-yellow-400 text-gray-900 font-bold'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
           <input
            type="text"
            value={isCustomAudience ? audience : ''}
            onChange={(e) => setAudience(e.target.value)}
            placeholder={t.custom_input_placeholder_audience}
            className="mt-3 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default AiControls;
