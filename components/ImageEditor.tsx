import React, { useState, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import Spinner from './Spinner';
import { 
  removeBackground, 
  upscaleImage, 
  restoreFace, 
  generateVariation, 
  styleTransfer,
  ImageGenerationResult 
} from '../lib/imageAI';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (newImageUrl: string) => void;
  onClose: () => void;
}

const EDIT_TOOLS = [
  { id: 'upscale', name: 'Uppskala 4x', icon: '🔍', desc: 'Öka upplösningen 4 gånger' },
  { id: 'background', name: 'Ta bort bakgrund', icon: '✂️', desc: 'Transparent bakgrund' },
  { id: 'face', name: 'Förbättra ansikten', icon: '👤', desc: 'AI-förbättring av ansikten' },
  { id: 'variation', name: 'Skapa variation', icon: '🎨', desc: 'Liknande men ny version' },
  { id: 'style', name: 'Stil-transfer', icon: '🖌️', desc: 'Applicera konstnärlig stil' },
];

const STYLE_PRESETS = [
  { id: 'oil-painting', name: 'Oljemålning', prompt: 'oil painting style, classical art, brush strokes, museum quality' },
  { id: 'watercolor', name: 'Akvarell', prompt: 'watercolor painting, soft colors, artistic, fine art' },
  { id: 'anime', name: 'Anime', prompt: 'anime art style, vibrant colors, manga illustration' },
  { id: 'pixel-art', name: 'Pixel Art', prompt: 'pixel art style, retro gaming, 8-bit aesthetic' },
  { id: 'sketch', name: 'Skiss', prompt: 'pencil sketch, hand-drawn, artistic drawing' },
  { id: 'pop-art', name: 'Pop Art', prompt: 'pop art style, bold colors, Andy Warhol inspired' },
  { id: 'cyberpunk', name: 'Cyberpunk', prompt: 'cyberpunk style, neon lights, futuristic, sci-fi' },
  { id: 'vintage', name: 'Vintage', prompt: 'vintage photo style, retro, film grain, nostalgic' },
];

