import React, { useState } from 'react';
import { KeyIcon, CopyIcon, CheckIcon, TrashIcon, PlusIcon, RefreshIcon } from './Icons';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  requests: number;
  status: 'active' | 'revoked';
}

const ApiKeys: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production Key',
      key: 'ugp_live_sk_1234567890abcdef',
      createdAt: '2024-11-15',
      lastUsed: '2024-12-02',
      requests: 1247,
      status: 'active',
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'ugp_test_sk_0987654321fedcba',
      createdAt: '2024-10-20',
      lastUsed: '2024-11-28',
      requests: 532,
      status: 'active',
    },
  ]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `ugp_live_sk_${Math.random().toString(36).substring(2, 18)}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: null,
      requests: 0,
      status: 'active',
    };
    
    setApiKeys([newKey, ...apiKeys]);
    setNewlyCreatedKey(newKey.key);
    setNewKeyName('');
    setShowCreateModal(false);
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, status: 'revoked' as const } : key
    ));
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  const maskKey = (key: string) => {
    return key.substring(0, 12) + '••••••••••••••••';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">API-nycklar</h2>
          <p className="text-gray-400 mt-1">Hantera dina API-nycklar för att integrera med externa system</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Skapa ny nyckel
        </button>
      </div>

      {/* Newly Created Key Alert */}
      {newlyCreatedKey && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <KeyIcon className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-400">Ny API-nyckel skapad!</h3>
              <p className="text-gray-400 text-sm mt-1">
                Kopiera och spara din nyckel nu. Du kommer inte kunna se den igen.
              </p>
              <div className="mt-4 flex items-center gap-4">
                <code className="flex-1 bg-gray-800 px-4 py-3 rounded-lg font-mono text-sm text-white">
                  {newlyCreatedKey}
                </code>
                <button
                  onClick={() => {
                    handleCopyKey(newlyCreatedKey);
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  {copiedKey === newlyCreatedKey ? (
                    <>
                      <CheckIcon className="w-5 h-5 text-green-400" />
                      Kopierad!
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-5 h-5" />
                      Kopiera
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={() => setNewlyCreatedKey(null)}
                className="mt-4 text-sm text-gray-400 hover:text-white"
              >
                Jag har sparat nyckeln
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Limits */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API-användning denna månad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-400 text-sm">Förfrågningar</p>
            <p className="text-2xl font-bold text-white">1,779 <span className="text-gray-400 text-lg">/ 10,000</span></p>
            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '17.79%' }} />
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Krediter använda via API</p>
            <p className="text-2xl font-bold text-white">423</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Genomsnittlig svarstid</p>
            <p className="text-2xl font-bold text-white">324 <span className="text-gray-400 text-lg">ms</span></p>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Dina nycklar</h3>
        </div>
        <div className="divide-y divide-gray-700">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-6 flex items-center gap-4">
              <div className={`p-2 rounded-lg ${apiKey.status === 'active' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <KeyIcon className={`w-5 h-5 ${apiKey.status === 'active' ? 'text-green-400' : 'text-red-400'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-white">{apiKey.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    apiKey.status === 'active' 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {apiKey.status === 'active' ? 'Aktiv' : 'Återkallad'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                  <code className="font-mono">{maskKey(apiKey.key)}</code>
                  <span>•</span>
                  <span>Skapad {apiKey.createdAt}</span>
                  {apiKey.lastUsed && (
                    <>
                      <span>•</span>
                      <span>Senast använd {apiKey.lastUsed}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{apiKey.requests.toLocaleString()} förfrågningar</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {apiKey.status === 'active' && (
                  <>
                    <button
                      onClick={() => handleCopyKey(apiKey.key)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="Kopiera nyckel"
                    >
                      {copiedKey === apiKey.key ? (
                        <CheckIcon className="w-5 h-5 text-green-400" />
                      ) : (
                        <CopyIcon className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRevokeKey(apiKey.id)}
                      className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Återkalla nyckel"
                    >
                      <RefreshIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteKey(apiKey.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Ta bort nyckel"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Documentation */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Snabbstart</h3>
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm mb-2">Exempel på API-anrop (cURL):</p>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
{`curl -X POST https://api.ultragenerationpro.com/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/product.jpg",
    "title": "Ekologisk Ansiktskräm",
    "language": "sv",
    "tone": "professional",
    "audience": "millennials"
  }'`}
              </pre>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">Svar:</p>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
{`{
  "success": true,
  "data": {
    "headline": "Naturlig skönhet börjar med ren hud",
    "body": "Vår ekologiska ansiktskräm är...",
    "meta_description": "Upptäck vår ekologiska ansiktskräm...",
    "feature_bullets": [...],
    "seo_keywords": [...]
  },
  "credits_used": 1,
  "credits_remaining": 576
}`}
              </pre>
            </div>
          </div>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
            >
              📚 Full API-dokumentation →
            </a>
            <a
              href="#"
              className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
            >
              💡 Exempelkod (GitHub) →
            </a>
          </div>
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Skapa ny API-nyckel</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nyckelnamn
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="t.ex. Production, Development, Shopify Integration"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-yellow-200">
                ⚠️ Din API-nyckel visas endast en gång. Se till att kopiera och spara den på ett säkert ställe.
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewKeyName('');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim()}
                  className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skapa nyckel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;
