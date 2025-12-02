import React, { useState, useCallback } from 'react';
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
  provider: string;
  isFavorite: boolean;
  tags: string[];
}

const IMAGE_STYLES = [
  { id: 'instagram', name: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-500' },
  { id: 'story', name: 'Stories', icon: '📱', color: 'from-orange-500 to-pink-500' },
  { id: 'youtube', name: 'YouTube', icon: '🎬', color: 'from-red-500 to-red-600' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'from-cyan-400 to-pink-500' },
  { id: 'product', name: 'Produkt', icon: '🛍️', color: 'from-amber-400 to-orange-500' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '✨', color: 'from-emerald-400 to-cyan-500' },
  { id: 'flatlay', name: 'Flat Lay', icon: '📐', color: 'from-violet-500 to-purple-500' },
  { id: 'portrait', name: 'Porträtt', icon: '👤', color: 'from-rose-400 to-pink-500' },
  { id: 'minimalist', name: 'Minimalist', icon: '⬜', color: 'from-slate-400 to-slate-600' },
  { id: 'vibrant', name: 'Färgglad', icon: '🌈', color: 'from-yellow-400 via-pink-500 to-purple-500' },
  { id: 'dark', name: 'Moody', icon: '🌙', color: 'from-slate-700 to-slate-900' },
  { id: 'bright', name: 'Ljus', icon: '☀️', color: 'from-yellow-200 to-orange-300' },
  { id: 'cinematic', name: 'Cinematic', icon: '🎥', color: 'from-amber-600 to-amber-800' },
  { id: 'anime', name: 'Anime', icon: '🎌', color: 'from-pink-400 to-blue-500' },
  { id: 'watercolor', name: 'Akvarell', icon: '🎨', color: 'from-blue-300 to-purple-400' },
  { id: '3d', name: '3D Render', icon: '🔮', color: 'from-indigo-500 to-purple-600' },
];

const ASPECT_RATIOS = [
  { id: '1:1', name: '1:1', desc: 'Kvadrat', icon: '⬜', platforms: ['Instagram', 'Facebook'] },
  { id: '9:16', name: '9:16', desc: 'Porträtt', icon: '📱', platforms: ['TikTok', 'Reels', 'Stories'] },
  { id: '16:9', name: '16:9', desc: 'Landskap', icon: '🖥️', platforms: ['YouTube', 'Twitter'] },
  { id: '4:5', name: '4:5', desc: 'Feed', icon: '📷', platforms: ['Instagram Feed'] },
  { id: '2:3', name: '2:3', desc: 'Pinterest', icon: '📌', platforms: ['Pinterest'] },
  { id: '3:2', name: '3:2', desc: 'Foto', icon: '📸', platforms: ['Klassisk foto'] },
  { id: '21:9', name: '21:9', desc: 'Ultra-wide', icon: '🎬', platforms: ['Cinematic'] },
];

const AI_PROVIDERS = [
  { 
    id: 'openai', 
    name: 'DALL-E 3', 
    icon: '🎨', 
    color: 'bg-green-600',
    desc: 'Bäst realism & prompt-följsamhet',
    speed: '15-30s',
    quality: 5,
    price: '$0.04/bild',
    badge: 'REKOMMENDERAD'
  },
  { 
    id: 'flux', 
    name: 'Flux', 
    icon: '⚡', 
    color: 'bg-purple-600',
    desc: 'Snabbast, trending bland kreatörer',
    speed: '3-8s',
    quality: 4.5,
    price: '$0.003/bild',
    badge: 'SNABBAST'
  },
  { 
    id: 'ideogram', 
    name: 'Ideogram 2.0', 
    icon: '✍️', 
    color: 'bg-pink-600',
    desc: 'Bäst på text i bilder',
    speed: '10-20s',
    quality: 4.5,
    price: '$0.02/bild',
    badge: 'BÄST TEXT'
  },
  { 
    id: 'stability', 
    name: 'SDXL Turbo', 
    icon: '🖼️', 
    color: 'bg-blue-600',
    desc: 'Prisvärd, bra konstnärliga stilar',
    speed: '5-15s',
    quality: 4,
    price: '$0.002/bild',
    badge: 'BILLIGAST'
  },
  { 
    id: 'replicate', 
    name: 'Multi-Model', 
    icon: '🔥', 
    color: 'bg-orange-600',
    desc: '100+ modeller att välja mellan',
    speed: 'Varierar',
    quality: 4,
    price: 'Varierar',
    badge: 'FLEXIBEL'
  },
];

const PROMPT_TEMPLATES = [
  { 
    category: '📸 Sociala Medier',
    templates: [
      { name: 'Instagram Aesthetic', prompt: 'Aesthetic flat lay composition with [product], marble background, golden hour lighting, minimal styling, Instagram worthy', tags: ['instagram', 'flatlay'] },
      { name: 'TikTok Viral', prompt: 'Eye-catching dynamic shot, vibrant colors, Gen-Z aesthetic, trending TikTok style, high energy', tags: ['tiktok', 'viral'] },
      { name: 'YouTube Thumbnail', prompt: 'Bold YouTube thumbnail, shocked expression, bright colors, high contrast, attention-grabbing, text space on right', tags: ['youtube', 'thumbnail'] },
    ]
  },
  { 
    category: '👗 Mode & Skönhet',
    templates: [
      { name: 'OOTD Fashion', prompt: 'Fashion editorial OOTD, full body shot, urban background, street style, natural lighting, magazine quality', tags: ['fashion', 'ootd'] },
      { name: 'Beauty Close-up', prompt: 'Professional beauty photography, flawless skin, soft studio lighting, high-end cosmetics, luxury feel', tags: ['beauty', 'makeup'] },
      { name: 'Accessory Shot', prompt: 'Luxury accessory product shot, elegant styling, premium feel, studio lighting, e-commerce ready', tags: ['product', 'luxury'] },
    ]
  },
  { 
    category: '🍔 Mat & Dryck',
    templates: [
      { name: 'Food Photography', prompt: 'Mouthwatering food photography, professional plating, restaurant quality, perfect lighting, appetizing colors', tags: ['food', 'restaurant'] },
      { name: 'Coffee Aesthetic', prompt: 'Cozy coffee shop aesthetic, latte art, warm tones, hygge vibes, Instagram cafe style', tags: ['coffee', 'cozy'] },
      { name: 'Recipe Hero', prompt: 'Recipe hero shot, ingredients arranged beautifully, overhead view, bright natural light, food blog style', tags: ['recipe', 'cooking'] },
    ]
  },
  { 
    category: '🏠 Hem & Inredning',
    templates: [
      { name: 'Scandinavian Interior', prompt: 'Scandinavian interior design, minimalist, natural light, cozy textiles, neutral palette, hygge atmosphere', tags: ['interior', 'scandi'] },
      { name: 'Workspace Setup', prompt: 'Aesthetic desk setup, clean workspace, tech gadgets, plants, natural light, productivity vibes', tags: ['workspace', 'setup'] },
      { name: 'Cozy Corner', prompt: 'Cozy reading nook, warm lighting, soft blankets, books, candles, autumn vibes', tags: ['cozy', 'home'] },
    ]
  },
  { 
    category: '✈️ Resor & Äventyr',
    templates: [
      { name: 'Travel Wanderlust', prompt: 'Breathtaking travel destination, golden hour, wanderlust vibes, cinematic composition, bucket list worthy', tags: ['travel', 'adventure'] },
      { name: 'Beach Paradise', prompt: 'Tropical beach paradise, crystal clear water, palm trees, sunset colors, vacation goals', tags: ['beach', 'tropical'] },
      { name: 'City Exploration', prompt: 'Urban exploration, iconic city landmark, street photography style, local culture, authentic travel', tags: ['city', 'urban'] },
    ]
  },
  { 
    category: '💪 Fitness & Hälsa',
    templates: [
      { name: 'Workout Action', prompt: 'Dynamic fitness action shot, athletic pose, gym environment, motivational, high energy, professional sports photography', tags: ['fitness', 'gym'] },
      { name: 'Wellness Lifestyle', prompt: 'Wellness lifestyle, yoga pose, natural setting, peaceful, healthy living, mindfulness', tags: ['wellness', 'yoga'] },
      { name: 'Healthy Food', prompt: 'Healthy meal prep, colorful vegetables, clean eating, nutritious, fitness lifestyle', tags: ['health', 'nutrition'] },
    ]
  },
];

const NEGATIVE_PROMPTS = {
  default: 'blurry, bad quality, distorted, ugly, deformed, watermark, text, logo, signature, oversaturated',
  portrait: 'blurry, bad anatomy, extra limbs, missing fingers, distorted face, ugly, deformed',
  product: 'blurry, bad lighting, shadows, reflections, watermark, text overlay, cluttered background',
  anime: 'realistic, photograph, 3d render, bad anatomy, extra limbs',
};

export const ImageGenerator: React.FC = () => {
  const { showToast } = useAppContext();
  
  // Core state
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(NEGATIVE_PROMPTS.default);
  const [selectedStyle, setSelectedStyle] = useState('instagram');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'stability' | 'replicate' | 'flux' | 'ideogram'>('openai');
  const [imageQuality, setImageQuality] = useState<'standard' | 'hd'>('standard');
  const [numberOfImages, setNumberOfImages] = useState(1);
  
  // Advanced settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [enhancePromptEnabled, setEnhancePromptEnabled] = useState(true);
  const [seed, setSeed] = useState<number | null>(null);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [steps, setSteps] = useState(30);
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'gallery' | 'templates' | 'history'>('generate');
  const [selectedCategory, setSelectedCategory] = useState(PROMPT_TEMPLATES[0].category);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState<string | null>(null);
  
  // Stats
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const generationsLimit = 100;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Skriv en beskrivning av bilden du vill skapa', 'error');
      return;
    }

    setIsGenerating(true);
    const startTime = Date.now();

    try {
      const styleName = IMAGE_STYLES.find(s => s.id === selectedStyle)?.name || selectedStyle;
      
      let finalPrompt = prompt;
      if (enhancePromptEnabled) {
        finalPrompt = await enhancePromptWithAI(prompt, styleName);
      }

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
            provider: selectedProvider,
            isFavorite: false,
            tags: [selectedStyle, aspectRatio],
          });
        } else {
          showToast(result.error || 'Kunde inte skapa bild', 'error');
          break;
        }
      }

      const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);

      if (newImages.length > 0) {
        setGeneratedImages(prev => [...newImages, ...prev]);
        setGenerationsUsed(prev => prev + newImages.length);
        setTotalGenerations(prev => prev + newImages.length);
        showToast(`✨ ${newImages.length} bild${newImages.length > 1 ? 'er' : ''} skapade på ${generationTime}s!`, 'success');
      }

    } catch (error) {
      showToast('Kunde inte skapa bild. Försök igen.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateSelect = (template: { prompt: string; tags: string[] }) => {
    setPrompt(template.prompt);
    if (template.tags.length > 0) {
      const matchingStyle = IMAGE_STYLES.find(s => template.tags.includes(s.id));
      if (matchingStyle) setSelectedStyle(matchingStyle.id);
    }
    setActiveTab('generate');
    showToast('Mall vald! Anpassa prompten efter dina behov.', 'success');
  };

  const handleDownload = async (image: GeneratedImage, format: 'png' | 'jpg' | 'webp' = 'png') => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ultragen-${image.id}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast(`Bild nedladdad som ${format.toUpperCase()}!`, 'success');
    } catch {
      showToast('Kunde inte ladda ner bilden', 'error');
    }
  };

  const handleCopyPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    showToast('Prompt kopierad till urklipp!', 'success');
  };

  const handleToggleFavorite = (imageId: string) => {
    setGeneratedImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img
    ));
  };

  const handleDelete = (imageId: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== imageId));
    showToast('Bild borttagen', 'success');
  };

  const handleShare = async (image: GeneratedImage) => {
    if (navigator.share) {
      try {
        const response = await fetch(image.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'ultragen-image.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'Skapad med UltraGen AI',
          text: image.prompt,
        });
      } catch {
        // Fallback: copy link
        navigator.clipboard.writeText(image.imageUrl);
        showToast('Bildlänk kopierad!', 'success');
      }
    } else {
      navigator.clipboard.writeText(image.imageUrl);
      showToast('Bildlänk kopierad!', 'success');
    }
  };

  const filteredImages = generatedImages.filter(img => {
    if (searchQuery && !img.prompt.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterProvider && img.provider !== filterProvider) return false;
    return true;
  });

  const favoriteImages = generatedImages.filter(img => img.isFavorite);

  const renderQualityStars = (quality: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < quality ? 'text-yellow-400' : 'text-slate-600'}>★</span>
    ));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-pink-800 to-orange-700 rounded-3xl p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl">
                🎨
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">AI Bildskapare Pro</h1>
                <p className="text-purple-200 mt-1">5 AI-motorer • Obegränsade stilar • Professionell kvalitet</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold">{totalGenerations}</div>
                <div className="text-xs text-purple-200">Bilder skapade</div>
              </div>
              <div className="w-px h-10 bg-white/20"></div>
              <div className="text-right">
                <div className="text-2xl font-bold">{generationsLimit - generationsUsed}</div>
                <div className="text-xs text-purple-200">Kvar denna månad</div>
              </div>
            </div>
          </div>
          
          {/* Quick stats badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            {AI_PROVIDERS.map(p => (
              <span key={p.id} className={`px-3 py-1 ${p.color} bg-opacity-50 backdrop-blur-sm rounded-full text-xs font-medium`}>
                {p.icon} {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl">
          {[
            { id: 'generate', icon: '✨', label: 'Skapa' },
            { id: 'templates', icon: '📋', label: 'Mallar' },
            { id: 'gallery', icon: '🖼️', label: `Galleri (${generatedImages.length})` },
            { id: 'history', icon: '❤️', label: `Favoriter (${favoriteImages.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        {activeTab === 'gallery' && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Sök bilder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'masonry' : 'grid')}
              className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              {viewMode === 'grid' ? '▦' : '▤'}
            </button>
          </div>
        )}
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Main Controls */}
          <div className="xl:col-span-2 space-y-6">
            {/* Prompt Input */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  ✨ Beskriv din bild
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">AI-assisterad</span>
                </label>
                <span className={`text-xs ${prompt.length > 400 ? 'text-orange-400' : 'text-slate-500'}`}>
                  {prompt.length}/500
                </span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Beskriv bilden du vill skapa i detalj... Ex: 'En elegant flat lay med skönhetsprodukter på rosa marmor, mjukt morgonljus, minimalistisk styling med guldaccenter'"
                className="w-full h-36 bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm leading-relaxed"
              />
              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enhancePromptEnabled}
                    onChange={(e) => setEnhancePromptEnabled(e.target.checked)}
                    className="rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="group-hover:text-white transition-colors">🪄 AI-förbättra prompt automatiskt</span>
                </label>
                <button
                  onClick={() => setPrompt('')}
                  className="text-xs text-slate-500 hover:text-white transition-colors"
                >
                  Rensa
                </button>
              </div>
            </div>

            {/* Style Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <label className="text-sm font-semibold text-white mb-4 block">🎨 Välj stil</label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {IMAGE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`group relative p-3 rounded-xl text-center transition-all ${
                      selectedStyle === style.id
                        ? `bg-gradient-to-br ${style.color} text-white shadow-lg scale-105`
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:scale-105'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{style.icon}</span>
                    <span className="text-xs font-medium">{style.name}</span>
                    {selectedStyle === style.id && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <span className="text-purple-600 text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <label className="text-sm font-semibold text-white mb-4 block">📐 Bildformat</label>
              <div className="grid grid-cols-7 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      aspectRatio === ratio.id
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    <span className="text-lg block">{ratio.icon}</span>
                    <span className="text-xs font-bold block">{ratio.name}</span>
                    <span className="text-xs opacity-70">{ratio.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Provider Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <label className="text-sm font-semibold text-white mb-4 block">🤖 AI-motor</label>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {AI_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider.id as typeof selectedProvider)}
                    className={`relative p-4 rounded-xl text-left transition-all ${
                      selectedProvider === provider.id
                        ? `${provider.color} text-white shadow-xl ring-2 ring-white/30`
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    {provider.badge && (
                      <span className={`absolute -top-2 -right-2 px-2 py-0.5 ${
                        selectedProvider === provider.id ? 'bg-white text-slate-900' : 'bg-yellow-500 text-yellow-900'
                      } rounded-full text-xs font-bold`}>
                        {provider.badge}
                      </span>
                    )}
                    <span className="text-2xl block mb-2">{provider.icon}</span>
                    <span className="font-bold block">{provider.name}</span>
                    <span className="text-xs opacity-80 block mt-1">{provider.desc}</span>
                    <div className="mt-2 flex items-center justify-between text-xs opacity-70">
                      <span>⚡ {provider.speed}</span>
                      <span>{renderQualityStars(provider.quality)}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Quality option for DALL-E */}
              {selectedProvider === 'openai' && (
                <div className="mt-4 p-4 bg-slate-700/30 rounded-xl">
                  <label className="text-xs font-semibold text-slate-300 mb-2 block">Kvalitetsnivå</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setImageQuality('standard')}
                      className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                        imageQuality === 'standard' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      Standard ($0.04)
                    </button>
                    <button
                      onClick={() => setImageQuality('hd')}
                      className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                        imageQuality === 'hd' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      HD ✨ ($0.08)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Settings */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full p-4 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2 font-medium">
                  ⚙️ Avancerade inställningar
                </span>
                <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {showAdvanced && (
                <div className="p-6 pt-0 space-y-4 border-t border-slate-700/50">
                  {/* Negative Prompt */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-2 block">
                      🚫 Negativ prompt (vad som INTE ska finnas i bilden)
                    </label>
                    <textarea
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      className="w-full h-20 bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white text-sm resize-none"
                    />
                  </div>
                  
                  {/* Number of Images */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-2 block">
                      📊 Antal bilder: {numberOfImages}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={numberOfImages}
                      onChange={(e) => setNumberOfImages(parseInt(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  {/* Guidance Scale */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-2 block">
                      🎯 Guidance Scale: {guidanceScale} (hur strikt AI:n följer prompten)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={guidanceScale}
                      onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  {/* Seed */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-2 block">
                      🎲 Seed (lämna tomt för slumpmässig)
                    </label>
                    <input
                      type="number"
                      value={seed || ''}
                      onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Slumpmässig"
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-2 text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Preview & Generate */}
          <div className="space-y-6">
            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <Spinner />
                  <span>Skapar {numberOfImages} bild{numberOfImages > 1 ? 'er' : ''}...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">✨</span>
                  <span>Skapa {numberOfImages} bild{numberOfImages > 1 ? 'er' : ''}</span>
                </>
              )}
            </button>

            {/* Preview Area */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                👁️ Förhandsvisning
                {generatedImages.length > 0 && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
                    Senaste generering
                  </span>
                )}
              </h3>
              
              {isGenerating ? (
                <div className="aspect-square bg-slate-700/50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white font-medium">AI skapar din bild...</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {selectedProvider === 'flux' ? '⚡ 3-8 sekunder' : '⏱️ 15-30 sekunder'}
                    </p>
                    <div className="mt-4 w-48 h-1 bg-slate-700 rounded-full mx-auto overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse rounded-full"></div>
                    </div>
                  </div>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative group">
                    <img
                      src={generatedImages[0].imageUrl}
                      alt={generatedImages[0].prompt}
                      className="w-full rounded-xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDownload(generatedImages[0], 'png')}
                        className="p-3 bg-white text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
                        title="Ladda ner PNG"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(generatedImages[0].id)}
                        className={`p-3 rounded-xl transition-colors ${
                          generatedImages[0].isFavorite ? 'bg-red-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-200'
                        }`}
                        title="Favorit"
                      >
                        {generatedImages[0].isFavorite ? '❤️' : '🤍'}
                      </button>
                      <button
                        onClick={() => handleShare(generatedImages[0])}
                        className="p-3 bg-white text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
                        title="Dela"
                      >
                        📤
                      </button>
                      <button
                        onClick={() => handleCopyPrompt(generatedImages[0].prompt)}
                        className="p-3 bg-white text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
                        title="Kopiera prompt"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  {/* Image info */}
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-xs text-slate-400 line-clamp-2">{generatedImages[0].prompt}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <span>{AI_PROVIDERS.find(p => p.id === generatedImages[0].provider)?.icon}</span>
                      <span>{generatedImages[0].style}</span>
                      <span>•</span>
                      <span>{generatedImages[0].aspectRatio}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-slate-700/30 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-600">
                  <div className="text-center text-slate-500">
                    <span className="text-6xl mb-4 block opacity-50">🖼️</span>
                    <p className="font-medium">Din bild visas här</p>
                    <p className="text-xs mt-1">Skriv en prompt och klicka Skapa</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-4 border border-purple-700/30">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                💡 Tips för bättre bilder
              </h4>
              <ul className="text-xs text-purple-200 space-y-2">
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Beskriv ljussättning: "golden hour", "soft studio light"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Ange stil: "minimalist", "luxury", "editorial"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Lägg till detaljer: färger, texturer, atmosfär</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Använd Ideogram för text i bilder</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Category selector */}
          <div className="flex flex-wrap gap-2">
            {PROMPT_TEMPLATES.map(cat => (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === cat.category
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>
          
          {/* Templates grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROMPT_TEMPLATES.find(c => c.category === selectedCategory)?.templates.map((template, index) => (
              <button
                key={index}
                onClick={() => handleTemplateSelect(template)}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 text-left hover:bg-slate-700/50 transition-all group border border-slate-700/50 hover:border-purple-500/50"
              >
                <h3 className="font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-3">{template.prompt}</p>
                <div className="mt-4 flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Använd mall <span>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div>
          {generatedImages.length === 0 ? (
            <div className="bg-slate-800/50 rounded-2xl p-16 text-center border border-slate-700/50">
              <span className="text-7xl mb-6 block opacity-50">🖼️</span>
              <h3 className="text-2xl font-bold text-white mb-2">Ditt galleri är tomt</h3>
              <p className="text-slate-400 mb-6">Skapa din första AI-genererade bild!</p>
              <button
                onClick={() => setActiveTab('generate')}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                ✨ Skapa bild
              </button>
            </div>
          ) : (
            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                : 'columns-2 md:columns-3 lg:columns-4'
            }`}>
              {filteredImages.map((image) => (
                <div 
                  key={image.id} 
                  className={`bg-slate-800/50 rounded-2xl overflow-hidden group border border-slate-700/50 hover:border-purple-500/50 transition-all ${
                    viewMode === 'masonry' ? 'break-inside-avoid mb-4' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="w-full object-cover"
                    />
                    {image.isFavorite && (
                      <div className="absolute top-2 left-2 p-1.5 bg-red-500 rounded-full">
                        <span className="text-xs">❤️</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleDownload(image, 'png')}
                            className="p-2 bg-white/90 text-slate-900 rounded-lg hover:bg-white transition-colors"
                          >
                            ⬇️
                          </button>
                          <button
                            onClick={() => handleToggleFavorite(image.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              image.isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-900 hover:bg-white'
                            }`}
                          >
                            {image.isFavorite ? '❤️' : '🤍'}
                          </button>
                          <button
                            onClick={() => handleCopyPrompt(image.prompt)}
                            className="p-2 bg-white/90 text-slate-900 rounded-lg hover:bg-white transition-colors"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => handleShare(image)}
                            className="p-2 bg-white/90 text-slate-900 rounded-lg hover:bg-white transition-colors"
                          >
                            📤
                          </button>
                          <button
                            onClick={() => handleDelete(image.id)}
                            className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-500 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-slate-400 line-clamp-2">{image.prompt}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <span>{AI_PROVIDERS.find(p => p.id === image.provider)?.icon}</span>
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

      {/* Favorites Tab */}
      {activeTab === 'history' && (
        <div>
          {favoriteImages.length === 0 ? (
            <div className="bg-slate-800/50 rounded-2xl p-16 text-center border border-slate-700/50">
              <span className="text-7xl mb-6 block opacity-50">❤️</span>
              <h3 className="text-2xl font-bold text-white mb-2">Inga favoriter ännu</h3>
              <p className="text-slate-400 mb-6">Markera bilder som favoriter för att hitta dem snabbt!</p>
              <button
                onClick={() => setActiveTab('gallery')}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                🖼️ Gå till galleri
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favoriteImages.map((image) => (
                <div key={image.id} className="bg-slate-800/50 rounded-2xl overflow-hidden group border border-slate-700/50">
                  <div className="relative">
                    <img
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute top-2 left-2 p-1.5 bg-red-500 rounded-full">
                      <span className="text-xs">❤️</span>
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => handleDownload(image, 'png')} className="p-2 bg-white text-slate-900 rounded-lg">⬇️</button>
                      <button onClick={() => handleToggleFavorite(image.id)} className="p-2 bg-red-500 text-white rounded-lg">💔</button>
                      <button onClick={() => handleCopyPrompt(image.prompt)} className="p-2 bg-white text-slate-900 rounded-lg">📋</button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-slate-400 truncate">{image.prompt}</p>
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
