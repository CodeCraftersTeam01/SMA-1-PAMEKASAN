import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For mobile responsiveness

  // Parse user data from local storage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Admin', email: 'admin@sman1.com', role: 'Admin' };
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'A';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Menu items based on typical dashboard needs
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    // Add more menu items here as needed
  ];

  return (
    <div className="min-h-screen flex bg-[#f4f7f9] font-sans text-slate-800">
      
      {/* Sidebar - Desktop */}
      <aside 
        className={`fixed inset-y-0 left-0 z-20 w-[260px] bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 28px), 50% 100%, 0 calc(100% - 28px))' }} // Mimicking the auth card shape faintly, but maybe better to just use rounded corners for sidebar
      >
        <div className="h-full flex flex-col pt-8 pb-12 rounded-r-[24px] shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-100 bg-white">
          
          {/* Logo & Branding */}
          <div className="px-8 pb-6 mb-4 border-b border-slate-100/60">
            <div className="flex items-center gap-3">
              <img src="/public/logo-sma.png" alt="Logo" className="w-10 h-10 object-contain" />
              <div>
                <h2 className="text-[14px] font-bold text-[#1e293b] leading-tight">SMAN 1</h2>
                <p className="text-[10px] text-[#64748b] font-medium tracking-wide">PAMEKASAN</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <div className="px-4 mb-2">
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Menu Utama</span>
            </div>
            
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group ${isActive ? 'bg-[#4685ff] text-white shadow-[0_4px_12px_rgba(70,133,255,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                  <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className={`text-[13px] font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User & Logout section */}
          <div className="px-4 mt-auto">
            <div className="p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-700 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar Sesi
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[260px] min-h-screen">
        
        {/* Header */}
        <header className="sticky top-4 z-30 bg-white/40 backdrop-blur-2xl backdrop-saturate-[1.5] border border-white/60 shadow-[0_8px_32px_rgba(30,41,59,0.04)] h-[72px] flex items-center px-4 lg:px-8 justify-between mx-4 mb-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-[16px] font-bold text-[#1e293b]">Dashboard Overview</h1>
              <p className="text-[11px] text-[#94a3b8] hidden sm:block">Akses dan kelola semua modul dari sini.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Actions / Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            {/* User Profile Mini */}
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-[12px] font-bold text-slate-700">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.role || 'Admin'}</p>
              </div>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=eff6ff&color=blue`} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-200" />
            </div>
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
