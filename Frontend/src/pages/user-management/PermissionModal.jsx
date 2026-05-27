import React, { useState, useEffect } from 'react';

const RESOURCES = [
  { key: 'pendaftaran', label: 'Pendaftaran' },
  { key: 'siswa', label: 'Siswa' },
  { key: 'tahun_ajaran', label: 'Tahun Ajaran' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'alumni', label: 'Alumni' },
  { key: 'alumni_tracking', label: 'Penelusuran Alumni' },
  { key: 'kelas', label: 'Kelas' },
  { key: 'pengaturan', label: 'Pengaturan' },
];

const ACTIONS = [
  { key: 'create', label: 'C', title: 'Create / Tambah' },
  { key: 'view', label: 'R', title: 'Read / Lihat' },
  { key: 'edit', label: 'U', title: 'Update / Ubah' },
  { key: 'delete', label: 'D', title: 'Delete / Hapus' },
];

const defaultPermissions = () => {
  const perms = {};
  RESOURCES.forEach(r => {
    perms[r.key] = { view: true, create: false, edit: false, delete: false };
  });
  return perms;
};

const PermissionModal = ({ user, isOpen, onClose, onSave, API_BASE_URL, token }) => {
  const [permissions, setPermissions] = useState(defaultPermissions());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchPermissions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/${user.id}/permissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.data) {
          const merged = { ...defaultPermissions() };
          Object.keys(data.data).forEach(r => {
            if (merged[r]) {
              merged[r] = { ...merged[r], ...data.data[r] };
            }
          });
          setPermissions(merged);
        } else {
          setPermissions(defaultPermissions());
        }
      } catch {
        setPermissions(defaultPermissions());
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [isOpen, user, API_BASE_URL, token]);

  const handleToggle = (resource, action) => {
    setPermissions(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: !prev[resource][action],
      },
    }));
  };

  const handleSelectAll = (resource, checked) => {
    setPermissions(prev => {
      const updated = { ...prev[resource] };
      ACTIONS.forEach(a => { updated[a.key] = checked; });
      return { ...prev, [resource]: updated };
    });
  };

  const isAllSelected = (resource) => {
    return ACTIONS.every(a => permissions[resource]?.[a.key]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(user.id, permissions);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col animate-fade-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#1e293b]">Hak Akses Pengguna</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {user?.name} — {user?.email}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin" />
            </div>
          ) : isAdmin ? (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
              <svg className="w-10 h-10 text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="font-semibold text-blue-800">Akun Admin — Full Akses</p>
              <p className="text-sm text-blue-600 mt-1">Pengguna dengan role Admin memiliki akses penuh ke seluruh modul tanpa perlu dikonfigurasi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 pr-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modul</th>
                    {ACTIONS.map(a => (
                      <th key={a.key} className="py-3 px-2 text-center" title={a.title}>
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-xs font-extrabold text-slate-500">{a.label}</span>
                      </th>
                    ))}
                    <th className="py-3 pl-2 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {RESOURCES.map(r => {
                    const allChecked = isAllSelected(r.key);
                    return (
                      <tr key={r.key} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 pr-4 text-[13px] font-semibold text-slate-700">{r.label}</td>
                        {ACTIONS.map(a => (
                          <td key={a.key} className="py-3 px-2 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer p-1 hover:bg-slate-100 rounded-lg transition-colors">
                              <input
                                type="checkbox"
                                checked={permissions[r.key]?.[a.key] || false}
                                onChange={() => handleToggle(r.key, a.key)}
                                className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500/20 focus:ring-offset-0 cursor-pointer"
                              />
                            </label>
                          </td>
                        ))}
                        <td className="py-3 pl-2 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer p-1 hover:bg-slate-100 rounded-lg transition-colors">
                            <input
                              type="checkbox"
                              checked={allChecked}
                              onChange={(e) => handleSelectAll(r.key, e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500/20 focus:ring-offset-0 cursor-pointer"
                            />
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!isAdmin && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-slate-900/20 flex items-center gap-2"
            >
              {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Hak Akses'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionModal;
