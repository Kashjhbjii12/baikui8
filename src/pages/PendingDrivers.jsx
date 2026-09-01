import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';

export default function PendingDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [resolvedMap, setResolvedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'drivers'), where('status', '==', 'pending'));
    return onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDrivers(list);
      // resolve urls for each driver in background
      list.forEach(driver => {
        const fields = ['photoUrl','cnicFrontUrl','cnicBackUrl','licensePhotoUrl','bikePhotoUrl','videoUrl'];
        const map = {};
        const promises = [];
        fields.forEach(f => {
          const val = driver[f];
          if (!val) return;
          const normalized = normalizeStorageValue(val);
          if (typeof val === 'string' && (/^https?:\/\//i.test(val))) {
            map[f] = val;
          } else if (normalized) {
            promises.push(getDownloadURL(storageRef(storage, normalized)).then(url => ({ f, url })).catch(() => ({ f, url: null })));
          }
        });
        if (promises.length > 0) {
          Promise.all(promises).then(results => {
            results.forEach(r => { if (r && r.f) map[r.f] = r.url; });
            setResolvedMap(prev => ({ ...prev, [driver.id]: map }));
          });
        } else {
          setResolvedMap(prev => ({ ...prev, [driver.id]: map }));
        }
      });
      setLoading(false);
    });
  }, []);

  const approve = async (driverId) => {
    setActionLoading(driverId);
    try { await updateDoc(doc(db, 'drivers', driverId), { status: 'approved' }); toast.success('Driver approved successfully!'); }
    catch { toast.error('Failed to approve driver'); }
    setActionLoading(null);
  };

  const reject = async (driverId) => {
    const reason = prompt('Rejection reason (optional):') || 'Does not meet requirements';
    setActionLoading(driverId);
    try { await updateDoc(doc(db, 'drivers', driverId), { status: 'rejected', rejectionReason: reason }); toast.success('Driver rejected'); }
    catch { toast.error('Failed to reject driver'); }
    setActionLoading(null);
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 skeleton rounded w-48 mb-6" />
      {[1,2,3].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-indigo-100/30 p-5 space-y-4">
          <div className="flex gap-4">
            <div className="w-14 h-14 skeleton rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-5 skeleton rounded w-32" />
              <div className="h-4 skeleton rounded w-24" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1,2,3,4].map(j => <div key={j} className="h-20 skeleton rounded-xl" />)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
          Pending Approval
          {drivers.length > 0 && (
            <span className="bg-amber-50 text-amber-700 text-sm font-medium px-2.5 py-0.5 rounded-full ring-1 ring-amber-200/50 shrink-0">
              {drivers.length} pending
            </span>
          )}
        </h1>
        <p className="text-sm text-gray-400 mt-1">Review and approve new driver applications</p>
      </div>

      {drivers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-indigo-100/30 p-8 sm:p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-emerald-500">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">All caught up!</h3>
          <p className="text-gray-500">No pending driver applications to review</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {drivers.map((driver, i) => {
            const isActionLoading = actionLoading === driver.id;
            return (
              <div key={driver.id} className="bg-white rounded-2xl border border-indigo-100/30 shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6 slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    { (resolvedMap[driver.id]?.photoUrl || driver.photoUrl) ? (
                      <img src={resolvedMap[driver.id]?.photoUrl || driver.photoUrl} alt={driver.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-indigo-100 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center ring-2 ring-indigo-100 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-indigo-400">
                          <path d="M5 17h14l3-8H2l3 8z" /><circle cx="8" cy="18" r="2" /><circle cx="16" cy="18" r="2" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{driver.name}</h3>
                      <p className="text-gray-500 text-sm flex items-center gap-2 flex-wrap">
                        <span className="truncate">{driver.phone}</span>
                        <span className="text-gray-300 shrink-0">·</span>
                        <Badge status="pending" />
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5 truncate">
                        {driver.bikeMake} {driver.bikeModel} {driver.bikeYear} · <span className="font-mono">{driver.bikePlate}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    <button onClick={() => navigate(`/drivers/${driver.id}`)}
                      className="px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700">
                      View Details
                    </button>
                    <button onClick={() => approve(driver.id)} disabled={isActionLoading}
                      className="px-3 sm:px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-medium disabled:opacity-60 shadow-sm hover:shadow-md flex items-center gap-1.5">
                      {isActionLoading ? (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                      {isActionLoading ? 'Processing...' : 'Approve'}
                    </button>
                    <button onClick={() => reject(driver.id)} disabled={isActionLoading}
                      className="px-3 sm:px-4 py-2 text-sm bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all font-medium disabled:opacity-60 shadow-sm hover:shadow-md flex items-center gap-1.5">
                      {isActionLoading ? (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      )}
                      {isActionLoading ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                    { label: 'CNIC Front', url: resolvedMap[driver.id]?.cnicFrontUrl || driver.cnicFrontUrl },
                    { label: 'CNIC Back', url: resolvedMap[driver.id]?.cnicBackUrl || driver.cnicBackUrl },
                    { label: 'License', url: resolvedMap[driver.id]?.licensePhotoUrl || driver.licensePhotoUrl },
                    { label: 'Bike Photo', url: resolvedMap[driver.id]?.bikePhotoUrl || driver.bikePhotoUrl },
                    { label: 'Intro Video', url: resolvedMap[driver.id]?.videoUrl || driver.videoUrl },
                  ].map(({ label, url }) => (
                    <div key={label}>
                      <p className="text-[11px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">{label}</p>
                      {url ? (
                        <a href={url} target="_blank" rel="noreferrer">
                          {getFileKind(url) === 'video' ? (
                            <div className="relative w-full h-16 sm:h-20 rounded-xl border border-indigo-100/30 overflow-hidden bg-black">
                              <video src={url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-900 ml-0.5">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : getFileKind(url) === 'pdf' ? (
                            <div className="flex h-16 w-full items-center justify-center rounded-xl border border-indigo-100/30 bg-indigo-50/60 text-indigo-700 sm:h-20">
                              <div className="text-center">
                                <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                  </svg>
                                </div>
                                <span className="text-[10px] font-semibold uppercase tracking-wide">PDF</span>
                              </div>
                            </div>
                          ) : (
                            <img src={url} alt={label}
                              className="w-full h-16 sm:h-20 object-cover rounded-xl border border-indigo-100/30 hover:opacity-80 hover:shadow-md transition-all cursor-pointer" />
                          )}
                        </a>
                      ) : (
                        <div className="w-full h-16 sm:h-20 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">
                          {label === 'Intro Video' ? 'No video' : 'No image'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 leading-relaxed">
                  <span className="truncate max-w-[180px]">CNIC: <strong className="text-gray-700 font-mono">{driver.cnicNumber}</strong></span>
                  <span className="truncate max-w-[180px]">License: <strong className="text-gray-700 font-mono">{driver.licenseNumber}</strong></span>
                  {driver.createdAt?.toDate && (
                    <span>Applied: <strong className="text-gray-700">{formatDate(driver.createdAt.toDate())}</strong></span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getFileKind(url) {
  if (!url) return 'unknown';
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
  if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext) || /video/i.test(url)) {
    return 'video';
  }
  if (ext === 'pdf' || /\.pdf($|\?)/i.test(url) || /application\/pdf/i.test(url)) {
    return 'pdf';
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'heic', 'heif'].includes(ext)) {
    return 'image';
  }
  return 'file';
}

function normalizeStorageValue(value) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:|blob:|data:)/i.test(trimmed)) return trimmed;
  if (/^gs:\/\//i.test(trimmed)) {
    return trimmed.replace(/^gs:\/\/[^/]+\//, '');
  }
  if (/^\/\//.test(trimmed)) return trimmed.replace(/^\/\//, '');
  return trimmed.replace(/^\/+/, '');
}

function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}
