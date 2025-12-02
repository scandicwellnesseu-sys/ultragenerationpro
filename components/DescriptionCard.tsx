
import React, { useState, useEffect } from 'react';
import { GeneratedDescription } from '../types';
import { CopyIcon, CheckIcon, EditIcon, SaveIcon, XIcon, CheckIcon as BulletIcon } from './Icons';
import { useTranslations } from '../lib/i18n';
import { useAppContext } from '../context/AppContext';

interface DescriptionCardProps {
  description: GeneratedDescription;
  onUpdate: (newDescription: GeneratedDescription | null) => void;
}

const DescriptionCard: React.FC<DescriptionCardProps> = ({ description, onUpdate }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDesc, setEditedDesc] = useState(description);
  const t = useTranslations();
  const { showToast } = useAppContext();

  useEffect(() => {
    setEditedDesc(description);
  }, [description]);

  const handleCopy = () => {
    const textToCopy = `
Headline: ${editedDesc.headline}

Meta Description: ${editedDesc.meta_description}

Body:
${editedDesc.body}

Features:
${editedDesc.feature_bullets.join('\n- ')}

Keywords: ${editedDesc.seo_keywords.join(', ')}
    `;
    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
      showToast(t.copied, 'success');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = () => {
    onUpdate(editedDesc);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDesc(description); // Revert changes
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="w-full bg-gray-800 rounded-lg p-6 animate-fade-in space-y-4">
        <div className="flex justify-end items-center gap-2">
            <button onClick={handleCancel} className="flex items-center px-3 py-1.5 text-sm rounded-md bg-gray-600 hover:bg-gray-500 text-gray-200 transition-colors"><XIcon className="w-4 h-4 mr-1" /> {t.cancel}</button>
            <button onClick={handleSave} className="flex items-center px-3 py-1.5 text-sm rounded-md bg-green-600 hover:bg-green-500 text-white transition-colors"><SaveIcon className="w-4 h-4 mr-1" /> {t.save}</button>
        </div>
        <input
            type="text"
            value={editedDesc.headline}
            onChange={(e) => setEditedDesc(d => ({...d, headline: e.target.value}))}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-2xl font-bold gold-text-gradient focus:ring-yellow-500 focus:border-yellow-500"
        />
        <textarea
            value={editedDesc.body}
            onChange={(e) => setEditedDesc(d => ({...d, body: e.target.value}))}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
            rows={6}
        />
        <div>
            <label className="font-semibold text-gray-400 text-sm">{t.metaDescription}</label>
            <input type="text" value={editedDesc.meta_description} onChange={(e) => setEditedDesc(d => ({...d, meta_description: e.target.value}))} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md p-2 text-gray-300 focus:ring-yellow-500 focus:border-yellow-500 text-sm" />
        </div>
         <div>
            <label className="font-semibold text-gray-400 text-sm">{t.keyFeatures}</label>
            <textarea value={editedDesc.feature_bullets.join('\n')} onChange={(e) => setEditedDesc(d => ({...d, feature_bullets: e.target.value.split('\n')}))} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md p-2 text-gray-300 focus:ring-yellow-500 focus:border-yellow-500 text-sm" rows={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-800 rounded-lg p-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-bold gold-text-gradient pr-4">{editedDesc.headline}</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setIsEditing(true)} className="flex items-center px-3 py-1.5 text-sm rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors" aria-label="Edit description"><EditIcon className="w-4 h-4 mr-2" /> {t.edit}</button>
            <button onClick={handleCopy} className="flex items-center px-3 py-1.5 text-sm rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors" aria-label="Copy description">
            {copied ? <><CheckIcon className="w-4 h-4 mr-2 text-green-400" /> {t.copied}</> : <><CopyIcon className="w-4 h-4 mr-2" /> {t.copy}</>}
            </button>
        </div>
      </div>
      <p className="mt-4 text-gray-300 whitespace-pre-wrap">{editedDesc.body}</p>
      
      <div className="mt-6 space-y-4">
        <div>
            <h4 className="font-semibold text-gray-400 text-sm">{t.metaDescription}</h4>
            <p className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded-md mt-1">{editedDesc.meta_description}</p>
        </div>
        <div>
            <h4 className="font-semibold text-gray-400 text-sm">{t.keyFeatures}</h4>
            <ul className="mt-2 space-y-1 text-gray-300">
                {editedDesc.feature_bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start"><BulletIcon className="w-4 h-4 text-yellow-400 mr-2 mt-1 flex-shrink-0" /><span>{bullet}</span></li>
                ))}
            </ul>
        </div>
      </div>

      {editedDesc.seo_keywords && editedDesc.seo_keywords.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-400 text-sm">{t.suggestedKeywords}</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {editedDesc.seo_keywords.map((keyword, index) => (
              <span key={index} className="px-2 py-1 text-xs font-medium text-yellow-200 bg-yellow-900/50 rounded-full">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DescriptionCard;
