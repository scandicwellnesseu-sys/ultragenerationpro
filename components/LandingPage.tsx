import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-indigo-500/10" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
              <span className="gold-text-gradient">AI-driven prissättning</span>
              <br />
              <span className="text-white">för e-handel</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Öka din omsättning med intelligenta prisförslag. Generera produktbeskrivningar på sekunder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 text-lg font-bold rounded-xl gold-gradient text-gray-900 hover:scale-105 transition-transform"
              >
                Kom igång gratis →
              </button>
              <a
                href="#demo"
                className="px-8 py-4 text-lg font-bold rounded-xl border border-gray-600 text-white hover:bg-gray-800 transition-colors"
              >
                Se demo
              </a>
            </div>
            <p className="mt-4 text-gray-500">Ingen kreditkort krävs • 14 dagars gratis provperiod</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            Allt du behöver för smartare prissättning
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'AI Prisoptimering',
                description: 'Automatiska prisförslag baserat på efterfrågan, lager och konkurrenter.',
              },
              {
                icon: '✍️',
                title: 'Produktbeskrivningar',
                description: 'Generera SEO-optimerade beskrivningar från produktbilder på sekunder.',
              },
              {
                icon: '🔗',
                title: 'E-handelsintegrationer',
                description: 'Koppla Shopify, WooCommerce, Magento med ett klick.',
              },
              {
                icon: '📊',
                title: 'Analytics Dashboard',
                description: 'Se hur AI-priser påverkar din försäljning i realtid.',
              },
              {
                icon: '📦',
                title: 'Bulk-generering',
                description: 'Uppdatera hundratals produkter samtidigt.',
              },
              {
                icon: '🌍',
                title: 'Flerspråksstöd',
                description: 'Generera innehåll på svenska, engelska, spanska och fler.',
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 border-t border-gray-800" id="pricing">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
            Enkla, transparenta priser
          </h2>
          <p className="text-center text-gray-400 mb-12">Välj den plan som passar ditt företag</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '299',
                features: ['100 AI-generationer/mån', 'Prisförslag', 'Email-support', '1 butik'],
              },
              {
                name: 'Pro',
                price: '799',
                popular: true,
                features: ['500 AI-generationer/mån', 'Bulk-generering', 'API-access', '5 butiker', 'Prioriterad support'],
              },
              {
                name: 'Agency',
                price: '1 999',
                features: ['Obegränsade generationer', 'White-label', 'Obegränsade butiker', 'Dedikerad support', 'Custom integrationer'],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-8 rounded-xl ${
                  plan.popular
                    ? 'bg-gradient-to-b from-yellow-500/20 to-transparent border-2 border-yellow-500/50'
                    : 'bg-gray-800/50 border border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="text-yellow-400 text-sm font-bold mb-2">POPULÄRAST</div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-gray-400"> kr/mån</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center text-gray-300">
                      <span className="text-green-400 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-lg font-bold transition-colors ${
                    plan.popular
                      ? 'gold-gradient text-gray-900'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Kom igång
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Redo att öka din försäljning?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Gå med 500+ e-handlare som redan använder UltragenerationPro
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 text-lg font-bold rounded-xl gold-gradient text-gray-900 hover:scale-105 transition-transform"
          >
            Starta gratis provperiod →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} UltragenerationPro. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
