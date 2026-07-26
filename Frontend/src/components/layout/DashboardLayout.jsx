import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(() => {
    return localStorage.getItem('settings_menu_open') !== 'false';
  });
  // const [isWebSettingsMenuOpen, setIsWebSettingsMenuOpen] = useState(() => {
  //   return localStorage.getItem('web_settings_menu_open') !== 'false';
  // });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
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

  // const toggleWebSettingsMenu = () => {
  //   setIsWebSettingsMenuOpen(prev => {
  //     const next = !prev;
  //     localStorage.setItem('web_settings_menu_open', String(next));
  //     return next;
  //   });
  // };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // User data always comes from the server-verified AuthContext, not localStorage
  const { user, logout, can } = useAuth();

  const [activeTahunAjaran, setActiveTahunAjaran] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }

      const countRes = await fetch(`${API_BASE_URL}/api/admin/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (countRes.ok) {
        const countData = await countRes.json();
        setUnreadCount(countData.count);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 0);
    const interval = setInterval(fetchNotifications, 12000); // Poll every 12 seconds
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsRead = async (id, type) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/admin/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
      
      // Navigate to correct page
      setIsNotifOpen(false);
      if (type === 'pendaftaran') navigate('/pendaftar');
      else if (type === 'testimonial') navigate('/admin/website/testimonials');
      else if (type === 'alumni_tracking') navigate('/alumni-tracking');
      else if (type === 'prestasi') navigate('/admin/website/prestasi');
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/admin/notifications/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm("Hapus semua riwayat notifikasi?")) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/admin/notifications/clear`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchActiveTahunAjaran = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tahun-ajaran/aktif`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
        });
        if (res.ok) {
          const data = await res.json();
          setActiveTahunAjaran(data.tahun);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchActiveTahunAjaran();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getAvatarUrl = () => {
    if (user?.photo) return `${API_BASE_URL}/storage/${user.photo}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'A')}&background=eff6ff`;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ── Nav categories ──────────────────────────────────────────────────────────
  const navCategories = [
    {
      key: 'utama',
      label: 'Menu Utama',
      dotClass: 'bg-slate-300',
      activeClass: 'bg-slate-800 text-white shadow-[0_3px_10px_rgba(30,41,59,0.2)]',
      hoverClass: 'hover:bg-slate-50 hover:text-slate-800',
      items: [
        {
          path: '/dashboard',
          label: 'Dashboard',
          icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
          permission: { resource: 'dashboard', action: 'view' },
        },
        {
          path: '/tahun-ajaran',
          label: 'Tahun Ajaran',
          icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
          permission: { resource: 'tahun_ajaran', action: 'view' },
        },
      ],
    },
    {
      key: 'akademik',
      label: 'Data Sekolah',
      dotClass: 'bg-slate-300',
      activeClass: 'bg-slate-800 text-white shadow-[0_3px_10px_rgba(30,41,59,0.2)]',
      hoverClass: 'hover:bg-slate-50 hover:text-slate-800',
      items: [
        {
          path: '/pendaftar',
          label: 'Pendaftar',
          icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
          permission: { resource: 'pendaftaran', action: 'view' },
        },
        {
          path: '/siswa',
          label: 'Siswa',
          icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
          permission: { resource: 'siswa', action: 'view' },
        },
        {
          path: '/kelas',
          label: 'Kelas',
          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
          permission: { resource: 'kelas', action: 'view' },
        },
        {
          path: '/set-kelas',
          label: 'Pembagian Kelas',
          icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
          permission: { resource: 'set_kelas', action: 'view' },
        },
        {
          path: '/laporan',
          label: 'Laporan',
          icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
          permission: { resource: 'laporan', action: 'view' },
        },
      ],
    },
    {
      key: 'alumni',
      label: 'Alumni',
      dotClass: 'bg-slate-300',
      activeClass: 'bg-slate-800 text-white shadow-[0_3px_10px_rgba(30,41,59,0.2)]',
      hoverClass: 'hover:bg-slate-50 hover:text-slate-800',
      items: [
        {
          path: '/admin/alumni',
          label: 'Daftar Alumni',
          icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
          permission: { resource: 'alumni', action: 'view' },
        },
        {
          path: '/admin/alumni-tracking',
          label: 'Penelusuran Alumni',
          icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
          permission: { resource: 'alumni_tracking', action: 'view' },
        },
      ],
    },
    {
      key: 'website',
      label: 'Tampilan Website',
      dotClass: 'bg-slate-300',
      activeClass: 'bg-slate-800 text-white shadow-[0_3px_10px_rgba(30,41,59,0.2)]',
      hoverClass: 'hover:bg-slate-50 hover:text-slate-800',
      items: [
        { path: '/admin/website/news', label: 'Berita Sekolah', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', permission: { resource: 'berita', action: 'view' } },
        { path: '/admin/website/prestasi', label: 'Prestasi Siswa', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', permission: { resource: 'prestasi', action: 'view' } },
        { path: '/admin/website/fasilitas', label: 'Fasilitas Sekolah', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', permission: { resource: 'fasilitas', action: 'view' } },
        { path: '/admin/website/ekstrakurikuler', label: 'Ekstrakurikuler', icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2H21v11H13l-1-2H5v6', permission: { resource: 'ekstrakurikuler', action: 'view' } },
        { path: '/admin/website/agenda', label: 'Agenda Sekolah', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', permission: { resource: 'agenda', action: 'view' } },
        { path: '/admin/website/pengumuman', label: 'Pengumuman', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', permission: { resource: 'pengumuman', action: 'view' } },
        { path: '/admin/website/pages', label: 'Halaman Tambahan', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', permission: { resource: 'halaman', action: 'view' } },
        {
          path: '/admin/website/navbar',
          label: 'Menu Navigasi',
          icon: 'M4 6h16M4 12h16M4 18h16',
          permission: { resource: 'navigasi', action: 'view' },
        },
        {
          path: '/admin/website/teachers',
          label: 'Data Guru',
          icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
          permission: { resource: 'teachers', action: 'view' },
        },
        {
          path: '/admin/website/features',
          label: 'Keunggulan Sekolah',
          icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
          permission: { resource: 'features', action: 'view' },
        },
        {
          path: '/admin/website/programs',
          label: 'Program Jurusan',
          icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
          permission: { resource: 'programs', action: 'view' },
        },
        {
          path: '/admin/website/quotes',
          label: 'Kata-kata Guru',
          icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
          permission: { resource: 'quotes', action: 'view' },
        },
        {
          path: '/admin/website/settings',
          label: 'Pengaturan Landing Page',
          icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
          permission: { resource: 'landing_settings', action: 'view' },
        },
        {
          path: '/admin/website/testimonials',
          label: 'Testimoni',
          icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
          permission: { resource: 'testimonials', action: 'view' },
        },
      ],
    },
  ];

  const settingMenuItems = [
    { path: '/pengaturan-nis', label: 'Pengaturan NIS', icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14', permission: { resource: 'pengaturan_nis', action: 'view' } },
    { path: '/pengaturan-tracking', label: 'Pengaturan Penelusuran', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', permission: { resource: 'pengaturan_tracking', action: 'view' } },
    { path: '/user-management', label: 'Pengguna & Akses', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z', permission: { resource: 'user_management', action: 'view' } },
  ];



  // Per-category open state
  const [openCategories, setOpenCategories] = useState(() => {
    const saved = localStorage.getItem('sidebar_cat_open');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore invalid json */ }
    }
    return { utama: true, akademik: true, alumni: true, website: false };
  });

  const toggleCategory = (key) => {
    setOpenCategories(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('sidebar_cat_open', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white to-slate-100 font-sans text-slate-800">
      <div className="fixed top-0 left-0 z-[2] w-full h-[100px] 
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
          <div className={`pb-4 mb-2 border-b border-slate-100/60 ${isSidebarCollapsed ? 'px-2 flex justify-center' : 'px-6'}`}>
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
          <nav className="flex-1 px-3 overflow-y-auto">

            {/* ── Dynamic Categories ─────────────────────────────────────── */}
            {navCategories.map((cat) => {
              const isOpen = openCategories[cat.key] !== false;
              return (
                <div key={cat.key} className="mb-1">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(cat.key)}
                    className={`w-full flex items-center justify-between mb-1 mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest transition-all ${
                      isSidebarCollapsed ? 'px-0 justify-center' : 'px-3'
                    }`}
                    title={isSidebarCollapsed ? cat.label : ''}
                  >
                    {isSidebarCollapsed ? (
                      <span className="w-5 h-0.5 rounded-full bg-slate-200 inline-block"></span>
                    ) : (
                      <>
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.dotClass} inline-block shrink-0`}></span>
                          {cat.label}
                        </span>
                        <svg
                          className={`w-2.5 h-2.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Category Items */}
                  <div
                    className={`space-y-0.5 transition-all duration-300 ease-in-out overflow-hidden ${
                      (!isSidebarCollapsed ? isOpen : true)
                        ? 'max-h-[500px] opacity-100'
                        : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    {cat.items.filter(item => {
                      if (!item.permission) return true;
                      return can(item.permission.resource, item.permission.action);
                    }).map((item) => {
                      const isActive =
                        location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));
                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className={`w-full flex items-center gap-2.5 py-2 rounded-xl transition-all group ${
                            isSidebarCollapsed ? 'justify-center px-0' : 'px-3 text-left'
                          } ${isActive ? cat.activeClass : `text-slate-500 ${cat.hoverClass}`}`}
                          title={isSidebarCollapsed ? item.label : ''}
                        >
                          <svg
                            className={`w-4 h-4 shrink-0 ${isSidebarCollapsed ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-slate-400'}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                          </svg>
                          {!isSidebarCollapsed && (
                            <span className={`text-[12px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                              {item.label}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* ── Pengaturan Category ────────────────────────────────────── */}
            <div className="mb-1">
              <button
                onClick={toggleSettingsMenu}
                className={`w-full flex items-center justify-between mb-1 mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest transition-all ${
                  isSidebarCollapsed ? 'px-0 justify-center' : 'px-3'
                }`}
                title={isSidebarCollapsed ? 'Pengaturan' : ''}
              >
                {isSidebarCollapsed ? (
                  <span className="w-5 h-0.5 rounded-full bg-slate-200 inline-block"></span>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block shrink-0"></span>
                      Pengaturan
                    </span>
                    <svg
                      className={`w-2.5 h-2.5 transition-transform duration-300 ${isSettingsMenuOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>

              <div
                className={`space-y-0.5 transition-all duration-300 ease-in-out overflow-hidden ${
                  (!isSidebarCollapsed ? isSettingsMenuOpen : true)
                    ? 'max-h-[300px] opacity-100'
                    : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                {settingMenuItems.filter(item => {
                  if (item.adminOnly) return user?.role === 'admin';
                  if (!item.permission) return true;
                  return can(item.permission.resource, item.permission.action);
                }).map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-2.5 py-2 rounded-xl transition-all group ${
                        isSidebarCollapsed ? 'justify-center px-0' : 'px-3 text-left'
                      } ${isActive
                        ? 'bg-slate-800 text-white shadow-[0_3px_10px_rgba(30,41,59,0.2)]'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                      title={isSidebarCollapsed ? item.label : ''}
                    >
                      <svg
                        className={`w-4 h-4 shrink-0 ${isSidebarCollapsed ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-slate-400'}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      {!isSidebarCollapsed && (
                        <span className={`text-[12px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                          {item.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>



          </nav>

          {/* User & Logout section */}
          <div className="px-3 mt-auto pt-3 border-t border-slate-100">
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
              <h1 className="text-[13px] font-bold text-[#1e293b] leading-tight">Selamat Datang</h1>
              <p className="text-[9px] text-[#94a3b8] hidden sm:block">Pilih menu di samping untuk mulai mengelola.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Quick Actions / Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-1.5 text-slate-400 hover:text-[#1e293b] hover:bg-slate-50 rounded-full transition-all cursor-pointer focus:outline-none flex items-center justify-center"
                title="Notifikasi"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                    {/* Dropdown Header */}
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm">Notifikasi</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                        >
                          Tandai semua dibaca
                        </button>
                      )}
                    </div>

                    {/* Dropdown Body */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400">
                          <p className="text-xs font-medium">Tidak ada notifikasi</p>
                        </div>
                      ) : (
                        notifications.map((item) => {
                          let iconBg = 'bg-blue-50 text-blue-500';
                          let iconSvg = (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          );

                          if (item.type === 'testimonial') {
                            iconBg = 'bg-emerald-50 text-emerald-500';
                            iconSvg = (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.564-.37-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                              </svg>
                            );
                          } else if (item.type === 'alumni_tracking') {
                            iconBg = 'bg-orange-50 text-orange-500';
                            iconSvg = (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            );
                          } else if (item.type === 'prestasi') {
                            iconBg = 'bg-amber-50 text-amber-500';
                            iconSvg = (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                            );
                          }

                          return (
                            <div
                              key={item.id}
                              onClick={() => markAsRead(item.id, item.type)}
                              className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer text-left relative ${
                                !item.is_read ? 'bg-slate-50/30' : ''
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                                {iconSvg}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className={`text-xs truncate ${!item.is_read ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                                    {item.title}
                                  </p>
                                  <span className="text-[9px] text-slate-400">
                                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#64748b] mt-0.5 line-clamp-2 leading-relaxed">
                                  {item.message}
                                </p>
                              </div>
                              {!item.is_read && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0"></span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Dropdown Footer */}
                    {notifications.length > 0 && (
                      <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
                        <button
                          onClick={clearAllNotifications}
                          className="text-[10px] text-red-500 hover:text-red-600 font-bold tracking-wide uppercase cursor-pointer"
                        >
                          Bersihkan Semua Notifikasi
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Active Tahun Ajaran */}
            {activeTahunAjaran && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[11px] font-semibold text-blue-700">{activeTahunAjaran}</span>
              </div>
            )}

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
