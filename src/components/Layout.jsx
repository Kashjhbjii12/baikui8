import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';

const pageTitles = {
  '/': { title: 'Dashboard', parent: null },
    '/commission-payments': { title: 'Commission Payments', parent: null },
  '/drivers/pending': { title: 'Pending Approval', parent: { label: 'Drivers', to: '/drivers' } },
  '/drivers': { title: 'All Drivers', parent: null },
  '/rides': { title: 'Rides', parent: null },
  '/users': { title: 'Users', parent: null },
  '/helmet-applications': { title: 'Helmet Requests', parent: null },
};

export default function Layout() {
  const location = useLocation();
  const basePath = '/' + location.pathname.split('/').slice(1, 3).join('/');
  const basePath2 = '/' + location.pathname.split('/')[1];
  const info = pageTitles[location.pathname] || pageTitles[basePath] || pageTitles[basePath2] || { title: '', parent: null };
  const isDetail = !pageTitles[location.pathname] && !pageTitles[basePath];

  return (
    <div className="flex min-h-screen bg-[#F5F5FA]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100/30 px-4 sm:px-6 py-3 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm ml-14 lg:ml-0 min-w-0">
            <Link to="/" className="text-indigo-400 hover:text-indigo-600 transition-colors shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
            <span className="text-gray-300 shrink-0">/</span>
            {info.parent && (
              <>
                <Link to={info.parent.to} className="text-gray-400 hover:text-gray-600 transition-colors font-medium truncate shrink min-w-0">
                  {info.parent.label}
                </Link>
                <span className="text-gray-300 shrink-0">/</span>
              </>
            )}
            <span className={`text-gray-800 font-semibold truncate ${isDetail ? 'text-indigo-600' : ''}`}>
              {info.title || (isDetail ? 'Details' : '')}
            </span>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="fade-in max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
