import { NavLink, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useState, useEffect } from 'react';

const links = [
  { to: '/', label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg> },
  { to: '/drivers/pending', label: 'Pending Approval', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg> },
  { to: '/drivers', label: 'All Drivers', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> },
  { to: '/commission-payments', label: 'Commission Payments', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 1v22" /><path d="M6 7h12M6 17h12" /></svg> },
  { to: '/rides', label: 'Rides', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 12h-4l-3 9H9l-3-9H2" /><path d="M9 3h6l2 5H7l2-5z" /><line x1="9" y1="12" x2="9" y2="15" /><line x1="15" y1="12" x2="15" y2="15" /></svg> },
  { to: '/users', label: 'Users', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { to: '/helmet-applications', label: 'Helmet Requests', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" /><path d="M9 12l2 2 4-4" /></svg> },
  { to: '/appeals', label: 'Appeals', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 8h8" /><path d="M8 12h6" /></svg> },
];

export default function Sidebar() {
  const [loggingOut, setLoggingOut] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => { document.body.style.overflow = mobileOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [mobileOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut(auth);
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] via-transparent to-violet-500/[0.03] pointer-events-none" />

      <div className="relative px-4 py-5 border-b border-indigo-900/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/10 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] drop-shadow-sm">
              <path d="M5 17h14l3-8H2l3 8z" />
              <circle cx="8" cy="18" r="2" />
              <circle cx="16" cy="18" r="2" />
            </svg>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="font-bold text-white text-[15px] leading-none tracking-tight">Baiku</div>
              <div className="text-[9px] text-indigo-300/60 mt-1 tracking-widest uppercase font-medium">Admin Panel</div>
            </div>
          )}
        </div>
      </div>

      <nav className="relative flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <div className="text-[9px] text-indigo-300/40 font-semibold uppercase tracking-[0.15em] px-3 mb-3 flex items-center gap-2">
            <span className="w-4 h-px bg-indigo-400/20" />
            Main Menu
          </div>
        )}
        {links.map(({ to, label, icon }) => {
          const active = isActive(to);
          return (
            <NavLink key={to} to={to} end={to === '/'} title={collapsed ? label : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${active ? 'text-white' : 'text-indigo-200/60 hover:text-white hover:bg-white/[0.06]'}
                ${collapsed ? 'justify-center px-0' : ''}`}>
              {active && (
                <>
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-indigo-500/10 to-transparent rounded-xl" />
                  <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-indigo-400/20" />
                </>
              )}
              <span className={`relative z-10 transition-all duration-200 ${active ? 'text-indigo-300' : 'text-indigo-400/60 group-hover:text-indigo-300'}`}>{icon}</span>
              {!collapsed && <span className="relative z-10 truncate">{label}</span>}
              {active && !collapsed && <span className="ml-auto relative z-10 shrink-0"><span className="block w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-sm shadow-indigo-400/50" /></span>}
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-indigo-400 to-violet-500 rounded-full shadow-sm shadow-indigo-400/50" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="relative px-2.5 py-3 border-t border-indigo-900/30 bg-gradient-to-t from-indigo-950/30 to-transparent">
        <button onClick={handleLogout} disabled={loggingOut}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 group relative overflow-hidden
            ${collapsed ? 'justify-center px-0' : ''} text-red-300/70 hover:text-red-300 hover:bg-red-500/10`}>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/[0.03] to-red-500/0 group-hover:via-red-500/[0.06] transition-all duration-500" />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-[18px] h-[18px] transition-all duration-200 group-hover:translate-x-0.5 relative z-10 ${loggingOut ? 'animate-spin' : ''}`}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span className="relative z-10 truncate">{loggingOut ? 'Logging out...' : 'Logout'}</span>}
        </button>
        <div className="hidden md:flex items-center gap-2 px-1 mt-3">
          <button onClick={() => setCollapsed(!collapsed)}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium text-indigo-400/40 hover:text-indigo-300/60 hover:bg-white/[0.04] transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
              <line x1="3" y1="12" x2="15" y2="12" /><polyline points="15 18 9 12 15 6" />
            </svg>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - desktop + mobile overlay */}
      <aside className={`
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        fixed lg:static inset-y-0 left-0 z-50
        ${collapsed ? 'w-[72px]' : 'w-60'}
        min-h-screen bg-gradient-to-b from-[#0F0B1A] via-[#16102B] to-[#0F0B1A] border-r border-indigo-900/20
        flex flex-col shrink-0 transition-all duration-300
      `}>
        {sidebarContent}
      </aside>
    </>
  );
}
