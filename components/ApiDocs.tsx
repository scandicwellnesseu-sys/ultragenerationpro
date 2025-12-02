import React, { useState } from 'react';

function generateApiKey() {
  return 'sk_' + Math.random().toString(36).slice(2, 18);
}

const ApiDocs: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">API-dokumentation</h2>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Endpoints</h3>
        <ul className="list-disc ml-6 text-gray-300">
          <li><code className="bg-gray-700 px-1 rounded">POST /api/price-suggestion</code> – Få AI-prisförslag för produkt</li>
          <li><code className="bg-gray-700 px-1 rounded">POST /api/approve-price</code> – Godkänn och publicera nytt pris</li>
          <li><code className="bg-gray-700 px-1 rounded">GET /api/products</code> – Lista produkter</li>
          <li><code className="bg-gray-700 px-1 rounded">GET /api/credits</code> – Hämta kreditsaldo</li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Autentisering</h3>
        <p className="text-gray-300 mb-2">Använd din API-nyckel i headern:</p>
        <pre className="bg-gray-900 p-2 rounded text-sm text-green-400">Authorization: Bearer sk_xxx...</pre>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Generera API-nyckel</h3>
        <button
          onClick={() => setApiKey(generateApiKey())}
          className="bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded hover:bg-yellow-400 transition"
        >
          Generera ny API-nyckel
        </button>
        {apiKey && (
          <div className="mt-3 bg-gray-900 p-2 rounded text-green-400 break-all">
            {apiKey}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Exempel</h3>
        <pre className="bg-gray-900 p-2 rounded text-sm text-blue-300 overflow-x-auto">
{`curl -X POST https://api.yourapp.com/api/price-suggestion \\
  -H "Authorization: Bearer sk_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"productId": "123"}'`}
        </pre>
      </section>
    </div>
  );
};

export default ApiDocs;
