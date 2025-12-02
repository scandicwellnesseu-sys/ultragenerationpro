import React, { useState } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

const mockLogs: LogEntry[] = [
  { id: '1', timestamp: '2025-12-02 10:15', action: 'Prisändring', user: 'anna@demo.com', details: 'Produkt "Läderplånbok" ändrades från 299 kr till 329 kr' },
  { id: '2', timestamp: '2025-12-02 09:45', action: 'Inloggning', user: 'erik@demo.com', details: 'Lyckad inloggning från IP 192.168.1.1' },
  { id: '3', timestamp: '2025-12-01 17:30', action: 'Kreditköp', user: 'anna@demo.com', details: 'Köpte 100 krediter via Stripe' },
  { id: '4', timestamp: '2025-12-01 14:00', action: 'Prisförslag', user: 'erik@demo.com', details: 'AI-prisförslag genererat för "T-shirt"' },
  { id: '5', timestamp: '2025-11-30 11:00', action: 'Integration', user: 'anna@demo.com', details: 'Kopplade till Shopify' },
];

const ActivityLog: React.FC = () => {
  const [logs] = useState<LogEntry[]>(mockLogs);
  const [filter, setFilter] = useState('');

  const filteredLogs = filter
    ? logs.filter(l => l.action.toLowerCase().includes(filter.toLowerCase()) || l.user.toLowerCase().includes(filter.toLowerCase()))
    : logs;

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Aktivitetslogg</h2>
      <input
        type="text"
        placeholder="Filtrera (åtgärd, användare...)"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="mb-4 w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
      />
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-2 px-2 text-gray-400">Tid</th>
            <th className="py-2 px-2 text-gray-400">Åtgärd</th>
            <th className="py-2 px-2 text-gray-400">Användare</th>
            <th className="py-2 px-2 text-gray-400">Detaljer</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map(log => (
            <tr key={log.id} className="border-b border-gray-700">
              <td className="py-2 px-2 text-gray-300">{log.timestamp}</td>
              <td className="py-2 px-2 text-yellow-400">{log.action}</td>
              <td className="py-2 px-2 text-gray-300">{log.user}</td>
              <td className="py-2 px-2 text-gray-400">{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityLog;
