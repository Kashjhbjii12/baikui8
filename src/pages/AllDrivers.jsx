import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';

export default function AllDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [resolvedMap, setResolvedMap] = useState({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'drivers'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDrivers(list);
      // resolve small set of photo urls for display
      list.forEach(driver => {
        const val = driver.photoUrl;
        if (!val) return;
        if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))) {
          setResolvedMap(prev => ({ ...prev, [driver.id]: val }));
        } else {
          let path = val;
          if (val.startsWith('gs://')) { const parts = val.split('/'); path = parts.slice(3).join('/'); }
          getDownloadURL(storageRef(storage, path)).then(url => setResolvedMap(prev => ({ ...prev, [driver.id]: url }))).catch(() => {});
        }
      });
    });
  }, []);

  const toggleStatus = async (driver) => {
    const newStatus = driver.status === 'approved' ? 'rejected' : 'approved';
    try { await updateDoc(doc(db, 'drivers', driver.id), { status: newStatus }); toast.success(`Driver ${newStatus}`); }
    catch { toast.error('Failed to update driver status'); }
  };

  const filtered = drivers
    .filter(d => filter === 'all' || d.status === filter)
    .filter(d => !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.phone?.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">All Drivers</h1>
          <p className="text-sm text-gray-400 mt-1">{drivers.length} total drivers registered</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:max-w-xs md:max-w-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..."
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all bg-white hover:border-gray-300" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium capitalize transition-all duration-200
                ${filter === s ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}>
              {s} {s !== 'all' && (
                <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${filter === s ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {drivers.filter(d => d.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-indigo-100/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="bg-indigo-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Driver</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Phone</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Bike</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Status</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Online</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Rides</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Rating</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50/50">
              {filtered.map((driver, i) => (
                <tr key={driver.id} className="hover:bg-indigo-50/30 transition-colors slide-in-right" style={{ animationDelay: `${i * 20}ms` }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      { (resolvedMap[driver.id] || driver.photoUrl) ? (
                        <img src={resolvedMap[driver.id] || driver.photoUrl} className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100 shrink-0" alt="" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center ring-2 ring-indigo-100 shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-indigo-400">
                            <path d="M5 17h14l3-8H2l3 8z" /><circle cx="8" cy="18" r="2" /><circle cx="16" cy="18" r="2" />
                          </svg>
                        </div>
                      )}
                      <span className="font-medium text-gray-900 truncate">{driver.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs whitespace-nowrap">{driver.phone}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                    <span className="bg-gray-50 px-2 py-0.5 rounded">{driver.bikeMake} {driver.bikePlate}</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap"><Badge status={driver.status} /></td>
                  <td className="px-5 py-3.5 whitespace-nowrap"><Badge status={driver.isOnline ? 'online' : 'offline'} /></td>
                  <td className="px-5 py-3.5 text-gray-700 font-medium whitespace-nowrap">{driver.totalRides ?? 0}</td>
                  <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span>{driver.rating?.toFixed(1) ?? '5.0'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex gap-1.5">
                      <button onClick={() => navigate(`/drivers/${driver.id}`)}
                        className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700">
                        View
                      </button>
                      {driver.status === 'approved' && (
                        <button onClick={() => toggleStatus(driver)}
                          className="text-xs px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition-all font-medium">
                          Disable
                        </button>
                      )}
                      {driver.status === 'rejected' && (
                        <button onClick={() => toggleStatus(driver)}
                          className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-all font-medium">
                          Enable
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-medium mb-1">No drivers found</div>
            <div className="text-xs">Try adjusting your search or filter</div>
          </div>
        )}
      </div>
    </div>
  );
}
