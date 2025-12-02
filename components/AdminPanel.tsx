import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const mockUsers: User[] = [
  { id: '1', name: 'Anna Admin', email: 'anna@demo.com', role: 'admin' },
  { id: '2', name: 'Erik User', email: 'erik@demo.com', role: 'user' },
];

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'user'>('user');

  const handleEdit = (id: string, currentRole: 'admin' | 'user') => {
    setEditingId(id);
    setRole(currentRole);
  };

  const handleSave = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, role } : u));
    setEditingId(null);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Adminpanel</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-2 px-2 text-gray-400">Namn</th>
            <th className="py-2 px-2 text-gray-400">E-post</th>
            <th className="py-2 px-2 text-gray-400">Roll</th>
            <th className="py-2 px-2 text-gray-400">Åtgärd</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b border-gray-700">
              <td className="py-2 px-2 text-gray-200">{user.name}</td>
              <td className="py-2 px-2 text-gray-200">{user.email}</td>
              <td className="py-2 px-2 text-gray-200">
                {editingId === user.id ? (
                  <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'user')} className="bg-gray-700 text-white rounded px-2 py-1">
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td className="py-2 px-2">
                {editingId === user.id ? (
                  <button onClick={() => handleSave(user.id)} className="bg-green-600 text-white px-3 py-1 rounded font-semibold hover:bg-green-700 transition">Spara</button>
                ) : (
                  <button onClick={() => handleEdit(user.id, user.role)} className="bg-yellow-500 text-white px-3 py-1 rounded font-semibold hover:bg-yellow-600 transition">Redigera</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
