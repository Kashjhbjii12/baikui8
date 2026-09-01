import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../firebase';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function HelmetApplications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'helmetApplications'), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      setApplications(list);
    }, (error) => {
      console.error('Helmet applications listener error:', error);
      toast.error('Unable to load helmet requests');
    });
  }, []);

  const updateStatus = async (id, nextStatus) => {
    try {
      await updateDoc(doc(db, 'helmetApplications', id), { status: nextStatus });
      toast.success(`Request marked as ${nextStatus}`);
    } catch (error) {
      console.error('Update helmet status failed:', error);
      toast.error('Failed to update request status');
    }
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const date = value?.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Helmet Requests</h1>
          <p className="text-sm text-gray-500 mt-1">{applications.length} total requests</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-indigo-100/30 overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No helmet applications found yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Address</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {applications.map((app) => (
                  <tr key={app.id} className="align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{app.uid || 'Unknown user'}</div>
                      <div className="text-xs text-gray-500">{app.city || 'Bannu'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{app.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-md">
                      <div className="whitespace-pre-wrap break-words">{app.deliveryAddress || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div>Rs {app.helmetPrice ?? 0}</div>
                      <div className="text-xs text-gray-500">Delivery: Rs {app.deliveryFee ?? 0}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[app.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {app.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(app.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {['pending', 'approved', 'rejected', 'completed'].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => updateStatus(app.id, status)}
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border transition ${
                              (app.status || 'pending') === status
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}