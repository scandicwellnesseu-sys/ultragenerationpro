
import React, { useState, useCallback } from 'react';
import { GeneratedInfluencerContent, ImageFile } from '../types';
import { useGemini } from '../hooks/useGemini';
import { useAppContext } from '../context/AppContext';
import { useTranslations } from '../lib/i18n';
import { UploadIcon, SparklesIcon, AlertTriangleIcon, CopyIcon, CheckIcon } from './Icons';
import ImagePreview from './ImagePreview';
import Spinner from './Spinner';

const OutputCard: React.FC<{ title: string; content: string | string[]; }> = ({ title, content }) => {
    const [copied, setCopied] = useState(false);
    const { showToast } = useAppContext();
    const t = useTranslations();

    const textToCopy = Array.isArray(content) ? content.join(' ') : content;

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast(t.copied, 'success');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-yellow-400">{title}</h3>
                <button onClick={handleCopy} className="flex items-center px-2 py-1 text-xs rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors">
                    {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                </button>
            </div>
            {Array.isArray(content) ? (
                <div className="flex flex-wrap gap-2">
                    {content.map((item, index) => (
                        <span key={index} className="px-2 py-1 text-xs font-medium text-blue-200 bg-blue-900/50 rounded-full">
                            #{item}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{content}</p>
            )}
        </div>
    );
};


const InfluencerToolkit: React.FC = () => {
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [postContext, setPostContext] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedInfluencerContent | null>(null);
  
  const { language, showToast } = useAppContext();
  const { generateInfluencerContent, loading, error } = useGemini();
  const t = useTranslations();

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
    if (!imageFile || !postContext) {
      showToast('Please upload an image and provide context for the post.', 'error');
      return;
    }
    setGeneratedContent(null);
    try {
        const result = await generateInfluencerContent(imageFile, postContext, language);
        if (result) {
          setGeneratedContent(result);
        }
    } catch(e) {
        console.error("Influencer content generation failed:", e);
    }
  };

  const clearImage = useCallback(() => {
    setImageFile(null);
    const fileInput = document.getElementById('influencer-file-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">{t.postDetails}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="influencer-file-upload" className="block text-sm font-medium text-gray-300 mb-2">{t.postImage}</label>
            {imageFile ? (
              <ImagePreview imageFile={imageFile} onClear={clearImage} />
            ) : (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                  <div className="flex text-sm text-gray-400">
                    <label htmlFor="influencer-file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-yellow-400 hover:text-yellow-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-yellow-500">
                      <span>{t.uploadFile}</span>
                      <input id="influencer-file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">{t.dragAndDrop}</p>
                  </div>
                  <p className="text-xs text-gray-500">{t.fileTypes}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="post-context" className="block text-sm font-medium text-gray-300">{t.postContext}</label>
            <textarea
              id="post-context"
              rows={4}
              value={postContext}
              onChange={(e) => setPostContext(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
              placeholder={t.postContextPlaceholder}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !imageFile || !postContext}
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
                {t.generateSocialContent}
              </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-6">{t.aiSocialOutput}</h2>
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
          ) : generatedContent ? (
            <div className="w-full space-y-4">
                <OutputCard title={t.suggestedBio} content={generatedContent.bio} />
                <OutputCard title={t.suggestedCaption} content={generatedContent.caption} />
                <OutputCard title={t.suggestedHashtags} content={generatedContent.hashtags} />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-lg">{t.socialOutputAppearsHere}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfluencerToolkit;
