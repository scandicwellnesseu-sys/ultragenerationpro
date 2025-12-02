
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslations } from '../lib/i18n';
import { SparklesIcon, CopyIcon } from './Icons';
import { View } from '../App';
import { GenerationRecord, Tone, Audience } from '../types';

interface HistoryProps {
    onNavigate: (view: View) => void;
}

const History: React.FC<HistoryProps> = ({ onNavigate }) => {
    const { history, showToast, setRegenerationData } = useAppContext();
    const t = useTranslations();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleToggle = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleCopy = (record: GenerationRecord) => {
        const textToCopy = `${record.description.headline}\n\n${record.description.body}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast(t.copied, 'success');
        });
    };

    const handleRegenerate = (record: GenerationRecord) => {
        const { productTitle, keywords, language, tone, audience } = record;
        setRegenerationData({ productTitle, keywords, language, tone, audience });
        onNavigate('single');
    };

    const getSettingLabel = (type: 'tone' | 'audience', key: string): string => {
        const translationKey = `${type}_${key.replace(/-/g, '_')}` as keyof typeof t;
        if (t[translationKey]) {
            return t[translationKey];
        }
        return key;
    };

    if (history.length === 0) {
        return (
            <div className="text-center max-w-xl mx-auto">
                <h2 className="text-2xl font-bold text-white">{t.noHistory}</h2>
                <p className="mt-2 text-gray-400">{t.noHistoryDescription}</p>
                <button onClick={() => onNavigate('single')} className="mt-6 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-900 gold-gradient">
                    {t.generate}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            {history.map((record) => (
                <div key={record.id} className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
                    <button onClick={() => handleToggle(record.id)} className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-800 transition-colors">
                        <div>
                            <p className="font-bold text-white">{record.productTitle}</p>
                            <p className="text-sm text-gray-400">{new Date(record.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase text-gray-400">{record.language}</span>
                            <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedId === record.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </button>
                    {expandedId === record.id && (
                        <div className="p-6 border-t border-gray-700 bg-gray-900/50 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xl font-bold gold-text-gradient">{record.description.headline}</h3>
                                    <p className="mt-3 text-gray-300 whitespace-pre-wrap">{record.description.body}</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-400 text-sm">{t.generationSettings}</h4>
                                        <div className="text-sm text-gray-300 mt-1">
                                            <p><span className="font-medium">{t.tone}:</span> <span className="capitalize">{getSettingLabel('tone', record.tone)}</span></p>
                                            <p><span className="font-medium">{t.audience}:</span> <span className="capitalize">{getSettingLabel('audience', record.audience)}</span></p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-400 text-sm">{t.suggestedKeywords}</h4>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {record.description.seo_keywords.map((kw, i) => <span key={i} className="px-2 py-1 text-xs font-medium text-yellow-200 bg-yellow-900/50 rounded-full">{kw}</span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-2">
                                <button onClick={() => handleCopy(record)} className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2 px-4 rounded-md transition-colors"><CopyIcon className="w-4 h-4"/> {t.copy}</button>
                                <button onClick={() => handleRegenerate(record)} className="flex items-center gap-2 text-sm bg-yellow-600/20 hover:bg-yellow-500/30 text-yellow-300 font-semibold py-2 px-4 rounded-md transition-colors"><SparklesIcon className="w-4 h-4"/> {t.regenerate}</button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default History;
