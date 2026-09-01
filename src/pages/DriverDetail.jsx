import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import ImageModal from '../components/ImageModal';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

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

export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [resolved, setResolved] = useState({});
  const [modalImg, setModalImg] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    return onSnapshot(doc(db, 'drivers', id), snap => {
      if (snap.exists()) setDriver({ id: snap.id, ...snap.data() });
    });
  }, [id]);

  // Resolve storage paths to downloadable URLs if necessary
  useEffect(() => {
    if (!driver) return;
    const fields = ['photoUrl','cnicFrontUrl','cnicBackUrl','licensePhotoUrl','bikePhotoUrl','videoUrl','juniorPhotoUrl','juniorVideoUrl'];
    const toResolve = {};
    const promises = [];
    fields.forEach(f => {
      const val = driver[f];
      if (!val) return;
      const normalized = normalizeStorageValue(val);
      if (typeof val === 'string' && (/^https?:\/\//i.test(val))) {
        toResolve[f] = val;
      } else if (normalized) {
        const p = getDownloadURL(storageRef(storage, normalized)).then(url => ({ f, url })).catch(() => ({ f, url: null }));
        promises.push(p);
      }
    });
    if (promises.length === 0) {
      setResolved(toResolve);
      return;
    }
    Promise.all(promises).then(results => {
      results.forEach(r => { if (r && r.f) toResolve[r.f] = r.url; });
      setResolved(toResolve);
    });
  }, [driver]);

  const approve = async () => {
    try { await updateDoc(doc(db, 'drivers', id), { status: 'approved' }); toast.success('Driver approved!'); }
    catch { toast.error('Failed to approve driver'); }
  };

  const reject = async () => {
    try {
      await updateDoc(doc(db, 'drivers', id), { status: 'rejected', rejectionReason: rejectReason || 'Does not meet requirements' });
      toast.success('Driver rejected');
      setShowRejectModal(false);
      setRejectReason('');
    } catch { toast.error('Failed to reject driver'); }
  };

  if (!driver) return (
    <div className="space-y-4">
      <div className="h-5 skeleton rounded w-20 mb-4" />
      <div className="bg-white rounded-2xl border border-indigo-100/30 p-6 space-y-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 skeleton rounded-full" />
          <div className="space-y-2">
            <div className="h-6 skeleton rounded w-40" />
            <div className="h-4 skeleton rounded w-28" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
        </div>
      </div>
    </div>
  );

  const docs = [
    { label: 'Profile Photo', url: resolved.photoUrl || driver.photoUrl },
    { label: 'CNIC Front', url: resolved.cnicFrontUrl || driver.cnicFrontUrl },
    { label: 'CNIC Back', url: resolved.cnicBackUrl || driver.cnicBackUrl },
    { label: 'License', url: resolved.licensePhotoUrl || driver.licensePhotoUrl },
    { label: 'Bike Photo', url: resolved.bikePhotoUrl || driver.bikePhotoUrl },
    { label: 'Intro Video', url: resolved.videoUrl || driver.videoUrl },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-indigo-600 flex items-center gap-1.5 text-sm transition-colors group py-2 min-h-[44px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-2xl border border-indigo-100/30 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 min-w-0">
            {driver.photoUrl ? (
              <img src={driver.photoUrl} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-indigo-100 shrink-0" alt="" />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center ring-2 ring-indigo-100 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-indigo-400">
                  <path d="M5 17h14l3-8H2l3 8z" /><circle cx="8" cy="18" r="2" /><circle cx="16" cy="18" r="2" />
                </svg>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{driver.name}</h2>
                <Badge status={driver.status} />
              </div>
              <p className="text-gray-500 text-sm">{driver.phone}</p>
            </div>
          </div>
          {driver.status === 'pending' && (
            <div className="flex flex-wrap gap-3 shrink-0">
              <button onClick={approve} className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                <span>Approve</span>
              </button>
              <button onClick={() => setShowRejectModal(true)} className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-rose-700 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                <span>Reject</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ['CNIC Number', driver.cnicNumber], ['License Number', driver.licenseNumber],
            ['Bike Make', driver.bikeMake], ['Bike Model', driver.bikeModel],
            ['Bike Year', driver.bikeYear], ['Bike Plate', driver.bikePlate],
            ['Total Rides', driver.totalRides ?? 0], ['Rating', `${driver.rating?.toFixed(1) ?? '5.0'} ⭐`],
            ['Earnings', `Rs. ${driver.earnings ?? 0}`],
          ].map(([k, v]) => (
            <div key={k} className="bg-indigo-50/30 rounded-xl p-3 hover:bg-indigo-50/50 transition-colors">
              <div className="text-[11px] text-gray-400 mb-0.5 uppercase tracking-wider">{k}</div>
              <div className="font-medium text-gray-800 truncate">{v || <span className="text-gray-300 italic">—</span>}</div>
            </div>
          ))}
        </div>

        {driver.rejectionReason && (
          <div className="mt-4 p-4 bg-rose-50 rounded-xl border border-rose-100">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-rose-500 mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="min-w-0">
                <p className="text-[11px] text-rose-400 font-medium uppercase tracking-wider mb-0.5">Rejection Reason</p>
                <p className="text-sm text-rose-700 break-words">{driver.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-indigo-100/30 shadow-sm p-4 sm:p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-500">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
          Documents
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {docs.map(({ label, url }) => (
            <div key={label}>
              <p className="text-[11px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">{label}</p>
              {url ? (
                <div onClick={() => setModalImg(url)} className="relative w-full h-24 sm:h-28 rounded-xl border border-indigo-100/30 overflow-hidden cursor-pointer group bg-gray-50">
                  {getFileKind(url) === 'video' ? (
                    <>
                      <video src={url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-all">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-900 ml-0.5">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : getFileKind(url) === 'pdf' ? (
                    <div className="flex h-full w-full items-center justify-center bg-indigo-50/60 text-indigo-700">
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wide">PDF</span>
                      </div>
                    </div>
                  ) : (
                    <img src={url} alt={label}
                      className="w-full h-full object-cover rounded-xl hover:opacity-80 hover:shadow-md transition-all" />
                  )}
                </div>
              ) : (
                <div className="w-full h-24 sm:h-28 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">
                  {label === 'Intro Video' ? 'No video' : 'No image'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ImageModal src={modalImg} onClose={() => setModalImg(null)} />
      <ConfirmModal open={showRejectModal} title="Reject Driver" message="Are you sure you want to reject this driver's application?"
        confirmLabel="Reject" cancelLabel="Cancel" danger onConfirm={reject} onCancel={() => setShowRejectModal(false)} />
    </div>
  );
}
