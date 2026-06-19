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
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-fade-up">
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
            Batal
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md bg-red-600 hover:bg-red-700 text-white`}>
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const QuotesPage = () => {
  const { can } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentItem, setCurrentItem] = useState(null);
  const [formName, setFormName] = useState('');
  const [formQuote, setFormQuote] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, title: '' });

  const [selectedItems, setSelectedItems] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const showToast = (message, type = 'info') => setToast({ message, type });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/teacher-quotes`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setData(Array.isArray(json) ? json : json.data || []);
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
    if (!window.confirm(`Yakin ingin menghapus ${selectedItems.length} kutipan terpilih?`)) return;
    setIsBulkDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher-quotes/bulk-delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedItems })
      });
      if (response.ok) {
        setSelectedItems([]);
        fetchData();
        showToast(`${selectedItems.length} kutipan berhasil dihapus`, 'success');
      } else {
        showToast("Gagal menghapus data terpilih.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan koneksi.", "error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleCreate = async () => {
    if (!formName.trim() || !formQuote.trim()) { showToast('Semua field wajib diisi', 'error'); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/teacher-quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teacher_name: formName, quote: formQuote, is_active: formIsActive }),
      });
      if (res.ok) {
        showToast('Kata-kata berhasil ditambahkan!', 'success');
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast('Gagal menyimpan data', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!formName.trim() || !formQuote.trim()) { showToast('Semua field wajib diisi', 'error'); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/teacher-quotes/${currentItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teacher_name: formName, quote: formQuote, is_active: formIsActive }),
      });
      if (res.ok) {
        showToast('Kata-kata berhasil diperbarui!', 'success');
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast('Gagal memperbarui data', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/teacher-quotes/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teacher_name: item.teacher_name, quote: item.quote, is_active: !item.is_active }),
      });
      if (res.ok) {
        showToast(item.is_active ? 'Dinonaktifkan' : 'Diaktifkan', 'success');
        fetchData();
      } else {
        showToast('Gagal mengubah status', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/teacher-quotes/${confirmDelete.id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Data berhasil dihapus!', 'success');
        fetchData();
      } else {
        showToast('Gagal menghapus data', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setConfirmDelete({ open: false, id: null, title: '' });
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentItem(null);
    setFormName('');
    setFormQuote('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setCurrentItem(item);
    setFormName(item.teacher_name);
    setFormQuote(item.quote);
    setFormIsActive(!!item.is_active);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'create') handleCreate();
    else handleUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-[#1e293b]">Kata-kata Guru</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Kelola kutipan atau kata-kata motivasi yang akan ditampilkan secara acak di halaman depan.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition-all font-semibold flex items-center gap-2"
          >
            + Tambah Kutipan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">Memuat data...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
              <div className="flex items-center gap-4">
                <h3 className="text-[16px] font-bold text-[#1e293b] shrink-0">Daftar Kutipan</h3>
                {selectedItems.length > 0 && (
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
            </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="pb-3 pl-4 w-10">
                    <input type="checkbox" className="rounded border-slate-300" checked={data.length > 0 && selectedItems.length === data.length} onChange={handleSelectAll} />
                  </th>
                  <th className="pb-3 pl-2">Nama Guru</th>
                  <th className="pb-3">Kutipan</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-600">
                {data.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-4 pl-4 w-10">
                      <input type="checkbox" className="rounded border-slate-300" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} />
                    </td>
                    <td className="py-4 pl-2 font-bold text-slate-700">{item.teacher_name}</td>
                    <td className="py-4 max-w-md truncate">{item.quote}</td>
                    <td className="py-4">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.is_active ? 'bg-slate-800' : 'bg-slate-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">Edit</button>
                      <button onClick={() => setConfirmDelete({ open: true, id: item.id, title: item.teacher_name })} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg ml-2">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold">{modalMode === 'create' ? 'Tambah Kutipan' : 'Edit Kutipan'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Guru / Pemberi Kutipan</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200" placeholder="Contoh: Bpk. Budi Santoso" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Isi Kutipan</label>
                <textarea value={formQuote} onChange={e => setFormQuote(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 min-h-[100px]" placeholder="Masukkan kutipan..."></textarea>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={formIsActive} onChange={e => setFormIsActive(e.target.checked)} id="isActive" />
                <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">Tampilkan di Halaman Utama</label>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100">Batal</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={confirmDelete.open} title="Hapus Data" message={`Yakin menghapus kutipan dari ${confirmDelete.title}?`} onConfirm={handleDelete} onCancel={() => setConfirmDelete({ open: false, id: null, title: '' })} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default QuotesPage;
