import { useEffect, useState } from 'react';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import { format } from 'date-fns';

export default function RideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const unsub1 = onSnapshot(doc(db, 'rides', id), snap => {
      if (snap.exists()) setRide({ id: snap.id, ...snap.data() });
    });
    const unsub2 = onSnapshot(collection(db, 'rides', id, 'offers'), snap => {
      setOffers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsub1(); unsub2(); };
  }, [id]);

  if (!ride) return (
    <div className="space-y-4 mt-10">
      <div className="h-5 skeleton rounded w-20 mb-4" />
      <div className="bg-white rounded-2xl border border-indigo-100/30 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}
        </div>
      </div>
    </div>
  );

  const formatTime = ts => ts?.toDate ? format(ts.toDate(), 'MMM d yyyy, HH:mm') : '—';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-indigo-600 flex items-center gap-1.5 text-sm transition-colors group py-2 min-h-[44px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-2xl border border-indigo-100/30 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="font-bold text-gray-900 text-lg">Ride Details</h2>
          <Badge status={ride.status} size="md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['Passenger', ride.passengerName], ['Passenger Phone', ride.passengerPhone],
            ['Driver', ride.driverName || '—'], ['Driver Phone', ride.driverPhone || '—'],
            ['Bike Plate', ride.bikePlate || '—'], ['Distance', `${ride.distance?.toFixed(1)} km`],
            ['Offered Price', `Rs. ${ride.passengerPrice}`], ['Final Price', ride.finalPrice ? `Rs. ${ride.finalPrice}` : '—'],
            ['Created', formatTime(ride.createdAt)], ['Completed', formatTime(ride.completedAt)],
          ].map(([k, v]) => (
            <div key={k} className="bg-indigo-50/30 rounded-xl p-3 hover:bg-indigo-50/50 transition-colors">
              <div className="text-[11px] text-gray-400 mb-0.5 uppercase tracking-wider">{k}</div>
              <div className="font-medium text-gray-800 text-sm break-words">{v}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-start gap-3 bg-emerald-50 rounded-xl p-3.5 border border-emerald-100">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-600">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider mb-0.5">Pickup</div>
              <div className="text-sm text-gray-700 break-words">{ride.pickupAddress}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-rose-50 rounded-xl p-3.5 border border-rose-100">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-rose-600">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-rose-600 font-semibold uppercase tracking-wider mb-0.5">Drop</div>
              <div className="text-sm text-gray-700 break-words">{ride.dropAddress}</div>
            </div>
          </div>
        </div>

        {ride.cancellationReason && (
          <div className="mt-4 p-3.5 bg-rose-50 rounded-xl border border-rose-100">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-rose-500 mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="min-w-0">
                <p className="text-[11px] text-rose-400 font-semibold uppercase tracking-wider mb-0.5">Cancelled</p>
                <p className="text-sm text-rose-700 break-words">{ride.cancellationReason} <span className="text-rose-400">(by {ride.cancelledBy})</span></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {offers.length > 0 && (
        <div className="bg-white rounded-2xl border border-indigo-100/30 shadow-sm p-4 sm:p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-500 shrink-0">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Driver Offers
            <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full ml-auto font-medium shrink-0">{offers.length}</span>
          </h3>
          <div className="space-y-2">
            {offers.map(offer => (
              <div key={offer.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-indigo-50/30 rounded-xl hover:bg-indigo-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-indigo-500">
                      <path d="M5 17h14l3-8H2l3 8z" /><circle cx="8" cy="18" r="2" /><circle cx="16" cy="18" r="2" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-800 text-sm truncate">{offer.driverName}</div>
                    <div className="text-xs text-gray-400 truncate">{offer.driverPhone}</div>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="font-bold text-gray-900">Rs. {offer.offeredPrice}</div>
                  <Badge status={offer.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
