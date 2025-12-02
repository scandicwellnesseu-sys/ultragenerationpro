import React, { useState } from 'react';
import Spinner from './Spinner';

interface ProductReport {
  originalPrice: number;
  aiPrice: number;
  name: string;
}

const mockProducts: ProductReport[] = [
  { name: 'Produkt A', originalPrice: 100, aiPrice: 112 },
  { name: 'Produkt B', originalPrice: 200, aiPrice: 220 },
  { name: 'Produkt C', originalPrice: 150, aiPrice: 170 },
  { name: 'Produkt D', originalPrice: 80, aiPrice: 95 },
];

const AiVsOriginalReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const mockRequest = new Request('http://localhost/functions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getAiVsOriginalReport', payload: { products: mockProducts } })
      });
      // @ts-ignore
      const handler = (await import('../functions/generate')).default;
      const response = await handler(mockRequest);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Kunde inte hämta rapport');
      setReport(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-2">Rapport – AI vs original</h2>
      <button onClick={handleGetReport} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
        {loading ? <Spinner /> : 'Visa rapport'}
      </button>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {report && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mt-4">
          <div className="mb-2">Antal prisändringar: <b>{report.numChanges}</b></div>
          <div className="mb-2">Snittpris före: <b>{report.avgOriginal} kr</b></div>
          <div className="mb-2">Snittpris efter: <b>{report.avgAi} kr</b></div>
          <div className="mb-2">Förväntad vinstökning: <b>{report.expectedProfit} kr</b></div>
          <div className="mb-2">Mest optimerade produkter:</div>
          <ul className="list-disc ml-6">
            {report.mostOptimized.map((p: any, i: number) => (
              <li key={i}>{p.name}: {p.originalPrice} → {p.aiPrice} kr</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AiVsOriginalReport;
