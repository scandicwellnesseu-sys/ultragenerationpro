import React, { useState } from 'react';
import { SparklesIcon, TrendingUpIcon, ClockIcon, CheckIcon } from './Icons';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

interface GenerationData {
  date: string;
  count: number;
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '12m'>('30d');

  // Mock data - in real app, fetch from API
  const stats: StatCard[] = [
    {
      title: 'Totalt genererade',
      value: '1,247',
      change: '+23% från förra månaden',
      changeType: 'positive',
      icon: <SparklesIcon className="w-6 h-6" />,
    },
    {
      title: 'Krediter använda',
      value: '847',
      change: '153 krediter kvar',
      changeType: 'neutral',
      icon: <TrendingUpIcon className="w-6 h-6" />,
    },
    {
      title: 'Genomsnittlig tid',
      value: '4.2s',
      change: '-12% snabbare',
      changeType: 'positive',
      icon: <ClockIcon className="w-6 h-6" />,
    },
    {
      title: 'Framgångsgrad',
      value: '98.7%',
      change: '+0.3% denna vecka',
      changeType: 'positive',
      icon: <CheckIcon className="w-6 h-6" />,
    },
  ];

  // Mock generation data for chart
  const generationData: GenerationData[] = [
    { date: '1 Dec', count: 45 },
    { date: '5 Dec', count: 62 },
    { date: '10 Dec', count: 38 },
    { date: '15 Dec', count: 71 },
    { date: '20 Dec', count: 55 },
    { date: '25 Dec', count: 28 },
    { date: '30 Dec', count: 89 },
  ];

  const maxCount = Math.max(...generationData.map(d => d.count));

  // ROI Calculator data
  const roiData = {
    timeSavedPerDescription: 15, // minutes
    totalDescriptions: 1247,
    hourlyRate: 350, // SEK
    get totalTimeSaved() {
      return (this.timeSavedPerDescription * this.totalDescriptions) / 60;
    },
    get moneySaved() {
      return this.totalTimeSaved * this.hourlyRate;
    },
  };

  // Top performing content types
  const topContentTypes = [
    { type: 'Produktbeskrivningar', count: 842, percentage: 67.5 },
    { type: 'SEO Meta', count: 234, percentage: 18.8 },
    { type: 'Social Media', count: 124, percentage: 9.9 },
    { type: 'Influencer Content', count: 47, percentage: 3.8 },
  ];

  // Language distribution
  const languageStats = [
    { lang: 'Svenska', code: 'sv', flag: '🇸🇪', count: 756, percentage: 60.6 },
    { lang: 'English', code: 'en', flag: '🇬🇧', count: 312, percentage: 25.0 },
    { lang: 'Norska', code: 'no', flag: '🇳🇴', count: 98, percentage: 7.9 },
    { lang: 'Danska', code: 'dk', flag: '🇩🇰', count: 52, percentage: 4.2 },
    { lang: 'Finska', code: 'fi', flag: '🇫🇮', count: 29, percentage: 2.3 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Användningsanalys</h2>
        <div className="flex bg-gray-800 rounded-lg p-1">
          {(['7d', '30d', '90d', '12m'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-yellow-500 text-gray-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range === '7d' ? '7 dagar' : range === '30d' ? '30 dagar' : range === '90d' ? '90 dagar' : '12 månader'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                {stat.icon}
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
            <p
              className={`text-sm mt-2 ${
                stat.changeType === 'positive'
                  ? 'text-green-400'
                  : stat.changeType === 'negative'
                  ? 'text-red-400'
                  : 'text-gray-400'
              }`}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Chart */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Genereringar över tid</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {generationData.map((data) => (
              <div key={data.date} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-md transition-all hover:from-yellow-400 hover:to-yellow-300"
                  style={{ height: `${(data.count / maxCount) * 100}%` }}
                  title={`${data.count} genereringar`}
                />
                <span className="text-xs text-gray-400 mt-2">{data.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">💰 Din ROI</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Tid sparad</p>
                <p className="text-2xl font-bold text-white">
                  {roiData.totalTimeSaved.toFixed(0)} <span className="text-lg text-gray-400">timmar</span>
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Uppskattat värde</p>
                <p className="text-2xl font-bold text-green-400">
                  {roiData.moneySaved.toLocaleString('sv-SE')} <span className="text-lg">kr</span>
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              <p>Baserat på {roiData.timeSavedPerDescription} min/beskrivning × {roiData.totalDescriptions} beskrivningar</p>
              <p>med en timkostnad på {roiData.hourlyRate} kr/timme</p>
            </div>
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Din månadskostnad</span>
                <span className="text-white font-semibold">249 kr</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-400">ROI</span>
                <span className="text-green-400 font-bold text-xl">
                  {Math.round((roiData.moneySaved / 249) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Types & Languages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Types */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Innehållstyper</h3>
          <div className="space-y-4">
            {topContentTypes.map((item) => (
              <div key={item.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{item.type}</span>
                  <span className="text-gray-400">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language Distribution */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Språkfördelning</h3>
          <div className="space-y-4">
            {languageStats.map((item) => (
              <div key={item.code} className="flex items-center gap-4">
                <span className="text-2xl">{item.flag}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{item.lang}</span>
                    <span className="text-gray-400">{item.count}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Senaste aktivitet</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Tid</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Typ</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Produkt</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Språk</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Tid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {[
                { time: '14:32', type: 'Produkt', product: 'Ekologisk Ansiktskräm', lang: '🇸🇪', status: 'success', duration: '3.2s' },
                { time: '14:28', type: 'Bulk (5)', product: 'Hudvårdsserie', lang: '🇸🇪', status: 'success', duration: '12.1s' },
                { time: '14:15', type: 'Social', product: 'Summer Collection', lang: '🇬🇧', status: 'success', duration: '2.8s' },
                { time: '13:52', type: 'Produkt', product: 'Vitamin C Serum', lang: '🇳🇴', status: 'success', duration: '4.1s' },
                { time: '13:44', type: 'Produkt', product: 'Nattkräm Premium', lang: '🇸🇪', status: 'error', duration: '-' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-gray-300">{row.time}</td>
                  <td className="py-3 px-4 text-gray-300">{row.type}</td>
                  <td className="py-3 px-4 text-white">{row.product}</td>
                  <td className="py-3 px-4">{row.lang}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.status === 'success'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {row.status === 'success' ? 'Klar' : 'Fel'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{row.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex justify-end gap-4">
        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
          📊 Exportera rapport (PDF)
        </button>
        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
          📈 Exportera data (CSV)
        </button>
      </div>
    </div>
  );
};

export default Analytics;
