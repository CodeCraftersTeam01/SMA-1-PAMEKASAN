import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

// ─── Toast Notification ──────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white shadow-2xl shadow-slate-900/20 animate-fade-up ${colors[type] || colors.info}`}>
      {type === 'success' && (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {type === 'error' && (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {type === 'warning' && (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Ya, Hapus', confirmClass = 'bg-red-600 hover:bg-red-700 text-white' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-fade-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
            Batal
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const TahunAjaran = () => {
  const { can } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentItem, setCurrentItem] = useState(null);
  const [formTahun, setFormTahun] = useState('');
  const [formIsActive, setFormIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Confirm delete dialog
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, tahun: '' });

  // Bulk actions
  const [selectedItems, setSelectedItems] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const showToast = (message, type = 'info') => setToast({ message, type });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tahun-ajaran`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        const list = Array.isArray(json) ? json : json.data || [];
        // Sort: newest first (by tahun string desc)
        list.sort((a, b) => b.tahun.localeCompare(a.tahun));
        setData(list);
      } else if (res.status === 404) {
        setData([]);
      } else {
        setError(json.message || 'Gagal mengambil data');
      }
    } catch {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const activeCount = data.filter(d => d.is_active).length;

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!formTahun.trim()) { showToast('Tahun ajaran tidak boleh kosong', 'error'); return; }

    setIsSaving(true);
    try {
      // If want to activate, backend will handle deactivating others.
      const payload = { tahun: formTahun.trim(), is_active: formIsActive };
      const res = await fetch(`${API_BASE_URL}/api/tahun-ajaran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) {
        showToast('Tahun ajaran berhasil ditambahkan!', 'success');
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast(json.message || 'Gagal menyimpan data', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!formTahun.trim()) { showToast('Tahun ajaran tidak boleh kosong', 'error'); return; }

    setIsSaving(true);
    try {
      const payload = { tahun: formTahun.trim(), is_active: formIsActive };
      const res = await fetch(`${API_BASE_URL}/api/tahun-ajaran/${currentItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) {
        showToast('Tahun ajaran berhasil diperbarui!', 'success');
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast(json.message || 'Gagal memperbarui data', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Toggle Active (quick-toggle from table) ───────────────────────────────
  const handleToggleActive = async (item) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tahun-ajaran/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tahun: item.tahun, is_active: !item.is_active }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast(item.is_active ? 'Dinonaktifkan' : 'Diaktifkan', 'success');
        fetchData();
      } else {
        showToast(json.message || 'Gagal mengubah status', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tahun-ajaran/${confirmDelete.id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Tahun ajaran berhasil dihapus!', 'success');
        setSelectedItems(prev => prev.filter(id => id !== confirmDelete.id));
        fetchData();
      } else {
        const json = await res.json();
        showToast(json.message || 'Gagal menghapus data', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setConfirmDelete({ open: false, id: null, tahun: '' });
    }
  };

  // ── Bulk Delete ───────────────────────────────────────────────────────────
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(data.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus ${selectedItems.length} data terpilih?`)) return;
    setIsBulkDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tahun-ajaran/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedItems }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast(json.message || `${selectedItems.length} data berhasil dihapus`, 'success');
        setSelectedItems([]);
        fetchData();
      } else {
        showToast(json.message || 'Gagal menghapus data', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setModalMode('create');
    setCurrentItem(null);
    setFormTahun('');
    setFormIsActive(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setCurrentItem(item);
    setFormTahun(item.tahun);
    setFormIsActive(!!item.is_active);
    setIsModalOpen(true);
  };

  const handleTahunChange = (val) => {
    // Allow only digits and slash
    const cleaned = val.replace(/[^0-9/]/g, '');
    
    // If exactly 4 digits are typed, auto-generate the YYYY/YYYY format
    if (/^\d{4}$/.test(cleaned)) {
      const year = parseInt(cleaned, 10);
      setFormTahun(`${year}/${year + 1}`);
    } else {
      if (cleaned.length <= 9) {
        setFormTahun(cleaned);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'create') handleCreate();
    else handleUpdate();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header Banner ── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-[#1e293b]">Tahun Ajaran</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Kelola tahun ajaran aktif. Hanya <strong>1 tahun ajaran</strong> yang dapat aktif secara bersamaan.
            </p>
          </div>
          {can('tahun_ajaran', 'create') && (
            <button
              onClick={openCreateModal}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 font-semibold flex items-center gap-2 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Tahun Ajaran
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
        {/* Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-slate-800">{data.length}</p>
          </div>
        </div>

        {/* Aktif */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aktif</p>
            <p className="text-2xl font-bold text-slate-800">{activeCount}</p>
          </div>
        </div>

        {/* Nonaktif */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nonaktif</p>
            <p className="text-2xl font-bold text-slate-600">{data.length - activeCount}</p>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[16px] font-bold text-[#1e293b]">Daftar Tahun Ajaran</h3>
            {selectedItems.length > 0 && can('tahun_ajaran', 'delete') && (
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                {isBulkDeleting ? 'Menghapus...' : `Hapus (${selectedItems.length})`}
              </button>
            )}
          </div>
          <span className="text-xs text-slate-400">{data.length} data</span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin" />
            <p className="text-sm font-medium">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">
            <p>{error}</p>
            <button onClick={fetchData} className="mt-2 text-blue-500 underline text-sm">Coba lagi</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-4 w-10">
                    <input type="checkbox" className="rounded border-slate-300 text-slate-800 focus:ring-slate-800" checked={data.length > 0 && selectedItems.length === data.length} onChange={handleSelectAll} />
                  </th>
                  <th className="pb-3 pl-2">#</th>
                  <th className="pb-3">Tahun Ajaran</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Dibuat</th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-600">
                {data.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 pl-4 w-10">
                      <input type="checkbox" className="rounded border-slate-300 text-slate-800 focus:ring-slate-800" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} />
                    </td>
                    <td className="py-4 pl-2 text-slate-400 font-medium">{index + 1}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-slate-800' : 'bg-slate-200'}`} />
                        <span className="font-bold text-slate-700">{item.tahun}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      {/* Toggle switch */}
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${item.is_active ? 'bg-slate-800' : 'bg-slate-200'}`}
                        title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${item.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className={`ml-2 text-xs font-semibold ${item.is_active ? 'text-slate-800' : 'text-slate-400'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 text-xs">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {can('tahun_ajaran', 'edit') && (
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                        {can('tahun_ajaran', 'delete') && (
                          <button
                            onClick={() => setConfirmDelete({ open: true, id: item.id, tahun: item.tahun })}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <svg className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-medium">Belum ada data tahun ajaran</p>
                        <button onClick={openCreateModal} className="text-xs text-slate-600 hover:underline font-semibold">
                          + Tambah sekarang
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Form Modal (Create / Edit) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {modalMode === 'create' ? 'Tambah Tahun Ajaran' : 'Edit Tahun Ajaran'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {modalMode === 'create' ? 'Isi form di bawah untuk menambah tahun ajaran baru' : `Mengubah data: ${currentItem?.tahun}`}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Tahun field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tahun Ajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTahun}
                  onChange={e => handleTahunChange(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-slate-700 text-sm"
                  placeholder="Contoh: 2024/2025"
                />
                <p className="text-[11px] text-slate-400 mt-1">Format: YYYY/YYYY, misal 2024/2025</p>
              </div>

              {/* Is Active toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Status Aktif</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Aktifkan tahun ajaran ini (akan menonaktifkan yang lain)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(v => !v)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none ${formIsActive ? 'bg-slate-800' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${formIsActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Simpan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Dialog ── */}
      <ConfirmDialog
        isOpen={confirmDelete.open}
        title="Hapus Tahun Ajaran"
        message={`Apakah Anda yakin ingin menghapus tahun ajaran "${confirmDelete.tahun}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null, tahun: '' })}
      />

      {/* ── Toast ── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default TahunAjaran;
