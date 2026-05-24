import React, { useState } from 'react';

const RESOURCE_LABELS = {
  pendaftaran: 'Pendaftaran',
  siswa: 'Siswa',
  tahun_ajaran: 'TA',
  laporan: 'Laporan',
  alumni: 'Alumni',
  alumni_tracking: 'Tracking',
  pengaturan: 'Pengaturan',
};

const UserList = ({ users, isLoading, onEdit, onDelete, onRefresh, onManagePermissions }) => {
  const [showPerms, setShowPerms] = useState(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <svg className="w-16 h-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p className="text-lg font-medium">Tidak ada pengguna</p>
        <p className="text-sm">Klik tombol "Tambah Pengguna Baru" untuk membuat pengguna pertama</p>
      </div>
    );
  }

  const getPermissionSummary = (user) => {
    if (user.role === 'admin') return 'Full Akses';
    const perms = user.permissions || {};
    const granted = Object.entries(perms).filter(([, actions]) =>
      Object.values(actions).some(v => v === true)
    );
    return `${granted.length} modul`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="pb-3 px-6 text-left">No</th>
            <th className="pb-3 px-6 text-left">Nama</th>
            <th className="pb-3 px-6 text-left">Email</th>
            <th className="pb-3 px-6 text-left">Role</th>
            <th className="pb-3 px-6 text-left">Hak Akses</th>
            <th className="pb-3 px-6 text-left">Tanggal Dibuat</th>
            <th className="pb-3 px-6 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-[13px] text-slate-400 font-medium">{index + 1}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 font-bold text-xs shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[13px] font-bold text-slate-700">{user.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-[13px] text-slate-600">{user.email}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${
                    user.role?.toLowerCase() === 'admin'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : user.role?.toLowerCase() === 'petugas'
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : user.role?.toLowerCase() === 'tu'
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      : user.role?.toLowerCase() === 'guru'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : user.role?.toLowerCase() === 'kepsek'
                      ? 'bg-purple-50 text-purple-600 border-purple-100'
                      : 'bg-slate-50 text-slate-500 border-slate-200/40'
                  }`}
                >
                  {user.role?.toLowerCase() === 'admin'
                    ? 'Admin'
                    : user.role?.toLowerCase() === 'petugas'
                    ? 'Petugas'
                    : user.role?.toLowerCase() === 'tu'
                    ? 'Tata Usaha'
                    : user.role?.toLowerCase() === 'guru'
                    ? 'Guru'
                    : user.role?.toLowerCase() === 'kepsek'
                    ? 'Kepala Sekolah'
                    : user.role || '-'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="relative">
                  <button
                    onClick={() => setShowPerms(showPerms === user.id ? null : user.id)}
                    className="text-[12px] font-medium text-slate-600 hover:text-slate-800 flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {getPermissionSummary(user)}
                  </button>

                  {showPerms === user.id && (
                    <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-4 min-w-[320px]">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[13px] font-bold text-slate-700">
                          Hak Akses — {user.name}
                        </p>
                        <button
                          onClick={() => setShowPerms(null)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {user.role === 'admin' ? (
                        <p className="text-[12px] text-blue-600 font-medium">Full Akses (Admin)</p>
                      ) : (
                        <div className="space-y-1.5">
                          {Object.entries(RESOURCE_LABELS).map(([key, label]) => {
                            const p = user.permissions?.[key];
                            if (!p) return null;
                            const actions = [];
                            if (p.view) actions.push('Lihat');
                            if (p.create) actions.push('Tambah');
                            if (p.edit) actions.push('Ubah');
                            if (p.delete) actions.push('Hapus');
                            return (
                              <div key={key} className="flex items-center justify-between text-[12px]">
                                <span className="text-slate-600 font-medium">{label}</span>
                                <div className="flex gap-1">
                                  {actions.length === 4 ? (
                                    <span className="text-emerald-600 font-semibold">Semua</span>
                                  ) : (
                                    actions.map(a => (
                                      <span key={a} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">{a}</span>
                                    ))
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-[13px] text-slate-500">
                {new Date(user.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onManagePermissions(user)}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Atur Hak Akses"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(user)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="px-6 py-4 border-t border-slate-100 bg-white text-[13px] text-slate-500">
        Total pengguna: <span className="font-bold text-slate-700">{users.length}</span>
      </div>
    </div>
  );
};

export default UserList;
