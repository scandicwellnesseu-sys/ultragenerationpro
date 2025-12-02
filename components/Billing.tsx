
import React, { useState } from 'react';
import { CheckIcon } from './Icons';
import { useTranslations } from '../lib/i18n';
import { useAppContext } from '../context/AppContext';

interface Plan {
  id: string;
  name: string;
  price: string;
  priceMonthly: number;
  credits: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

const Billing: React.FC = () => {
  const t = useTranslations();
  const { language } = useAppContext();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPayment, setSelectedPayment] = useState<string>('card');

  // Pricing in SEK for Nordic market
  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: billingPeriod === 'monthly' ? '249 kr' : '199 kr',
      priceMonthly: billingPeriod === 'monthly' ? 249 : 199,
      credits: '100 krediter/mån',
      features: [
        'Enkel produktgenerering',
        'Standard AI-modell',
        'E-postsupport',
        '3 sparade varumärkesröster',
        'Export till CSV',
      ],
      current: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingPeriod === 'monthly' ? '799 kr' : '649 kr',
      priceMonthly: billingPeriod === 'monthly' ? 799 : 649,
      credits: '500 krediter/mån',
      features: [
        'Allt i Starter',
        'Bulk-generering (upp till 50)',
        'Avancerad AI-modell',
        'Obegränsade varumärkesröster',
        'Prioriterad support',
        'SEO-optimering',
        'A/B-testförslag',
      ],
      popular: true,
    },
    {
      id: 'agency',
      name: 'Agency',
      price: billingPeriod === 'monthly' ? '1 999 kr' : '1 599 kr',
      priceMonthly: billingPeriod === 'monthly' ? 1999 : 1599,
      credits: '2 000 krediter/mån',
      features: [
        'Allt i Pro',
        'API-åtkomst',
        'Upp till 10 teammedlemmar',
        'White-label export',
        'Shopify/WooCommerce-integration',
        'Dedikerad kontaktperson',
        'Anpassade AI-modeller',
        'SLA 99.9% uptime',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Kontakta oss',
      priceMonthly: 0,
      credits: 'Obegränsade krediter',
      features: [
        'Allt i Agency',
        'Obegränsade teammedlemmar',
        'On-premise möjlighet',
        'Anpassad AI-träning',
        'Dedikerad server',
        '24/7 telefonsupport',
        'GDPR-compliance rapport',
        'Anpassade integrationer',
      ],
    },
  ];

  // Nordic payment methods
  const paymentMethods = [
    { id: 'card', name: 'Kort', icon: '💳', description: 'Visa, Mastercard, Amex' },
    { id: 'klarna', name: 'Klarna', icon: '🟣', description: 'Betala senare eller dela upp' },
    { id: 'swish', name: 'Swish', icon: '🔵', description: 'Endast Sverige', country: 'sv' },
    { id: 'vipps', name: 'Vipps', icon: '🟠', description: 'Endast Norge', country: 'no' },
    { id: 'mobilepay', name: 'MobilePay', icon: '🔴', description: 'Danmark & Finland', country: 'dk' },
    { id: 'invoice', name: 'Faktura', icon: '📄', description: 'Endast för Agency & Enterprise' },
  ];

  // Credit packages for one-time purchase
  const creditPackages = [
    { credits: 50, price: 99, popular: false },
    { credits: 150, price: 249, popular: false },
    { credits: 500, price: 699, popular: true },
    { credits: 1000, price: 1199, popular: false },
    { credits: 5000, price: 4999, popular: false },
  ];

  const handleUpgrade = (planId: string) => {
    console.log(`Upgrading to ${planId}`);
  };

  const handleBuyCredits = (credits: number, price: number) => {
    console.log(`Buying ${credits} credits for ${price} kr`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Current Usage Stats */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Din nuvarande användning</h3>
            <p className="text-gray-400">Starter-plan • Förnyas 15 januari 2025</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">67</div>
              <div className="text-sm text-gray-400">Krediter kvar</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">33</div>
              <div className="text-sm text-gray-400">Använda denna månad</div>
            </div>
            <div className="h-12 w-px bg-gray-700" />
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">127</div>
              <div className="text-sm text-gray-400">Totalt genererade</div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-800 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-yellow-500 text-gray-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Månadsvis
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'yearly'
                ? 'bg-yellow-500 text-gray-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Årsvis
            <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Spara 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-gray-800/50 border rounded-xl p-6 shadow-lg flex flex-col ${
              plan.popular
                ? 'border-yellow-400 ring-2 ring-yellow-400/20'
                : plan.current
                ? 'border-green-500'
                : 'border-gray-700'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                  MEST POPULÄR
                </span>
              </div>
            )}
            {plan.current && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  DIN PLAN
                </span>
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-black text-white">{plan.price}</span>
                {plan.priceMonthly > 0 && (
                  <span className="text-gray-400">/mån</span>
                )}
              </p>
              <p className="mt-1 text-yellow-400 font-semibold text-sm">{plan.credits}</p>
            </div>

            <ul className="space-y-3 text-gray-300 text-sm flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <CheckIcon className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={plan.current}
              className={`mt-6 w-full py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                plan.current
                  ? 'bg-gray-700 text-gray-400 cursor-default'
                  : plan.popular
                  ? 'gold-gradient text-gray-900 hover:scale-105'
                  : plan.priceMonthly === 0
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {plan.current
                ? 'Din nuvarande plan'
                : plan.priceMonthly === 0
                ? 'Kontakta oss'
                : 'Uppgradera'}
            </button>
          </div>
        ))}
      </div>

      {/* Credit Packages */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white">Köp extra krediter</h3>
          <p className="mt-2 text-gray-400">Engångsköp som aldrig går ut. Perfekt för extra projekt.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {creditPackages.map((pkg) => (
            <button
              key={pkg.credits}
              onClick={() => handleBuyCredits(pkg.credits, pkg.price)}
              className={`relative p-4 rounded-xl border transition-all hover:scale-105 ${
                pkg.popular
                  ? 'border-yellow-400 bg-yellow-400/10'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  BÄST VÄRDE
                </span>
              )}
              <div className="text-2xl font-bold text-white">{pkg.credits}</div>
              <div className="text-sm text-gray-400">krediter</div>
              <div className="mt-2 text-lg font-semibold text-yellow-400">{pkg.price} kr</div>
              <div className="text-xs text-gray-500">
                {(pkg.price / pkg.credits).toFixed(2)} kr/kredit
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Betalningsmetoder</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedPayment(method.id)}
              className={`p-4 rounded-xl border text-center transition-all ${
                selectedPayment === method.id
                  ? 'border-yellow-400 bg-yellow-400/10'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="text-3xl mb-2">{method.icon}</div>
              <div className="font-semibold text-white text-sm">{method.name}</div>
              <div className="text-xs text-gray-400 mt-1">{method.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 overflow-x-auto">
        <h3 className="text-xl font-bold text-white mb-6">Jämför funktioner</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Funktion</th>
              <th className="text-center py-3 px-4 text-gray-400 font-medium">Starter</th>
              <th className="text-center py-3 px-4 text-yellow-400 font-medium">Pro</th>
              <th className="text-center py-3 px-4 text-gray-400 font-medium">Agency</th>
              <th className="text-center py-3 px-4 text-gray-400 font-medium">Enterprise</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            <tr>
              <td className="py-3 px-4 text-white">Krediter per månad</td>
              <td className="py-3 px-4 text-center text-gray-300">100</td>
              <td className="py-3 px-4 text-center text-gray-300">500</td>
              <td className="py-3 px-4 text-center text-gray-300">2 000</td>
              <td className="py-3 px-4 text-center text-gray-300">Obegränsat</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-white">Teammedlemmar</td>
              <td className="py-3 px-4 text-center text-gray-300">1</td>
              <td className="py-3 px-4 text-center text-gray-300">3</td>
              <td className="py-3 px-4 text-center text-gray-300">10</td>
              <td className="py-3 px-4 text-center text-gray-300">Obegränsat</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-white">API-åtkomst</td>
              <td className="py-3 px-4 text-center text-red-400">✕</td>
              <td className="py-3 px-4 text-center text-red-400">✕</td>
              <td className="py-3 px-4 text-center text-green-400">✓</td>
              <td className="py-3 px-4 text-center text-green-400">✓</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-white">E-handels-integrationer</td>
              <td className="py-3 px-4 text-center text-red-400">✕</td>
              <td className="py-3 px-4 text-center text-yellow-400">Basic</td>
              <td className="py-3 px-4 text-center text-green-400">Full</td>
              <td className="py-3 px-4 text-center text-green-400">Full + Anpassad</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-white">Support</td>
              <td className="py-3 px-4 text-center text-gray-300">E-post</td>
              <td className="py-3 px-4 text-center text-gray-300">Prioriterad</td>
              <td className="py-3 px-4 text-center text-gray-300">Dedikerad</td>
              <td className="py-3 px-4 text-center text-gray-300">24/7 Telefon</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-white">AI-modell</td>
              <td className="py-3 px-4 text-center text-gray-300">Standard</td>
              <td className="py-3 px-4 text-center text-gray-300">Avancerad</td>
              <td className="py-3 px-4 text-center text-gray-300">Premium</td>
              <td className="py-3 px-4 text-center text-gray-300">Anpassad</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FAQ */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Vanliga frågor</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-2">Vad är en kredit?</h4>
            <p className="text-gray-400 text-sm">
              En kredit = en genererad produktbeskrivning. Bulk-generering använder en kredit per produkt.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Kan jag byta plan?</h4>
            <p className="text-gray-400 text-sm">
              Ja, du kan uppgradera eller nedgradera när som helst. Oanvända krediter rullar över vid uppgradering.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Hur fungerar fakturering?</h4>
            <p className="text-gray-400 text-sm">
              Fakturering finns för Agency och Enterprise. Betalningsvillkor är 30 dagar netto.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Finns det en bindningstid?</h4>
            <p className="text-gray-400 text-sm">
              Nej, alla planer är utan bindningstid. Du kan säga upp när som helst.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
