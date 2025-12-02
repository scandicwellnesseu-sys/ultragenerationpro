import React, { useState } from 'react';
import Spinner from './Spinner';

interface Product {
  name: string;
  price: number;
  minPrice?: number;
  maxPrice?: number;
  stock?: number;
  sku?: string;
  history?: Array<{ date: string; sold: number }>;
}

const ProductImport: React.FC = () => {
  const [csv, setCsv] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCsv(reader.result as string);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const mockRequest = new Request('http://localhost/functions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'importProducts', payload: { csv } })
      });
      // @ts-ignore
      const handler = (await import('../functions/generate')).default;
      const response = await handler(mockRequest);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Import failed');
      setResult(data);
      setProducts(data.products || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-2">Importera produktdata (CSV)</h2>
      <input type="file" accept=".csv" onChange={handleCsvChange} className="mb-2" />
      <button onClick={handleImport} disabled={loading || !csv} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
        {loading ? <Spinner /> : 'Importera'}
      </button>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {result && <div className="text-green-600 mb-2">{result.count} produkter importerade!</div>}
      {products.length > 0 && (
        <table className="w-full border mt-4">
          <thead>
            <tr>
              <th>Namn</th>
              <th>Pris</th>
              <th>Minpris</th>
              <th>Maxpris</th>
              <th>Lager</th>
              <th>SKU</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i}>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.minPrice}</td>
                <td>{p.maxPrice}</td>
                <td>{p.stock}</td>
                <td>{p.sku}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductImport;
