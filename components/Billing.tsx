
import React, { useState } from 'react';
import { CheckIcon } from './Icons';
import { useTranslations } from '../lib/i18n';

const Billing: React.FC = () => {
  const t = useTranslations();

  const plans = [
    {
      name: 'Starter',
      price: '$29',
      credits: '100 credits/mo',
      features: ['Single Generation', 'Standard AI Model', 'Email Support'],
      cta: t.yourCurrentPlan,
      current: true,
    },
    {
      name: 'Pro',
      price: '$99',
      credits: '500 credits/mo',
      features: ['Bulk Generation', 'Brand Voice', 'Advanced AI Model', 'Priority Support'],
      cta: t.upgradeToPro,
      current: false,
    },
    {
      name: 'Agency',
      price: '$249',
      credits: '2000 credits/mo',
      features: ['Everything in Pro', 'API Access', 'Team Seats', 'Dedicated Support'],
      cta: t.contactSales,
      current: false,
    },
  ];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (plan: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createStripeCheckout', payload: { plan, email: 'user@example.com' } }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError('Kunde inte starta betalning.');
      }
    } catch (e) {
      setError('Något gick fel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-gray-800/50 border rounded-xl p-8 shadow-lg flex flex-col ${
              plan.current ? 'border-yellow-400' : 'border-gray-700'
            }`}
          >
            <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
            <p className="mt-4">
              <span className="text-4xl font-black text-white">{plan.price}</span>
              <span className="text-lg font-medium text-gray-400">/mo</span>
            </p>
            <p className="mt-1 text-yellow-400 font-semibold">{plan.credits}</p>
            <ul className="mt-6 space-y-4 text-gray-300 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-1" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              disabled={plan.current || loading}
              className={`mt-8 w-full py-3 px-4 rounded-md text-sm font-bold transition-colors ${
                plan.current
                  ? 'bg-gray-700 text-gray-400 cursor-default'
                  : 'text-gray-900 gold-gradient'
              }`}
              onClick={() => handleCheckout(plan.name.toLowerCase())}
            >
              {loading ? 'Laddar...' : plan.cta}
            </button>
            {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
          </div>
        ))}
      </div>
      <div className="mt-12 text-center bg-gray-800/50 border border-gray-700 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-white">{t.needMoreCredits}</h3>
        <p className="mt-2 text-gray-400">{t.creditsExpire}</p>
        <div className="mt-6 flex flex-wrap justify-center items-baseline gap-4 md:gap-8">
            <button className="text-gray-900 bg-gray-300 hover:bg-white font-bold py-3 px-6 rounded-lg" onClick={() => handleCheckout('credits_100')}>100 Credits for $15</button>
            <button className="text-gray-900 gold-gradient font-bold py-4 px-8 rounded-lg text-lg" onClick={() => handleCheckout('credits_500')}>500 Credits for $50</button>
            <button className="text-gray-900 bg-gray-300 hover:bg-white font-bold py-3 px-6 rounded-lg" onClick={() => handleCheckout('credits_1000')}>1000 Credits for $80</button>
        </div>
        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default Billing;
