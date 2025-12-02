
import React, { useState, useCallback, useEffect } from 'react';
import { GeneratedDescription, ImageFile } from '../types';
import { useGemini } from '../hooks/useGemini';
import { useAppContext } from '../context/AppContext';
import { useTranslations } from '../lib/i18n';
import { UploadIcon, SparklesIcon, AlertTriangleIcon } from './Icons';
import DescriptionCard from './DescriptionCard';
import ImagePreview from './ImagePreview';
import Spinner from './Spinner';
import AiControls from './AiControls';

const Generator: React.FC = () => {
  const { brandVoice, language, setLanguage, showToast, regenerationData, setRegenerationData } = useAppContext();
  
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [productTitle, setProductTitle] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [tone, setTone] = useState<string>('friendly');
  const [audience, setAudience] = useState<string>('millennials');
  const [generatedDesc, setGeneratedDesc] = useState<GeneratedDescription | null>(null);
  const [isKeywordLoading, setIsKeywordLoading] = useState(false);
  
  const { generateDescription, getSemanticKeywords, loading, error } = useGemini();
  const t = useTranslations();

  useEffect(() => {
    if (regenerationData) {
        setProductTitle(regenerationData.productTitle);
        setKeywords(regenerationData.keywords);
        setTone(regenerationData.tone);
        setAudience(regenerationData.audience);
        setLanguage(regenerationData.language);
        setGeneratedDesc(null);
        setImageFile(null);
        showToast(t.regenerateInfo, 'success');
        setRegenerationData(null); // Clear data after loading
    }
  }, [regenerationData, setRegenerationData, setLanguage, showToast, t]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageFile({
          base64: base64String.split(',')[1],
          mimeType: file.type,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!imageFile || !productTitle) {
      showToast(t.error_missing_fields, 'error');
      return;
    }
    setGeneratedDesc(null);
    try {
        const result = await generateDescription(imageFile, productTitle, keywords, brandVoice, language, tone, audience);
        if (result) {
          setGeneratedDesc(result);
        }
    } catch(e) {
        console.error("Generation failed in component");
    }
  };

  const handleKeywordGeneration = async () => {
    if (!productTitle) {
        showToast('Please enter a product title first to get keyword ideas.', 'error');
        return;
    }
    setIsKeywordLoading(true);
    try {
        const result = await getSemanticKeywords(productTitle, language);
        if (result) {
            setKeywords(result.join(', '));
        }
    } catch (e) {
        showToast('Failed to get keyword ideas.', 'error');
    }
    setIsKeywordLoading(false);
  };

  const clearImage = useCallback(() => {
    setImageFile(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-white mb-4">{t.productDetails}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">{t.productImage}</label>
                {imageFile ? (
                <ImagePreview imageFile={imageFile} onClear={clearImage} />
                ) : (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                    <div className="flex text-sm text-gray-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-yellow-400 hover:text-yellow-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-yellow-500">
                        <span>{t.uploadFile}</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">{t.dragAndDrop}</p>
                    </div>
                    <p className="text-xs text-gray-500">{t.fileTypes}</p>
                    </div>
                </div>
                )}
            </div>

            <div>
                <label htmlFor="product-title" className="block text-sm font-medium text-gray-300">{t.productTitle}</label>
                <input
                type="text"
                id="product-title"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                placeholder={t.productTitlePlaceholder}
                required
                />
            </div>

            <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-300">{t.keywords}</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                    type="text"
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="block w-full bg-gray-700 border border-gray-600 rounded-l-md py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                    placeholder={t.keywordsPlaceholder}
                    />
                    <button type="button" onClick={handleKeywordGeneration} disabled={isKeywordLoading} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-600 bg-gray-600 text-gray-300 hover:bg-gray-500 disabled:opacity-50">
                        {isKeywordLoading ? <Spinner size="sm" /> : <SparklesIcon className="w-4 h-4" />}
                        <span className="ml-2 text-sm font-medium">{t.getKeywordIdeas}</span>
                    </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">{t.keywordsHelper}</p>
            </div>
            </form>
        </div>
        <AiControls tone={tone} setTone={setTone} audience={audience} setAudience={setAudience} />
        <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !imageFile || !productTitle}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-900 gold-gradient disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
            <>
                <Spinner />
                {t.generating}...
            </>
            ) : (
            <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                {t.generateDescription}
            </>
            )}
        </button>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-6">{t.aiOutput}</h2>
        <div className="flex-grow flex items-center justify-center rounded-lg bg-gray-900/50 p-4 min-h-[300px]">
          {loading ? (
            <div className="text-center text-gray-400">
              <Spinner size="lg" />
              <p className="mt-4 text-lg font-medium">{t.craftingDescription}</p>
              <p className="text-sm">{t.mayTakeMoments}</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 bg-red-900/50 p-6 rounded-lg">
              <AlertTriangleIcon className="mx-auto h-12 w-12" />
              <h3 className="mt-2 text-lg font-semibold text-red-300">{t.generationFailed}</h3>
              <p className="mt-1 text-sm max-w-md">{error}</p>
            </div>
          ) : generatedDesc ? (
            <DescriptionCard description={generatedDesc} onUpdate={setGeneratedDesc} />
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-lg">{t.outputAppearsHere}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generator;
