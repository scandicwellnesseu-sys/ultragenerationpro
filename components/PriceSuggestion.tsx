import React, { useState } from 'react';
import Spinner from './Spinner';

interface PriceSuggestionProps {
  product: {
    name: string;
    current_price: number;
    min_price?: number;
    max_price?: number;
    stock?: number;
    competitor_price?: number;
    sales_history?: Array<{ date: string; sold: number }>;
    season?: string;
  };
}

const PriceSuggestion: React.FC<PriceSuggestionProps> = ({ product }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    try {
      const mockRequest = new Request('http://localhost/functions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggestPrice', payload: product })
      });
      // @ts-ignore
      const handler = (await import('../functions/generate')).default;
      const response = await handler(mockRequest);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Kunde inte hämta prisförslag');
      setSuggestion(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-4 mb-4">
      <h3 className="font-bold text-lg mb-2">AI-prisförslag för {product.name}</h3>
      <button onClick={handleSuggest} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded mb-2">
        {loading ? <Spinner /> : 'Visa prisförslag'}
      </button>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {suggestion && (
        <div className="mt-2">
          <div className="text-xl font-bold">Rekommenderat pris: {suggestion.recommended_price} kr ({suggestion.change_percent >= 0 ? '↑' : '↓'}{Math.abs(suggestion.change_percent)}%)</div>
          <div className="text-gray-600 text-sm mt-1">Formel: {suggestion.formula}</div>
          <div className="text-gray-600 text-sm">Detaljer: {JSON.stringify(suggestion.details)}</div>
        </div>
      )}
    </div>
  );
};

export default PriceSuggestion;
