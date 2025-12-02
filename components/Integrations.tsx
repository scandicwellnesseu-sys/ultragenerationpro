import React, { useState } from 'react';
import { LinkIcon, CheckIcon, RefreshIcon, ShoppingBagIcon } from './Icons';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'coming_soon';
  category: 'ecommerce' | 'cms' | 'marketing' | 'crm';
  connectedAt?: string;
  productsSync?: number;
}

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Synka produkter och publicera beskrivningar direkt till din Shopify-butik',
      icon: '🛍️',
      status: 'connected',
      category: 'ecommerce',
      connectedAt: '2024-11-15',
      productsSync: 247,
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      description: 'Integrera med WordPress och WooCommerce för sömlös produkthantering',
      icon: '🟣',
      status: 'disconnected',
      category: 'ecommerce',
    },
    {
      id: 'magento',
      name: 'Adobe Commerce (Magento)',
      description: 'Enterprise-grade integration med Adobe Commerce',
      icon: '🔶',
      status: 'disconnected',
      category: 'ecommerce',
    },
    {
      id: 'wix',
      name: 'Wix',
      description: 'Koppla ihop med din Wix-webbutik',
      icon: '⬛',
      status: 'coming_soon',
      category: 'ecommerce',
    },
    {
      id: 'squarespace',
      name: 'Squarespace',
      description: 'Synka med Squarespace Commerce',
      icon: '⬜',
      status: 'coming_soon',
      category: 'ecommerce',
    },
    {
      id: 'contentful',
      name: 'Contentful',
      description: 'Publicera genererat innehåll till Contentful CMS',
      icon: '📝',
      status: 'disconnected',
      category: 'cms',
    },
    {
      id: 'sanity',
      name: 'Sanity',
      description: 'Integrera med Sanity för headless CMS-arbetsflöden',
      icon: '🔴',
      status: 'coming_soon',
      category: 'cms',
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Exportera produktbeskrivningar till e-postkampanjer',
      icon: '🐵',
      status: 'disconnected',
      category: 'marketing',
    },
    {
      id: 'klaviyo',
      name: 'Klaviyo',
      description: 'Synka med Klaviyo för e-handels-marknadsföring',
      icon: '📧',
      status: 'coming_soon',
      category: 'marketing',
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Integrera med HubSpot CRM och Marketing Hub',
      icon: '🟠',
      status: 'coming_soon',
      category: 'crm',
    },
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showConnectModal, setShowConnectModal] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'Alla' },
    { id: 'ecommerce', name: 'E-handel' },
    { id: 'cms', name: 'CMS' },
    { id: 'marketing', name: 'Marknadsföring' },
    { id: 'crm', name: 'CRM' },
  ];

  const filteredIntegrations = activeCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === activeCategory);

  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  const handleConnect = (integrationId: string) => {
    // In real app, this would open OAuth flow
    setIntegrations(integrations.map(i => 
      i.id === integrationId 
        ? { ...i, status: 'connected' as const, connectedAt: new Date().toISOString().split('T')[0] }
        : i
    ));
    setShowConnectModal(null);
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(integrations.map(i => 
      i.id === integrationId 
        ? { ...i, status: 'disconnected' as const, connectedAt: undefined, productsSync: undefined }
        : i
    ));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Integrationer</h2>
        <p className="text-gray-400 mt-1">Koppla samman UltragenerationPro med dina favoritverktyg</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <LinkIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Aktiva integrationer</p>
              <p className="text-2xl font-bold text-white">{connectedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <ShoppingBagIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Synkade produkter</p>
              <p className="text-2xl font-bold text-white">247</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <RefreshIcon className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Senaste synk</p>
              <p className="text-2xl font-bold text-white">5 min sedan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIntegrations.map((integration) => (
          <div
            key={integration.id}
            className={`bg-gray-800/50 border rounded-xl p-6 ${
              integration.status === 'connected'
                ? 'border-green-500/30'
                : integration.status === 'coming_soon'
                ? 'border-gray-700 opacity-60'
                : 'border-gray-700'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{integration.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                  {integration.status === 'connected' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                      <CheckIcon className="w-3 h-3" />
                      Ansluten
                    </span>
                  )}
                  {integration.status === 'coming_soon' && (
                    <span className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded-full text-xs font-medium">
                      Kommer snart
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-1">{integration.description}</p>
                
                {integration.status === 'connected' && (
                  <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ansluten sedan</span>
                      <span className="text-white">{integration.connectedAt}</span>
                    </div>
                    {integration.productsSync !== undefined && (
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-400">Synkade produkter</span>
                        <span className="text-white">{integration.productsSync}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors">
                        <RefreshIcon className="w-4 h-4" />
                        Synka nu
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="px-3 py-2 text-red-400 hover:text-red-300 text-sm transition-colors"
                      >
                        Koppla från
                      </button>
                    </>
                  ) : integration.status === 'disconnected' ? (
                    <button
                      onClick={() => setShowConnectModal(integration.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Anslut
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-700 text-gray-500 rounded-lg text-sm cursor-not-allowed"
                    >
                      Meddela mig
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Webhook Section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Webhooks</h3>
        <p className="text-gray-400 text-sm mb-4">
          Konfigurera webhooks för att ta emot notifikationer när innehåll genereras.
        </p>
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="url"
              placeholder="https://din-server.com/webhook"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
              Lägg till
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Webhooks skickar POST-förfrågningar med genererat innehåll i JSON-format.
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Exportformat</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { format: 'CSV', desc: 'Kommaseparerad', icon: '📊' },
            { format: 'JSON', desc: 'API-vänlig', icon: '{ }' },
            { format: 'Excel', desc: '.xlsx format', icon: '📗' },
            { format: 'XML', desc: 'Feed-format', icon: '📄' },
          ].map((exp) => (
            <button
              key={exp.format}
              className="p-4 bg-gray-700 border border-gray-600 rounded-xl text-left hover:border-yellow-500/50 transition-colors"
            >
              <div className="text-2xl mb-2">{exp.icon}</div>
              <div className="font-semibold text-white">{exp.format}</div>
              <div className="text-xs text-gray-400">{exp.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              Anslut {integrations.find(i => i.id === showConnectModal)?.name}
            </h3>
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Du kommer att omdirigeras för att autentisera med{' '}
                {integrations.find(i => i.id === showConnectModal)?.name}.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-200">
                ℹ️ Vi lagrar aldrig dina inloggningsuppgifter. Anslutningen sker via OAuth 2.0.
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConnectModal(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={() => handleConnect(showConnectModal)}
                  className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                >
                  Fortsätt till {integrations.find(i => i.id === showConnectModal)?.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;
