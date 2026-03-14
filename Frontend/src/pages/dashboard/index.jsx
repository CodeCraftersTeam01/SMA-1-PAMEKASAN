import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Selamat Datang di Sistem Informasi!</h2>
          <p className="text-blue-100 text-sm max-w-xl">
            Sistem Informasi SMAN 1 Pamekasan. Kelola data sekolah dengan efisiensi dan mudah melalui platform terpadu.
          </p>
        </div>
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 -m-8 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-32 -m-8 w-32 h-32 bg-indigo-900/20 rounded-full blur-xl"></div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Total Siswa</h3>
            <span className="p-2 bg-blue-50 text-blue-500 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-[#1e293b]">1,248</p>
          <div className="mt-2 flex items-center text-[11px] font-medium text-emerald-500 gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            <span>+12% dari bulan lalu</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Guru Aktif</h3>
            <span className="p-2 bg-purple-50 text-purple-500 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-[#1e293b]">84</p>
          <div className="mt-2 flex items-center text-[11px] font-medium text-slate-400 gap-1">
            <span>Tetap stabil</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Kelas</h3>
            <span className="p-2 bg-amber-50 text-amber-500 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-[#1e293b]">36</p>
          <div className="mt-2 flex items-center text-[11px] font-medium text-amber-500 gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            <span>+2 kelas baru</span>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Kehadiran Hari Ini</h3>
            <span className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-[#1e293b]">98%</p>
          <div className="mt-2 flex items-center text-[11px] font-medium text-emerald-500 gap-1">
            <span>Sangat Baik</span>
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Table */}
        <div className="bg-white rounded-2xl p-6 lg:col-span-2 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-bold text-[#1e293b]">Aktivitas Terkini</h3>
            <button className="text-[12px] font-semibold text-blue-500 hover:text-blue-600 transition-colors">
              Lihat Semua
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Aktivitas</th>
                  <th className="pb-3">Oleh</th>
                  <th className="pb-3">Tanggal</th>
                  <th className="pb-3 text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-600">
                {[
                  { act: 'Update Data Siswa', by: 'Admin Utama', date: 'Hari ini', status: 'Sukses', statusColor: 'emerald' },
                  { act: 'Backup Database', by: 'Sistem', date: 'Kemarin', status: 'Selesai', statusColor: 'blue' },
                  { act: 'Sinkronisasi Ujian', by: 'Admin CBT', date: 'Kemarin', status: 'Gagal', statusColor: 'red' },
                  { act: 'Upload Modul Ajar', by: 'Guru A', date: '12 Nov 2026', status: 'Sukses', statusColor: 'emerald' },
                ].map((item, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-2 font-medium text-slate-700">{item.act}</td>
                    <td className="py-4">{item.by}</td>
                    <td className="py-4 text-slate-400 text-[12px]">{item.date}</td>
                    <td className="py-4 text-right pr-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-${item.statusColor}-50 text-${item.statusColor}-500 border border-${item.statusColor}-100`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <h3 className="text-[16px] font-bold text-[#1e293b] mb-6">Tindakan Cepat</h3>
          <div className="space-y-3">
            {[
              { icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', label: 'Tambah Siswa Baru', color: 'blue' },
              { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', label: 'Laporan Kehadiran', color: 'emerald' },
              { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', label: 'Pengaturan Sistem', color: 'slate' }
            ].map((action, i) => (
              <button key={i} className="w-full flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm transition-all text-left group">
                <span className={`w-10 h-10 rounded-lg bg-${action.color}-50 text-${action.color}-500 flex items-center justify-center group-hover:bg-${action.color}-100 transition-colors`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                  </svg>
                </span>
                <span className="text-[13px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
