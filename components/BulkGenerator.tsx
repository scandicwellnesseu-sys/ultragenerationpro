
import React, { useState, useMemo } from 'react';
import { BulkProduct } from '../types';
import { useGemini } from '../hooks/useGemini';
import { useAppContext } from '../context/AppContext';
import { useTranslations } from '../lib/i18n';
import { UploadIcon, SparklesIcon, AlertTriangleIcon, XIcon, CsvIcon, TrashIcon } from './Icons';
import DescriptionCard from './DescriptionCard';
import Spinner from './Spinner';
import AiControls from './AiControls';
import { exportToCsv } from '../lib/utils';

const BulkGenerator: React.FC = () => {
  const [products, setProducts] = useState<BulkProduct[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tone, setTone] = useState<string>('friendly');
  const [audience, setAudience] = useState<string>('millennials');
  
  const { brandVoice, language, showToast } = useAppContext();
  const { generateDescription } = useGemini();
  const t = useTranslations();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newProducts: BulkProduct[] = Array.from(files).map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      imageFile: { base64: '', mimeType: file.type, name: file.name },
      title: file.name.split('.').slice(0, -1).join('.').replace(/[-_]/g, ' '),
      keywords: '',
      description: null,
      status: 'pending',
    }));

    setProducts(prev => [...prev, ...newProducts]);

    newProducts.forEach((product, index) => {
      const currentFile = files[index];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setProducts(prev => prev.map(p => 
          p.id === product.id ? { ...p, imageFile: { ...p.imageFile, base64: base64String } } : p
        ));
      };
      reader.readAsDataURL(currentFile);
    });
    
    event.target.value = '';
  };

  const updateProductField = (id: string, field: 'title' | 'keywords', value: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  
  const updateProductDescription = (id: string, newDescription: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, description: newDescription } : p));
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    const productsToGenerate = products.filter(p => p.status === 'pending' && p.title && p.imageFile.base64);

    const promises = productsToGenerate.map(product => {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'loading' } : p));
      return generateDescription(product.imageFile, product.title, product.keywords, brandVoice, language, tone, audience)
        .then(result => {
          if (result) {
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'done', description: result } : p));
          } else {
            throw new Error("Generation returned no result.");
          }
        })
        .catch((e: any) => {
          setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'error', error: e.message || 'Generation failed' } : p));
        });
    });

    await Promise.all(promises);
    setIsGenerating(false);
  };
  
  const { completedCount, pendingCount, errorCount } = useMemo(() => {
    return products.reduce((acc, p) => {
        if (p.status === 'done') acc.completedCount++;
        else if (p.status === 'error') acc.errorCount++;
        else if (p.status === 'pending' && p.title) acc.pendingCount++;
        return acc;
    }, { completedCount: 0, pendingCount: 0, errorCount: 0 });
  }, [products]);

  const handleExport = () => {
    if (completedCount === 0) {
        showToast(t.noCompletedToExport, 'error');
        return;
    }
    exportToCsv(products, 'product-descriptions.csv');
    showToast('CSV exported successfully!', 'success');
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t.uploadProducts}</h2>
                    <p className="text-gray-400 mt-1">{t.uploadDescription}</p>
                </div>
                <div className="flex items-center gap-4">
                    <label htmlFor="bulk-file-upload" className="inline-block cursor-pointer py-3 px-5 rounded-md shadow-sm text-sm font-bold text-gray-900 gold-gradient">
                        <UploadIcon className="w-5 h-5 mr-2 inline"/>
                        <span>{t.uploadImages}</span>
                        <input id="bulk-file-upload" name="bulk-file-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleFileChange} />
                    </label>
                </div>
            </div>
        </div>
        <div className="lg:col-span-1 bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
            <AiControls tone={tone} setTone={setTone} audience={audience} setAudience={setAudience} isBulk={true} />
        </div>
      </div>

      {products.length > 0 && (
        <>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 shadow-lg mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center flex-wrap gap-4 text-sm">
                    <span className="font-bold text-white">{products.length} {t.totalProducts}</span>
                    <span className="text-yellow-400">{pendingCount} {t.ready}</span>
                    <span className="text-green-400">{completedCount} {t.completed}</span>
                    {errorCount > 0 && <span className="text-red-400">{errorCount} {t.errors}</span>}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExport} disabled={completedCount === 0} className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><CsvIcon className="w-5 h-5"/> {t.exportCsv}</button>
                    <button onClick={() => setProducts([])} className="flex items-center gap-2 text-sm bg-red-900/50 hover:bg-red-900/80 text-red-300 font-semibold py-2 px-4 rounded-md transition-colors"><TrashIcon className="w-5 h-5"/> {t.clearAll}</button>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 shadow-lg relative transition-all">
                <button onClick={() => removeProduct(product.id)} className="absolute top-2 right-2 p-1.5 bg-gray-700/50 hover:bg-red-500/50 rounded-full text-gray-400 hover:text-white transition-colors z-10" aria-label="Remove Product">
                    <XIcon className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        {product.imageFile.base64 ? <img src={`data:${product.imageFile.mimeType};base64,${product.imageFile.base64}`} alt={product.title} className="rounded-md object-cover aspect-square bg-gray-900" /> : <div className="rounded-md bg-gray-900 aspect-square flex items-center justify-center"><Spinner/></div>}
                    </div>
                    <div className="space-y-3 flex flex-col">
                        <input type="text" placeholder={`${t.productTitle}*`} value={product.title} onChange={e => updateProductField(product.id, 'title', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md text-white focus:ring-yellow-500 focus:border-yellow-500 text-sm" />
                        <textarea placeholder={`${t.keywords} (${t.keywordsHelper.toLowerCase()})`} value={product.keywords} onChange={e => updateProductField(product.id, 'keywords', e.target.value)} className="w-full flex-grow bg-gray-700 border-gray-600 rounded-md text-white focus:ring-yellow-500 focus:border-yellow-500 text-sm" rows={2}></textarea>
                    </div>
                </div>
                <div className="mt-4 min-h-[200px] flex flex-col justify-center">
                    {product.status === 'loading' && <div className="flex items-center justify-center h-full text-yellow-400"><Spinner size="md"/> <span className="ml-2 text-sm">{t.generating}...</span></div>}
                    {product.status === 'error' && <div className="flex items-center justify-center h-full text-red-400"><AlertTriangleIcon className="w-5 h-5 mr-2"/> <span className="text-sm">{product.error}</span></div>}
                    {product.status === 'done' && product.description && <DescriptionCard description={product.description} onUpdate={(newDesc) => updateProductDescription(product.id, newDesc)} />}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button onClick={handleGenerateAll} disabled={isGenerating || pendingCount === 0} className="py-4 px-10 rounded-lg shadow-sm text-lg font-bold text-gray-900 gold-gradient disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto">
                {isGenerating ? <><Spinner/> {t.generatingLeft} ({pendingCount} {t.left})...</> : <><SparklesIcon className="w-6 h-6 mr-2 inline"/> {t.generateN} {pendingCount} {t.descriptions}</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BulkGenerator;
