import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Spinner from './Spinner';
import { generateImage, enhancePromptWithAI, ImageGenerationResult } from '../lib/imageAI';

interface GeneratedImage {
  id: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  imageUrl: string;
  createdAt: Date;
}

const IMAGE_STYLES = [
  { id: 'instagram', name: 'Instagram Post', icon: '📸' },
  { id: 'story', name: 'Story/Reels', icon: '📱' },
  { id: 'youtube', name: 'YouTube Thumbnail', icon: '🎬' },
  { id: 'tiktok', name: 'TikTok Cover', icon: '🎵' },
  { id: 'product', name: 'Produktbild', icon: '🛍️' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '✨' },
  { id: 'flatlay', name: 'Flat Lay', icon: '📐' },
  { id: 'portrait', name: 'Porträtt', icon: '👤' },
  { id: 'minimalist', name: 'Minimalistisk', icon: '⬜' },
  { id: 'vibrant', name: 'Färgglad', icon: '🌈' },
  { id: 'dark', name: 'Mörk/Moody', icon: '🌙' },
  { id: 'bright', name: 'Ljus/Airy', icon: '☀️' },
];

const ASPECT_RATIOS = [
  { id: '1:1', name: 'Kvadrat (1:1)', desc: 'Instagram, Facebook' },
  { id: '9:16', name: 'Porträtt (9:16)', desc: 'Stories, Reels, TikTok' },
  { id: '16:9', name: 'Landskap (16:9)', desc: 'YouTube, Twitter' },
  { id: '4:5', name: 'Porträtt (4:5)', desc: 'Instagram Feed' },
  { id: '2:3', name: 'Pinterest (2:3)', desc: 'Pinterest Pins' },
];

const PROMPT_TEMPLATES = [
  { name: 'Produktrecension', prompt: 'Aesthetic flat lay med [produkt] på marmorbakgrund, naturligt ljus, minimalistisk styling' },
  { name: 'Outfit of the Day', prompt: 'Fashion OOTD, full outfit på neutral bakgrund, professionell belysning, Instagram-stil' },
  { name: 'Matbild', prompt: 'Aptitlig food photography, [rätt] på vacker tallrik, restaurangkvalitet, perfekt ljussättning' },
  { name: 'Reseinnehåll', prompt: 'Drömlik resebild, [destination], gyllene timmen, wanderlust-känsla' },
  { name: 'Skönhet/Makeup', prompt: 'Beauty close-up, perfekt hud, professionell makeup, mjukt ljus' },
  { name: 'Fitness', prompt: 'Dynamisk fitness-bild, aktiv pose, motiverande atmosfär, energisk känsla' },
  { name: 'Hem/Inredning', prompt: 'Scandinavian interior, mysig atmosfär, naturligt ljus, stilren inredning' },
  { name: 'Tech/Gadgets', prompt: 'Clean tech setup, minimalistisk, moderna gadgets, professionell produktfoto' },
];

