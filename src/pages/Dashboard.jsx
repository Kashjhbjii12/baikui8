import { useEffect, useState } from 'react';
import { collection, getCountFromServer, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { format } from 'date-fns';

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5,6].map(i => (
        <td key={i} className="px-5 py-3"><div className="h-4 skeleton rounded w-20" /></td>
      ))}
    </tr>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [usersSnap, driversSnap, pendingSnap, onlineSnap, completedSnap, activeSnap, todaySnap] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'drivers')),
          getCountFromServer(query(collection(db, 'drivers'), where('status', '==', 'pending'))),
          getCountFromServer(query(collection(db, 'drivers'), where('isOnline', '==', true))),
          getCountFromServer(query(collection(db, 'rides'), where('status', '==', 'completed'))),
          getCountFromServer(query(collection(db, 'rides'), where('status', 'in', ['active', 'confirmed', 'driver_arrived']))),
          getCountFromServer(query(collection(db, 'rides'), where('createdAt', '>=', todayStart))),
        ]);

        setStats({
          totalUsers: usersSnap.data().count,
          totalDrivers: driversSnap.data().count,
          pendingDrivers: pendingSnap.data().count,
          onlineDrivers: onlineSnap.data().count,
          todayRides: todaySnap.data().count,
          completedRides: completedSnap.data().count,
          activeRides: activeSnap.data().count,
        });

        const recentSnap = await getDocs(query(collection(db, 'rides'), orderBy('createdAt', 'desc'), limit(5)));
        setRecentRides(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Overview of your Baiku platform</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white px-3 py-1.5 rounded-lg border border-indigo-100/30 self-start sm:self-auto">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          <>
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-indigo-100/30 space-y-3">
                <div className="h-4 skeleton rounded w-24" />
                <div className="h-8 skeleton rounded w-16" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard title="Total Users"       value={stats.totalUsers}     icon="👥" color="violet"  sub="Registered accounts" />
            <StatCard title="Total Drivers"     value={stats.totalDrivers}   icon="🏍️" color="emerald" sub="Registered drivers" />
            <StatCard title="Pending Approval"  value={stats.pendingDrivers} icon="⏳" color="amber"   sub="Awaiting review" />
            <StatCard title="Online Drivers"    value={stats.onlineDrivers}  icon="🟢" color="emerald" sub="Currently active" />
            <StatCard title="Today's Rides"     value={stats.todayRides}     icon="📍" color="indigo"  sub="Since midnight" />
            <StatCard title="Active Rides"      value={stats.activeRides}    icon="🚗" color="amber"   sub="In progress" />
            <StatCard title="Completed Rides"   value={stats.completedRides} icon="✅" color="emerald" sub="All time" />
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-indigo-100/30 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-indigo-100/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-800">Recent Rides</h2>
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-medium px-2 py-0.5 rounded-full">Live</span>
          </div>
          {!loading && <span className="text-xs text-gray-400">Last 5 rides</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-indigo-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-4 sm:px-6 py-3.5 text-left font-semibold whitespace-nowrap">Passenger</th>
                <th className="px-4 sm:px-6 py-3.5 text-left font-semibold whitespace-nowrap">Pickup</th>
                <th className="px-4 sm:px-6 py-3.5 text-left font-semibold whitespace-nowrap">Drop</th>
                <th className="px-4 sm:px-6 py-3.5 text-left font-semibold whitespace-nowrap">Price</th>
                <th className="px-4 sm:px-6 py-3.5 text-left font-semibold whitespace-nowrap">Status</th>
                <th className="px-4 sm:px-6 py-3.5 text-left font-semibold whitespace-nowrap">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50/50">
              {loading ? (
                <SkeletonRow />
              ) : recentRides.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <div className="text-3xl mb-2">🚫</div>
                    No rides yet
                  </td>
                </tr>
              ) : (
                recentRides.map((ride, i) => (
                  <tr key={ride.id} className="hover:bg-indigo-50/30 transition-colors slide-in-right" style={{ animationDelay: `${i * 50}ms` }}>
                    <td className="px-4 sm:px-6 py-3.5 font-medium text-gray-800 whitespace-nowrap">{ride.passengerName || '—'}</td>
                    <td className="px-4 sm:px-6 py-3.5 text-gray-500 max-w-[80px] sm:max-w-[160px] truncate">{ride.pickupAddress}</td>
                    <td className="px-4 sm:px-6 py-3.5 text-gray-500 max-w-[80px] sm:max-w-[160px] truncate">{ride.dropAddress}</td>
                    <td className="px-4 sm:px-6 py-3.5 font-medium whitespace-nowrap">
                      <span className="bg-indigo-50 px-2.5 py-1 rounded-lg text-sm text-indigo-700 font-semibold">Rs. {ride.finalPrice || ride.passengerPrice}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap"><Badge status={ride.status} /></td>
                    <td className="px-4 sm:px-6 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {ride.createdAt?.toDate ? format(ride.createdAt.toDate(), 'MMM d, HH:mm') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
