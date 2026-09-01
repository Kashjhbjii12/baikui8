import { useEffect } from 'react';

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

export default function ImageModal({ src, onClose }) {
  useEffect(() => {
    if (!src) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [src, onClose]);

  if (!src) return null;

  const fileKind = getFileKind(src);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 fade-in backdrop-blur-md"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
        {fileKind === 'video' ? (
          <video
            src={src}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl scale-in bg-black"
            style={{ maxWidth: '90vw', maxHeight: '85vh' }}
          >
            Your browser does not support the video tag.
          </video>
        ) : fileKind === 'pdf' ? (
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden bg-white shadow-2xl scale-in">
            <iframe
              src={src}
              title="Document preview"
              className="w-full h-[75vh] min-h-[420px]"
            />
          </div>
        ) : fileKind === 'image' ? (
          <img
            src={src}
            alt="Document"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl scale-in"
          />
        ) : (
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl scale-in text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Preview unavailable</h3>
            <p className="mt-2 text-sm text-gray-500">This file type cannot be previewed inline, but you can still open or download it.</p>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Open or download file
            </a>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-gray-900 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-700 transition-all shadow-lg ring-2 ring-white/20 hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="absolute bottom-6 text-white/50 text-xs flex items-center gap-3">
        <span>Click outside or press ESC to close</span>
      </div>
    </div>
  );
}
