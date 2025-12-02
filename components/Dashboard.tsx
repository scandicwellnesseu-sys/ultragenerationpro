
import React from 'react';
import { SparklesIcon } from './Icons';
import { View } from '../App';
import { useTranslations } from '../lib/i18n';
import { useAppContext } from '../context/AppContext';

interface DashboardProps {
    onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const t = useTranslations();
  const { history } = useAppContext();
  
  // Mock data for credits and plan
  const credits = 8;
  const plan = 'Starter';
  
  const recentGenerations = history.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Credits Balance */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg text-center">
          <h3 className="text-lg font-semibold text-gray-400">{t.creditsBalance}</h3>
          <p className="text-5xl font-black gold-text-gradient my-2">{credits}</p>
          <p className={`text-sm ${credits < 10 ? 'text-red-400' : 'text-gray-500'}`}>
            {credits < 10 ? t.balanceLow : t.readyToGenerate}
          </p>
          <button onClick={() => onNavigate('billing')} className="mt-4 w-full text-sm font-bold text-gray-900 gold-gradient py-2 px-4 rounded-md">
            {t.buyMoreCredits}
          </button>
        </div>

        {/* Current Plan */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg text-center">
          <h3 className="text-lg font-semibold text-gray-400">{t.currentPlan}</h3>
          <p className="text-5xl font-black text-white my-2">{plan}</p>
          <p className="text-sm text-gray-500">100 credits / month</p>
          <button onClick={() => onNavigate('billing')} className="mt-4 w-full text-sm font-semibold text-yellow-300 border-2 border-yellow-400/50 hover:bg-yellow-400/10 py-2 px-4 rounded-md transition-colors">
            {t.upgradePlan}
          </button>
        </div>

        {/* AI Status */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg text-center flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold text-gray-400">{t.aiStatus}</h3>
          <div className="flex items-center my-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <p className="ml-3 text-2xl font-bold text-green-400">{t.operational}</p>
          </div>
          <p className="text-sm text-gray-500">{t.statusOk}</p>
        </div>
      </div>

      {/* Recent Generations */}
      <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">{t.recentGenerations}</h3>
            <button onClick={() => onNavigate('history')} className="text-sm font-medium text-yellow-400 hover:text-yellow-300">{t.viewAll}</button>
        </div>
        {recentGenerations.length > 0 ? (
            <ul className="divide-y divide-gray-700">
            {recentGenerations.map((gen) => (
                <li key={gen.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center">
                    <SparklesIcon className="w-5 h-5 text-yellow-500 mr-3" />
                    <span className="font-medium text-gray-200 truncate">{gen.productTitle}</span>
                </div>
                <span className="text-sm text-gray-500 flex-shrink-0 ml-4">{new Date(gen.timestamp).toLocaleDateString()}</span>
                </li>
            ))}
            </ul>
        ) : (
            <div className="text-center py-8 text-gray-500">
                <p>{t.noGenerations}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