const FILTERS = [
  { id: 'none', name: 'Original', css: '' },
  { id: 'grayscale', name: 'Svartvit', css: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sepia', css: 'sepia(100%)' },
  { id: 'warm', name: 'Varm', css: 'saturate(150%) hue-rotate(-10deg)' },
  { id: 'cool', name: 'Kall', css: 'saturate(120%) hue-rotate(10deg)' },
  { id: 'contrast', name: 'Kontrast', css: 'contrast(130%)' },
  { id: 'bright', name: 'Ljus', css: 'brightness(120%)' },
  { id: 'dark', name: 'Mörk', css: 'brightness(80%) contrast(110%)' },
  { id: 'vibrant', name: 'Vibrant', css: 'saturate(180%)' },
  { id: 'muted', name: 'Dämpad', css: 'saturate(60%)' },
];

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onClose }) => {
  const { showToast } = useAppContext();
  
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const [history, setHistory] = useState<string[]>([imageUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTool, setProcessingTool] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [selectedStylePreset, setSelectedStylePreset] = useState<string | null>(null);
  const [customStylePrompt, setCustomStylePrompt] = useState('');
  const [variationPrompt, setVariationPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'tools' | 'filters' | 'styles'>('tools');
  
  // Adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addToHistory = (newImageUrl: string) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newImageUrl];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentImage(newImageUrl);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentImage(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentImage(history[historyIndex + 1]);
    }
  };

  const handleUpscale = async () => {
    setIsProcessing(true);
    setProcessingTool('upscale');
    try {
      const result = await upscaleImage(currentImage);
      if (result.success && result.imageUrl) {
        addToHistory(result.imageUrl);
        showToast('✨ Bild uppskalad 4x!', 'success');
      } else {
        showToast(result.error || 'Kunde inte uppskala', 'error');
      }
    } finally {
      setIsProcessing(false);
      setProcessingTool(null);
    }
  };

  const handleRemoveBackground = async () => {
    setIsProcessing(true);
    setProcessingTool('background');
    try {
      const result = await removeBackground(currentImage);
      if (result.success && result.imageUrl) {
        addToHistory(result.imageUrl);
        showToast('✂️ Bakgrund borttagen!', 'success');
      } else {
        showToast(result.error || 'Kunde inte ta bort bakgrund', 'error');
      }
    } finally {
      setIsProcessing(false);
      setProcessingTool(null);
    }
  };

  const handleFaceRestore = async () => {
    setIsProcessing(true);
    setProcessingTool('face');
    try {
      const result = await restoreFace(currentImage);
      if (result.success && result.imageUrl) {
        addToHistory(result.imageUrl);
        showToast('👤 Ansikten förbättrade!', 'success');
      } else {
        showToast(result.error || 'Kunde inte förbättra ansikten', 'error');
      }
    } finally {
      setIsProcessing(false);
      setProcessingTool(null);
    }
  };

  const handleVariation = async () => {
    if (!variationPrompt.trim()) {
      showToast('Skriv en beskrivning för variationen', 'error');
      return;
    }
    
    setIsProcessing(true);
    setProcessingTool('variation');
    try {
      const result = await generateVariation(currentImage, variationPrompt);
      if (result.success && result.imageUrl) {
        addToHistory(result.imageUrl);
        showToast('🎨 Variation skapad!', 'success');
        setVariationPrompt('');
      } else {
        showToast(result.error || 'Kunde inte skapa variation', 'error');
      }
    } finally {
      setIsProcessing(false);
      setProcessingTool(null);
    }
  };

  const handleStyleTransfer = async () => {
    const stylePrompt = customStylePrompt || STYLE_PRESETS.find(s => s.id === selectedStylePreset)?.prompt;
    if (!stylePrompt) {
      showToast('Välj en stil eller skriv en egen', 'error');
      return;
    }
    
    setIsProcessing(true);
    setProcessingTool('style');
    try {
      const result = await styleTransfer(currentImage, stylePrompt);
      if (result.success && result.imageUrl) {
        addToHistory(result.imageUrl);
        showToast('🖌️ Stil applicerad!', 'success');
      } else {
        showToast(result.error || 'Kunde inte applicera stil', 'error');
      }
    } finally {
      setIsProcessing(false);
      setProcessingTool(null);
    }
  };

  const getAdjustmentFilter = () => {
    const filter = FILTERS.find(f => f.id === selectedFilter)?.css || '';
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) ${filter}`.trim();
  };

  const applyAdjustments = async () => {
    // Apply CSS filters to canvas and export
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = getAdjustmentFilter();
      ctx.drawImage(img, 0, 0);
      
      const newImageUrl = canvas.toDataURL('image/png');
      addToHistory(newImageUrl);
      showToast('✅ Justeringar applicerade!', 'success');
      
      // Reset adjustments
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setBlur(0);
      setSelectedFilter('none');
    };
    img.src = currentImage;
  };

  const handleSave = () => {
    onSave(currentImage);
    showToast('💾 Bild sparad!', 'success');
  };

  const handleDownload = async (format: 'png' | 'jpg' | 'webp' = 'png') => {
    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited-image.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast(`Bild nedladdad som ${format.toUpperCase()}!`, 'success');
    } catch {
      showToast('Kunde inte ladda ner bilden', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            ← Tillbaka
          </button>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🎨 Bildredigerare Pro
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Ångra"
          >
            ↩️
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Gör om"
          >
            ↪️
          </button>
          
          <div className="w-px h-6 bg-slate-700 mx-2"></div>
          
          {/* Download options */}
          <div className="relative group">
            <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
              ⬇️ Ladda ner
            </button>
            <div className="absolute right-0 top-full mt-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleDownload('png')}
                className="block w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-t-lg"
              >
                PNG (Högsta kvalitet)
              </button>
              <button
                onClick={() => handleDownload('jpg')}
                className="block w-full px-4 py-2 text-left text-white hover:bg-slate-700"
              >
                JPG (Mindre fil)
              </button>
              <button
                onClick={() => handleDownload('webp')}
                className="block w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-b-lg"
              >
                WebP (Modern format)
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center gap-2"
          >
            💾 Spara
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Image Preview */}
        <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
          <div className="relative max-w-full max-h-full">
            {isProcessing && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 rounded-xl">
                <div className="text-center">
                  <Spinner />
                  <p className="text-white mt-4 font-medium">
                    {processingTool === 'upscale' && '🔍 Uppskalerar bild...'}
                    {processingTool === 'background' && '✂️ Tar bort bakgrund...'}
                    {processingTool === 'face' && '👤 Förbättrar ansikten...'}
                    {processingTool === 'variation' && '🎨 Skapar variation...'}
                    {processingTool === 'style' && '🖌️ Applicerar stil...'}
                  </p>
                </div>
              </div>
            )}
            <img
              src={currentImage}
              alt="Editing"
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
              style={{ filter: getAdjustmentFilter() }}
            />
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Tools Sidebar */}
        <div className="w-96 bg-slate-900 border-l border-slate-700 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            {[
              { id: 'tools', label: '🛠️ Verktyg' },
              { id: 'filters', label: '🎛️ Filter' },
              { id: 'styles', label: '🖌️ Stilar' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-purple-500 bg-slate-800/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* AI Tools Tab */}
            {activeTab === 'tools' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white mb-3">AI-verktyg</h3>
                
                {/* Quick Tools */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleUpscale}
                    disabled={isProcessing}
                    className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-all disabled:opacity-50"
                  >
                    <span className="text-2xl mb-2 block">🔍</span>
                    <span className="font-medium text-white block">Uppskala 4x</span>
                    <span className="text-xs text-slate-400">Högre upplösning</span>
                  </button>
                  
                  <button
                    onClick={handleRemoveBackground}
                    disabled={isProcessing}
                    className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-all disabled:opacity-50"
                  >
                    <span className="text-2xl mb-2 block">✂️</span>
                    <span className="font-medium text-white block">Ta bort bakgrund</span>
                    <span className="text-xs text-slate-400">Transparent</span>
                  </button>
                  
                  <button
                    onClick={handleFaceRestore}
                    disabled={isProcessing}
                    className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-all disabled:opacity-50"
                  >
                    <span className="text-2xl mb-2 block">👤</span>
                    <span className="font-medium text-white block">Förbättra ansikten</span>
                    <span className="text-xs text-slate-400">AI-retusch</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('styles')}
                    disabled={isProcessing}
                    className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-all disabled:opacity-50"
                  >
                    <span className="text-2xl mb-2 block">🖌️</span>
                    <span className="font-medium text-white block">Stil-transfer</span>
                    <span className="text-xs text-slate-400">Ändra stil</span>
                  </button>
                </div>

                {/* Variation Tool */}
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                  <h4 className="font-medium text-white flex items-center gap-2">
                    🎨 Skapa variation
                  </h4>
                  <textarea
                    value={variationPrompt}
                    onChange={(e) => setVariationPrompt(e.target.value)}
                    placeholder="Beskriv hur variationen ska se ut..."
                    className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm resize-none"
                  />
                  <button
                    onClick={handleVariation}
                    disabled={isProcessing || !variationPrompt.trim()}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    Skapa variation
                  </button>
                </div>
              </div>
            )}

            {/* Filters Tab */}
            {activeTab === 'filters' && (
              <div className="space-y-6">
                {/* Quick Filters */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Snabbfilter</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {FILTERS.map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedFilter(filter.id)}
                        className={`p-2 rounded-lg text-xs transition-all ${
                          selectedFilter === filter.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {filter.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Adjustments */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Justeringar</h3>
                  
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Ljusstyrka: {brightness}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Kontrast: {contrast}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Mättnad: {saturation}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Oskärpa: {blur}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={blur}
                      onChange={(e) => setBlur(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>

                <button
                  onClick={applyAdjustments}
                  disabled={isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  ✨ Applicera justeringar
                </button>
              </div>
            )}

            {/* Styles Tab */}
            {activeTab === 'styles' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white">AI Stil-transfer</h3>
                <p className="text-xs text-slate-400">
                  Förvandla din bild med konstnärliga stilar
                </p>
                
                {/* Style Presets */}
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_PRESETS.map(style => (
                    <button
                      key={style.id}
                      onClick={() => {
                        setSelectedStylePreset(style.id);
                        setCustomStylePrompt('');
                      }}
                      className={`p-3 rounded-xl text-left transition-all ${
                        selectedStylePreset === style.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="font-medium block">{style.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Style */}
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                  <h4 className="font-medium text-white text-sm">Eller beskriv din egen stil</h4>
                  <textarea
                    value={customStylePrompt}
                    onChange={(e) => {
                      setCustomStylePrompt(e.target.value);
                      setSelectedStylePreset(null);
                    }}
                    placeholder="Ex: 'Van Gogh starry night style, swirling brushstrokes'"
                    className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm resize-none"
                  />
                </div>

                <button
                  onClick={handleStyleTransfer}
                  disabled={isProcessing || (!selectedStylePreset && !customStylePrompt.trim())}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  🖌️ Applicera stil
                </button>
              </div>
            )}
          </div>

          {/* History */}
          <div className="border-t border-slate-700 p-4">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">
              Historik ({historyIndex + 1}/{history.length})
            </h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {history.map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setHistoryIndex(index);
                    setCurrentImage(img);
                  }}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    index === historyIndex
                      ? 'border-purple-500'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Version ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
