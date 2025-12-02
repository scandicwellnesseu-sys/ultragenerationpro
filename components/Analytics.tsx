import React from 'react';

const mockData = {
  totalVisitors: 12340,
  conversions: 512,
  conversionRate: 4.15,
  avgPriceIncrease: 8.7,
  revenueImpact: 23400,
  topProducts: [
    { name: 'Läderplånbok', views: 1200, conversions: 98, aiPriceChange: '+12%' },
    { name: 'T-shirt Premium', views: 980, conversions: 67, aiPriceChange: '+7%' },
    { name: 'Sneakers Pro', views: 870, conversions: 45, aiPriceChange: '+15%' },
  ],
};

const Analytics: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Analytics & Insikter</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-400">Besökare</h3>
          <p className="text-4xl font-black text-white my-2">{mockData.totalVisitors.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-400">Konverteringar</h3>
          <p className="text-4xl font-black text-green-400 my-2">{mockData.conversions}</p>
          <p className="text-sm text-gray-500">{mockData.conversionRate}% konverteringsgrad</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-400">Intäktspåverkan</h3>
          <p className="text-4xl font-black text-yellow-400 my-2">+{mockData.revenueImpact.toLocaleString()} kr</p>
          <p className="text-sm text-gray-500">Genomsnittlig prisökning: +{mockData.avgPriceIncrease}%</p>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">Topprodukter</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 px-2 text-gray-400">Produkt</th>
              <th className="py-2 px-2 text-gray-400">Visningar</th>
              <th className="py-2 px-2 text-gray-400">Konv.</th>
              <th className="py-2 px-2 text-gray-400">AI-prisändring</th>
            </tr>
          </thead>
          <tbody>
            {mockData.topProducts.map((prod, i) => (
              <tr key={i} className="border-b border-gray-700">
                <td className="py-2 px-2 text-gray-200">{prod.name}</td>
                <td className="py-2 px-2 text-gray-300">{prod.views}</td>
                <td className="py-2 px-2 text-green-400">{prod.conversions}</td>
                <td className="py-2 px-2 text-yellow-300">{prod.aiPriceChange}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