export const ImageGenerator: React.FC = () => {
  const { showToast } = useAppContext();
  
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('instagram');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [enhancePromptEnabled, setEnhancePromptEnabled] = useState(true);
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [activeTab, setActiveTab] = useState<'generate' | 'gallery' | 'templates'>('generate');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'stability' | 'replicate'>('openai');
  const [imageQuality, setImageQuality] = useState<'standard' | 'hd'>('standard');
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const generationsLimit = 100;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Skriv en beskrivning av bilden du vill skapa', 'error');
      return;
    }

    setIsGenerating(true);

    try {
      const styleName = IMAGE_STYLES.find(s => s.id === selectedStyle)?.name || selectedStyle;
      
      // Förbättra prompt med AI om aktiverat
      let finalPrompt = prompt;
      if (enhancePromptEnabled) {
        finalPrompt = await enhancePromptWithAI(prompt, styleName);
      }

      // Generera bilder med vald AI-provider
      const newImages: GeneratedImage[] = [];
      
      for (let i = 0; i < numberOfImages; i++) {
        const result: ImageGenerationResult = await generateImage({
          prompt: finalPrompt,
          style: selectedStyle,
          aspectRatio: aspectRatio,
          quality: imageQuality,
          provider: selectedProvider,
        });

        if (result.success && result.imageUrl) {
          newImages.push({
            id: `img-${Date.now()}-${i}`,
            prompt: result.revisedPrompt || finalPrompt,
            style: styleName,
            aspectRatio: aspectRatio,
            imageUrl: result.imageUrl,
            createdAt: new Date(),
          });
        } else {
          showToast(result.error || 'Kunde inte skapa bild', 'error');
          break;
        }
      }

      if (newImages.length > 0) {
        setGeneratedImages(prev => [...newImages, ...prev]);
        showToast(`${newImages.length} bild${newImages.length > 1 ? 'er' : ''} skapade med ${selectedProvider.toUpperCase()}!`, 'success');
        setGenerationsUsed(prev => prev + newImages.length);
      }

    } catch (error) {
      showToast('Kunde inte skapa bild. Försök igen.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateSelect = (template: typeof PROMPT_TEMPLATES[0]) => {
    setPrompt(template.prompt);
    setActiveTab('generate');
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ultragen-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('Bild nedladdad!', 'success');
    } catch {
      showToast('Kunde inte ladda ner bilden', 'error');
    }
  };

  const handleCopyPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    showToast('Prompt kopierad!', 'success');
  };

  const handleDelete = (imageId: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== imageId));
    showToast('Bild borttagen', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🎨</span>
          <div>
            <h1 className="text-2xl font-bold">AI Bildskapare</h1>
            <p className="text-purple-100">Skapa professionella bilder för sociala medier</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Instagram</span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">TikTok</span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">YouTube</span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Pinterest</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'generate'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          ✨ Skapa Bild
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'templates'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          📋 Mallar
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'gallery'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          🖼️ Galleri ({generatedImages.length})
        </button>
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Prompt Input */}
            <div className="bg-slate-800 rounded-xl p-5">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Beskriv din bild
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: En estetisk flat lay med skönhetsprodukter på rosa marmorbakgrund, mjukt naturligt ljus, Instagram-stil..."
                className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 text-sm text-slate-400">
                  <input
                    type="checkbox"
                    checked={enhancePromptEnabled}
                    onChange={(e) => setEnhancePromptEnabled(e.target.checked)}
                    className="rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
                  />
                  🪄 AI-förbättra prompt
                </label>
                <span className="text-xs text-slate-500">{prompt.length}/500</span>
              </div>
            </div>

            {/* Style Selection */}
            <div className="bg-slate-800 rounded-xl p-5">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Välj stil
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {IMAGE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      selectedStyle === style.id
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <span className="text-xl block mb-1">{style.icon}</span>
                    <span className="text-xs">{style.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="bg-slate-800 rounded-xl p-5">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Bildformat
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`p-3 rounded-lg text-left transition-all ${
                      aspectRatio === ratio.id
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <span className="font-medium block">{ratio.name}</span>
                    <span className="text-xs opacity-70">{ratio.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Images */}
            <div className="bg-slate-800 rounded-xl p-5">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Antal bilder: {numberOfImages}
              </label>
              <input
                type="range"
                min="1"
                max="4"
                value={numberOfImages}
                onChange={(e) => setNumberOfImages(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
              </div>
            </div>

            {/* AI Provider Selection */}
            <div className="bg-slate-800 rounded-xl p-5">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                AI-motor
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedProvider('openai')}
                  className={`p-3 rounded-lg text-center transition-all ${
                    selectedProvider === 'openai'
                      ? 'bg-green-600 text-white ring-2 ring-green-400'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="text-xl block mb-1">🎨</span>
                  <span className="text-xs font-medium">DALL-E 3</span>
                  <span className="text-xs block opacity-60">OpenAI</span>
                </button>
                <button
                  onClick={() => setSelectedProvider('stability')}
                  className={`p-3 rounded-lg text-center transition-all ${
                    selectedProvider === 'stability'
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="text-xl block mb-1">🖼️</span>
                  <span className="text-xs font-medium">SDXL</span>
                  <span className="text-xs block opacity-60">Stability</span>
                </button>
                <button
                  onClick={() => setSelectedProvider('replicate')}
                  className={`p-3 rounded-lg text-center transition-all ${
                    selectedProvider === 'replicate'
                      ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="text-xl block mb-1">🔥</span>
                  <span className="text-xs font-medium">Replicate</span>
                  <span className="text-xs block opacity-60">Multi-model</span>
                </button>
              </div>
              {selectedProvider === 'openai' && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setImageQuality('standard')}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                      imageQuality === 'standard'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setImageQuality('hd')}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                      imageQuality === 'hd'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    HD ✨
                  </button>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Spinner />
                  Skapar {numberOfImages} bild{numberOfImages > 1 ? 'er' : ''}...
                </>
              ) : (
                <>
                  ✨ Skapa {numberOfImages} bild{numberOfImages > 1 ? 'er' : ''}
                </>
              )}
            </button>

            {/* Credits Info */}
            <div className="bg-slate-800/50 rounded-lg p-3 text-center text-sm text-slate-400">
              <span className="text-purple-400 font-medium">
                {generationsLimit - generationsUsed}
              </span>
              {' '}generationer kvar denna månad
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="bg-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-medium text-white mb-4">Förhandsvisning</h3>
            {isGenerating ? (
              <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">AI skapar din bild...</p>
                  <p className="text-xs text-slate-500 mt-2">Detta kan ta 10-30 sekunder</p>
                </div>
              </div>
            ) : generatedImages.length > 0 ? (
              <div className="space-y-4">
                <img
                  src={generatedImages[0].imageUrl}
                  alt={generatedImages[0].prompt}
                  className="w-full rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(generatedImages[0])}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ⬇️ Ladda ner
                  </button>
                  <button
                    onClick={() => handleCopyPrompt(generatedImages[0].prompt)}
                    className="flex-1 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                  >
                    📋 Kopiera prompt
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <span className="text-6xl mb-4 block">🖼️</span>
                  <p>Din genererade bild visas här</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROMPT_TEMPLATES.map((template, index) => (
            <button
              key={index}
              onClick={() => handleTemplateSelect(template)}
              className="bg-slate-800 rounded-xl p-5 text-left hover:bg-slate-700 transition-colors group"
            >
              <h3 className="font-medium text-white mb-2 group-hover:text-purple-400 transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-slate-400 line-clamp-3">{template.prompt}</p>
              <div className="mt-3 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Klicka för att använda →
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div>
          {generatedImages.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-12 text-center">
              <span className="text-6xl mb-4 block">🖼️</span>
              <h3 className="text-xl font-medium text-white mb-2">Inga bilder ännu</h3>
              <p className="text-slate-400 mb-4">Skapa din första AI-genererade bild!</p>
              <button
                onClick={() => setActiveTab('generate')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                ✨ Skapa bild
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {generatedImages.map((image) => (
                <div key={image.id} className="bg-slate-800 rounded-xl overflow-hidden group">
                  <div className="relative">
                    <img
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDownload(image)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        title="Ladda ner"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => handleCopyPrompt(image.prompt)}
                        className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500"
                        title="Kopiera prompt"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        title="Ta bort"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-slate-400 truncate">{image.prompt}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{image.style}</span>
                      <span>•</span>
                      <span>{image.aspectRatio}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
