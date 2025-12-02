import React, { useState } from 'react';
import { UsersIcon, PlusIcon, TrashIcon, CheckIcon, XIcon } from './Icons';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending';
  avatar?: string;
  creditsUsed: number;
  lastActive: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: 'admin' | 'member';
  sentAt: string;
}

const TeamManagement: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Anna Lindström',
      email: 'anna@foretag.se',
      role: 'owner',
      status: 'active',
      creditsUsed: 423,
      lastActive: 'Nu online',
    },
    {
      id: '2',
      name: 'Erik Svensson',
      email: 'erik@foretag.se',
      role: 'admin',
      status: 'active',
      creditsUsed: 287,
      lastActive: 'För 2 timmar sedan',
    },
    {
      id: '3',
      name: 'Maria Johansson',
      email: 'maria@foretag.se',
      role: 'member',
      status: 'active',
      creditsUsed: 156,
      lastActive: 'Igår',
    },
  ]);

  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([
    {
      id: 'inv1',
      email: 'ny.kollega@foretag.se',
      role: 'member',
      sentAt: '2024-12-01',
    },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');

  const roleLabels = {
    owner: 'Ägare',
    admin: 'Administratör',
    member: 'Medlem',
  };

  const roleColors = {
    owner: 'bg-purple-500/20 text-purple-400',
    admin: 'bg-yellow-500/20 text-yellow-400',
    member: 'bg-blue-500/20 text-blue-400',
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    
    const newInvite: PendingInvite = {
      id: `inv-${Date.now()}`,
      email: inviteEmail,
      role: inviteRole,
      sentAt: new Date().toISOString().split('T')[0],
    };
    
    setPendingInvites([...pendingInvites, newInvite]);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleCancelInvite = (id: string) => {
    setPendingInvites(pendingInvites.filter(i => i.id !== id));
  };

  const handleChangeRole = (memberId: string, newRole: 'admin' | 'member') => {
    setMembers(members.map(m => 
      m.id === memberId ? { ...m, role: newRole } : m
    ));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const totalCreditsUsed = members.reduce((sum, m) => sum + m.creditsUsed, 0);
  const seatsUsed = members.length + pendingInvites.length;
  const maxSeats = 10;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Teamhantering</h2>
          <p className="text-gray-400 mt-1">Hantera ditt teams åtkomst och roller</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          disabled={seatsUsed >= maxSeats}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="w-5 h-5" />
          Bjud in medlem
        </button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <UsersIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Teammedlemmar</p>
              <p className="text-2xl font-bold text-white">{seatsUsed} <span className="text-gray-400 text-lg">/ {maxSeats}</span></p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(seatsUsed / maxSeats) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Total användning (team)</p>
          <p className="text-2xl font-bold text-white mt-1">{totalCreditsUsed} <span className="text-gray-400 text-lg">krediter</span></p>
          <p className="text-sm text-gray-400 mt-2">Denna månad</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Aktiva inbjudningar</p>
          <p className="text-2xl font-bold text-white mt-1">{pendingInvites.length}</p>
          <p className="text-sm text-gray-400 mt-2">Väntar på svar</p>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Teammedlemmar</h3>
        </div>
        <div className="divide-y divide-gray-700">
          {members.map((member) => (
            <div key={member.id} className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-gray-900 font-bold">
                {getInitials(member.name)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-white">{member.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                    {roleLabels[member.role]}
                  </span>
                  {member.status === 'active' && member.lastActive === 'Nu online' && (
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
                <p className="text-sm text-gray-400">{member.email}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>{member.creditsUsed} krediter använda</span>
                  <span>•</span>
                  <span>{member.lastActive}</span>
                </div>
              </div>
              {member.role !== 'owner' && (
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) => handleChangeRole(member.id, e.target.value as 'admin' | 'member')}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="admin">Administratör</option>
                    <option value="member">Medlem</option>
                  </select>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Ta bort medlem"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Väntande inbjudningar</h3>
          </div>
          <div className="divide-y divide-gray-700">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                  <UsersIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{invite.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[invite.role]}`}>
                      {roleLabels[invite.role]}
                    </span>
                    <span className="text-xs text-gray-500">Skickad {invite.sentAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Skicka igen
                  </button>
                  <button
                    onClick={() => handleCancelInvite(invite.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Avbryt inbjudan"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles Explanation */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Rollbehörigheter</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors.owner}`}>
                Ägare
              </span>
            </div>
            <ul className="text-sm text-gray-400 space-y-1">
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-400" />
                Full åtkomst till allt
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-400" />
                Hantera prenumeration
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-400" />
                Ta bort organisation
              </li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors.admin}`}>
                Administratör
              </span>
            </div>
            <ul className="text-sm text-gray-400 space-y-1">
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-400" />
                Bjud in och ta bort medlemmar
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-400" />
                Hantera API-nycklar
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-400" />
                Se all användning
              </li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors.member}`}>
                Medlem
              </span>
            </div>
            <ul className="text-sm text-gray-400 space-y-1">
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-400" />
                Generera innehåll
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-400" />
                Se egen användning
              </li>
              <li className="flex items-center gap-2">
                <XIcon className="w-4 h-4 text-red-400" />
                Ingen administrativ åtkomst
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Bjud in teammedlem</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-postadress
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="kollega@foretag.se"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Roll
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="member">Medlem</option>
                  <option value="admin">Administratör</option>
                </select>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-200">
                ℹ️ En inbjudan skickas till e-postadressen med en länk för att gå med i teamet.
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim()}
                  className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skicka inbjudan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
