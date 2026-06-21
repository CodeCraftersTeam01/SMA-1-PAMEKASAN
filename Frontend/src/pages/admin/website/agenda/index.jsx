import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../../../../components/Toast';

const AdminAgenda = () => {
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentAgenda, setCurrentAgenda] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agendaToDelete, setAgendaToDelete] = useState(null);
  
  const showToast = (message, type = 'info') => setToast({ message, type });

  const [selectedItems, setSelectedItems] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    type: 'kegiatan'
  });

  const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '';
  const API_BASE_URL = rawApiUrl.replace(/\/$/, '');

  const getHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  };

  const fetchAgendas = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/admin/agendas`, { headers: getHeaders() });
      setAgendas(res.data.data || []);
    } catch (error) {
      console.error('Error fetching agendas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendas();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(agendas.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus ${selectedItems.length} agenda terpilih?`)) return;
    setIsBulkDeleting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/agendas/bulk-delete`, { ids: selectedItems }, { headers: getHeaders() });
      if (response.status === 200 || response.status === 201) {
        setSelectedItems([]);
        fetchAgendas();
        showToast(`${selectedItems.length} agenda berhasil dihapus`, 'success');
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

  const handleOpenAdd = () => {
    setCurrentAgenda(null);
    setFormData({ title: '', description: '', event_date: '', type: 'kegiatan' });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setCurrentAgenda(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      event_date: item.event_date.substring(0, 10),
      type: item.type
    });
    setShowModal(true);
  };

  const confirmDelete = (item) => {
    setAgendaToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!agendaToDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/agendas/${agendaToDelete.id}`, { headers: getHeaders() });
      showToast('Agenda berhasil dihapus.', 'success');
      setShowDeleteModal(false);
      setAgendaToDelete(null);
      fetchAgendas();
    } catch (error) {
      showToast('Gagal menghapus data.', 'error');
      setShowDeleteModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (currentAgenda) {
        await axios.put(`${API_BASE_URL}/api/admin/agendas/${currentAgenda.id}`, formData, { headers: getHeaders() });
        showToast('Agenda berhasil diupdate.', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/api/admin/agendas`, formData, { headers: getHeaders() });
        showToast('Agenda berhasil ditambahkan. Pengumuman baru telah dibuat.', 'success');
      }
      setShowModal(false);
      fetchAgendas();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan data.', 'error');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1e293b]">Manajemen Agenda Sekolah</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Kelola daftar agenda atau kalender akademik sekolah. Data baru otomatis memicu pembuatan pengumuman.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg font-semibold flex items-center gap-2"
          >
            Tambah Agenda
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-fade-up p-6" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-4">
            <h3 className="text-[16px] font-bold text-[#1e293b] shrink-0">Daftar Agenda</h3>
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
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300" checked={agendas.length > 0 && selectedItems.length === agendas.length} onChange={handleSelectAll} />
                </th>
                <th className="pb-3 pl-2 w-12">No</th>
                <th className="pb-3">Nama Agenda</th>
                <th className="pb-3">Tanggal</th>
                <th className="pb-3">Tipe</th>
                <th className="pb-3 text-right pr-2 w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin"></div>
                      <p className="text-sm font-medium">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : agendas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <p className="font-semibold text-slate-500">Belum ada data agenda.</p>
                  </td>
                </tr>
              ) : (
                agendas.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 pl-4 w-10">
                      <input type="checkbox" className="rounded border-slate-300" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} />
                    </td>
                    <td className="py-4 pl-2 text-slate-500">{index + 1}</td>
                    <td className="py-4">
                      <p className="font-bold text-[#1e293b]">{item.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-xs mt-1">{item.description}</p>
                    </td>
                    <td className="py-4 font-medium text-slate-700">{item.event_date.substring(0, 10)}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => confirmDelete(item)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Hapus">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">{currentAgenda ? 'Edit Agenda' : 'Tambah Agenda'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Agenda</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal</label>
                <input required type="date" value={formData.event_date} onChange={e => setFormData({...formData, event_date: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipe</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all">
                  <option value="kegiatan">Kegiatan</option>
                  <option value="libur">Libur</option>
                  <option value="ujian">Ujian</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all"></textarea>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" disabled={isSaving} onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-slate-800 text-white font-medium hover:bg-slate-900 rounded-xl transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {isSaving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Menyimpan...</>
                  ) : 'Simpan Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && agendaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Agenda?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Anda yakin ingin menghapus agenda "{agendaToDelete.title}"? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors w-full">Batal</button>
              <button onClick={handleDelete} className="px-5 py-2.5 bg-red-600 text-white font-medium hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-600/20 w-full">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgenda;
