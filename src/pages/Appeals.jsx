import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export default function Appeals() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'appeals'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAppeals(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading appeals…</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Appeal Requests</h1>
        <p className="text-sm text-gray-500">Review account restoration requests from blocked users.</p>
      </div>

      {appeals.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No appeal requests yet.
        </div>
      ) : (
        <div className="space-y-3">
          {appeals.map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.userEmail || 'Unknown user'}</p>
                  <p className="text-xs text-gray-500">{item.userId}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-amber-700">
                  {item.status || 'pending'}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-gray-700">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
