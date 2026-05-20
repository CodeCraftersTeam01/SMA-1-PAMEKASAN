import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(() => {
    return localStorage.getItem('main_menu_open') !== 'false';
  });
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(() => {
    return localStorage.getItem('settings_menu_open') !== 'false';
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleMainMenu = () => {
    setIsMainMenuOpen(prev => {
      const next = !prev;
      localStorage.setItem('main_menu_open', String(next));
      return next;
    });
  };

  const toggleSettingsMenu = () => {
    setIsSettingsMenuOpen(prev => {
      const next = !prev;
      localStorage.setItem('settings_menu_open', String(next));
      return next;
    });
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // User data always comes from the server-verified AuthContext, not localStorage
  const { user, logout } = useAuth();
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';
  const getAvatarUrl = () => {
    if (user?.photo) return `${API_BASE_URL}/storage/${user.photo}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'A')}&background=eff6ff`;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

   const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/tahun-ajaran', label: 'Tahun Ajaran', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { path: '/pendaftar', label: 'Pendaftar', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { path: '/siswa', label: 'Siswa', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { path: '/laporan', label: 'Laporan', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { path: '/admin/alumni-tracking', label: 'Penelusuran Alumni', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
  ];

  const settingMenuItems = [
    { path: '/pengaturan-nis', label: 'Konfigurasi NIS', icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14' },
    { path: '/pengaturan-tracking', label: 'Konfigurasi Tracking', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    ...(user?.role === 'admin'
      ? [{ path: '/user-management', label: 'Manajemen Pengguna', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z' }]
      : []),
  ];
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white to-slate-100 font-sans text-slate-800">
      <div class="fixed top-0 left-0 z-[2] w-full h-[100px] 
            bg-gradient-to-b from-black/20 to-transparent 
            backdrop-blur-sm 
            [mask-image:linear-gradient(to_bottom,black,transparent)]">
      </div>

      {/* Sidebar - Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 transition-all duration-300 ease-in-out bg-white/60 lg:translate-x-0 ${
          isSidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
        } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ borderTopRightRadius: '24px', borderBottomRightRadius: '24px' }}
      >
        <div className="h-full flex flex-col pt-5 pb-6 rounded-r-[24px] shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-100">

          {/* Logo & Branding */}
          <div className={`pb-4 mb-3 border-b border-slate-100/60 ${isSidebarCollapsed ? 'px-2 flex justify-center' : 'px-6'}`}>
            <div className="flex items-center gap-2.5">
              <img src="/logo-sma.png" alt="Logo" className="w-8 h-8 object-contain shrink-0" />
              {!isSidebarCollapsed && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-[13px] font-bold text-[#1e293b] leading-tight">SMAN 1</h2>
                  <p className="text-[9px] text-[#64748b] font-medium tracking-wide">PAMEKASAN</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {/* Menu Utama Header */}
            <button 
              onClick={toggleMainMenu}
              className={`w-full flex items-center justify-between mb-1.5 mt-1 text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest transition-all ${
                isSidebarCollapsed ? 'px-0 justify-center' : 'px-3'
              }`}
              title={isSidebarCollapsed ? "Menu Utama" : ""}
            >
              {isSidebarCollapsed ? (
                <div className="w-5 border-b border-slate-200 my-1"></div>
              ) : (
                <>
                  <span>Menu Utama</span>
                  <svg className={`w-2.5 h-2.5 transition-transform duration-300 ${isMainMenuOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>

            {/* Menu Utama Items */}
            <div 
              className={`space-y-0.5 transition-all duration-300 ease-in-out overflow-hidden ${
                (!isSidebarCollapsed ? isMainMenuOpen : true) 
                  ? 'max-h-[300px] opacity-100' 
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2.5 py-2 rounded-xl transition-all group ${
                      isSidebarCollapsed ? 'justify-center px-0' : 'px-3 text-left'
                    } ${isActive ? 'bg-slate-800 text-white shadow-[0_3px_10px_rgba(30,41,59,0.2)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                    title={isSidebarCollapsed ? item.label : ''}
                  >
                    <svg className={`w-4 h-4 shrink-0 ${isSidebarCollapsed ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-800'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {!isSidebarCollapsed && (
                      <span className={`text-[12px] font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Pengaturan Header */}
            <button 
              onClick={toggleSettingsMenu}
              className={`w-full flex items-center justify-between mb-1.5 mt-4 text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest transition-all ${
                isSidebarCollapsed ? 'px-0 justify-center' : 'px-3'
              }`}
              title={isSidebarCollapsed ? "Pengaturan" : ""}
            >
              {isSidebarCollapsed ? (
                <div className="w-5 border-b border-slate-200 my-1"></div>
              ) : (
                <>
                  <span>Pengaturan</span>
                  <svg className={`w-2.5 h-2.5 transition-transform duration-300 ${isSettingsMenuOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>

            {/* Pengaturan Items */}
            <div 
              className={`space-y-0.5 transition-all duration-300 ease-in-out overflow-hidden ${
                (!isSidebarCollapsed ? isSettingsMenuOpen : true) 
                  ? 'max-h-[300px] opacity-100' 
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              {settingMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2.5 py-2 rounded-xl transition-all group ${
                      isSidebarCollapsed ? 'justify-center px-0' : 'px-3 text-left'
                    } ${isActive ? 'bg-slate-800 text-white shadow-[0_3px_10px_rgba(30,41,59,0.2)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                    title={isSidebarCollapsed ? item.label : ''}
                  >
                    <svg className={`w-4 h-4 shrink-0 ${isSidebarCollapsed ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-800'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {!isSidebarCollapsed && (
                      <span className={`text-[12px] font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User & Logout section */}
          <div className="px-3 mt-auto">
            <button 
              onClick={() => navigate('/profile')} 
              className={`bg-slate-50 hover:bg-slate-100 rounded-xl mb-3 border border-slate-100 flex items-center w-full transition-colors text-left cursor-pointer ${
                isSidebarCollapsed ? 'p-1.5 justify-center' : 'p-2.5 gap-2.5'
              }`}
              title={isSidebarCollapsed ? user.name : ''}
            >
              <img src={getAvatarUrl()} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0" />
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                  <p className="text-[12px] font-bold text-slate-700 truncate">{user.name}</p>
                  <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
                </div>
              )}
            </button>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2 text-[11px] font-bold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100 ${
                isSidebarCollapsed ? 'justify-center py-2 px-0' : 'px-3 py-2'
              }`}
              title={isSidebarCollapsed ? "Keluar Sesi" : ""}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isSidebarCollapsed && <span>Keluar Sesi</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen ${
        isSidebarCollapsed ? 'lg:pl-[80px]' : 'lg:pl-[260px]'
      }`}>

        {/* Header */}
        <header className="sticky top-4 z-30 bg-white/40 backdrop-blur-2xl backdrop-saturate-[1.5] border border-white/60 shadow-[0_8px_32px_rgba(30,41,59,0.04)] h-[60px] flex items-center px-4 lg:px-6 justify-between mx-4 mb-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex p-1.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all active:scale-95 cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <svg className="w-4 h-4 transition-transform duration-300 animate-in fade-in duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
            </button>
            <div>
              <h1 className="text-[13px] font-bold text-[#1e293b] leading-tight">Dashboard Overview</h1>
              <p className="text-[9px] text-[#94a3b8] hidden sm:block">Akses dan kelola semua modul dari sini.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Quick Actions / Notifications */}
            <button className="relative p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            {/* User Profile Mini */}
            <button onClick={() => navigate('/profile')} className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200 hover:opacity-80 transition-opacity">
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-700 leading-tight">{user.name}</p>
                <p className="text-[9px] text-slate-500">{user.role || 'Admin'}</p>
              </div>
              <img src={getAvatarUrl()} alt="Avatar" className="w-7 h-7 rounded-full border border-slate-200 object-cover" />
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>

      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-10 bg-slate-900/20 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

    </div>
  );
};

export default DashboardLayout;
