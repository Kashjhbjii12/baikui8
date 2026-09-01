import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

export default function CommissionPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'commission_payments'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const toggleVerify = async (id, current) => {
    try {
      await updateDoc(doc(db, 'commission_payments', id), { verified: !current });
      toast.success('Updated');
    } catch (e) {
      toast.error('Failed');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Commission Payments</h2>
      <div className="bg-white rounded-2xl border border-indigo-100/30 p-4">
        <div className="grid gap-3">
          {payments.length === 0 && <div className="text-sm text-gray-500">No payments yet</div>}
          {payments.map(p => (
            <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border">
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900">Driver: {p.driverId}</div>
                <div className="text-xs text-gray-500">Amount: Rs. {p.amount ?? 0} • {p.verified ? 'Verified' : 'Pending'}</div>
                {p.imageUrl && <img src={p.imageUrl} className="w-36 h-24 object-cover rounded mt-2" alt="receipt" />}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-sm text-gray-500">{p.createdAt?.toDate ? new Date(p.createdAt.toDate()).toLocaleString() : ''}</div>
                <div className="flex gap-2">
                  <button onClick={() => toggleVerify(p.id, p.verified)} className={`px-3 py-1 rounded ${p.verified ? 'bg-emerald-500 text-white' : 'bg-yellow-500 text-white'}`}>
                    {p.verified ? 'Unverify' : 'Verify'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
