import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import ConfirmModal from '../components/ConfirmModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'searching', 'negotiating', 'confirmed', 'driver_arrived', 'active', 'completed', 'cancelled'];

export default function Rides() {
  const [rides, setRides] = useState([]);
  const [filter, setFilter] = useState('all');
  const [cancelTarget, setCancelTarget] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let q;
    if (filter === 'all') {
      q = query(collection(db, 'rides'), orderBy('createdAt', 'desc'), limit(50));
    } else {
      q = query(collection(db, 'rides'), where('status', '==', filter), orderBy('createdAt', 'desc'), limit(50));
    }
    return onSnapshot(q, snap => {
      setRides(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [filter]);

  const cancelRide = async (rideId) => {
    try {
      await updateDoc(doc(db, 'rides', rideId), { status: 'cancelled', cancelledBy: 'admin', cancellationReason: 'Cancelled by admin' });
      toast.success('Ride cancelled');
      setCancelTarget(null);
    } catch { toast.error('Failed to cancel ride'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Rides</h1>
        <p className="text-sm text-gray-400 mt-1">Manage and monitor all ride requests</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium capitalize transition-all duration-200 whitespace-nowrap shrink-0
              ${filter === s ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}>
            {s.replace(/_/g, ' ')}
            {filter === s && rides.length > 0 && <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{rides.length}</span>}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-indigo-100/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="bg-indigo-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Passenger</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Driver</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Route</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Price</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Dist.</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Status</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Time</th>
                <th className="px-5 py-3.5 text-left font-semibold whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50/50">
              {rides.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">🚫</div>
                    <div className="font-medium mb-1">No rides found</div>
                    <div className="text-xs">Try a different status filter</div>
                  </td>
                </tr>
              ) : (
                rides.map(ride => (
                  <tr key={ride.id} className="hover:bg-indigo-50/30 cursor-pointer transition-colors" onClick={() => navigate(`/rides/${ride.id}`)}>
                    <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">{ride.passengerName || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{ride.driverName || <span className="text-gray-300 italic">Not assigned</span>}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 max-w-[120px] sm:max-w-[160px]">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                        <span className="truncate">{ride.pickupAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate mt-0.5">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                        <span className="truncate">{ride.dropAddress}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                      <span className="bg-indigo-50 px-2 py-1 rounded-lg text-xs text-indigo-700 font-semibold">Rs. {ride.finalPrice || ride.passengerPrice || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">{ride.distance?.toFixed(1)} km</td>
                    <td className="px-5 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}><Badge status={ride.status} /></td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {ride.createdAt?.toDate ? format(ride.createdAt.toDate(), 'MMM d, HH:mm') : '—'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      {['searching', 'negotiating', 'confirmed', 'active'].includes(ride.status) && (
                        <button onClick={() => setCancelTarget(ride.id)}
                          className="text-xs px-2.5 py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors font-medium border border-rose-100">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal open={!!cancelTarget} title="Cancel Ride" message="Are you sure you want to cancel this ride? This action cannot be undone."
        confirmLabel="Yes, Cancel Ride" cancelLabel="Keep Ride" danger
        onConfirm={() => cancelRide(cancelTarget)} onCancel={() => setCancelTarget(null)} />
    </div>
  );
}
