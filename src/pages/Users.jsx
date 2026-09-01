import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(q, snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const avatarColors = [
    'from-indigo-50 to-indigo-100 text-indigo-600', 'from-violet-50 to-violet-100 text-violet-600',
    'from-emerald-50 to-emerald-100 text-emerald-600', 'from-amber-50 to-amber-100 text-amber-600',
    'from-rose-50 to-rose-100 text-rose-600', 'from-cyan-50 to-cyan-100 text-cyan-600',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-400 mt-1">{users.length} passengers registered</p>
      </div>

      <div className="relative w-full sm:max-w-xs md:max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone or email..."
          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all bg-white hover:border-gray-300" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>}
      </div>

      <div className="bg-white rounded-2xl border border-indigo-100/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[550px]">
            <thead>
              <tr className="bg-indigo-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Name</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Email</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Phone</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Rating</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Total Rides</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-400">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="font-medium mb-1">No users found</div>
                    <div className="text-xs">Try a different search term</div>
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => {
                  const avatarColor = avatarColors[i % avatarColors.length];
                  return (
                    <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors slide-in-right" style={{ animationDelay: `${i * 20}ms` }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          {user.photoUrl ? (
                            <img src={user.photoUrl} className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100 shrink-0" alt="" />
                          ) : (
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-xs font-bold ring-2 ring-indigo-100 shrink-0`}>
                              {getInitials(user.name)}
                            </div>
                          )}
                          <span className="font-medium text-gray-900 truncate">{user.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs max-w-[120px] sm:max-w-[200px] truncate">{user.email || <span className="text-gray-300 italic">—</span>}</td>
                      <td className="px-5 py-3.5 text-gray-500 font-mono text-xs whitespace-nowrap">{user.phone || '—'}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span className="text-gray-700">{user.rating?.toFixed(1) ?? '5.0'}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-700 whitespace-nowrap">{user.totalRides ?? 0}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {user.createdAt?.toDate ? format(user.createdAt.toDate(), 'MMM d, yyyy') : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
