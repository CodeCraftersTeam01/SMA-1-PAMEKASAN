import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../../../../components/Toast';

const AdminPengumuman = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  
  const showToast = (message, type = 'info') => setToast({ message, type });
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'custom',
    is_active: true
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

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/admin/announcements`, { headers: getHeaders() });
      setAnnouncements(res.data.data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenAdd = () => {
    setCurrentAnnouncement(null);
    setFormData({ title: '', content: '', type: 'custom', is_active: true });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setCurrentAnnouncement(item);
    setFormData({
      title: item.title,
      content: item.content || '',
      type: item.type,
      is_active: item.is_active
    });
    setShowModal(true);
  };

  const confirmDelete = (item) => {
    setAnnouncementToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/announcements/${announcementToDelete.id}`, { headers: getHeaders() });
      showToast('Pengumuman berhasil dihapus.', 'success');
      setShowDeleteModal(false);
      setAnnouncementToDelete(null);
      fetchAnnouncements();
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
      if (currentAnnouncement) {
        await axios.put(`${API_BASE_URL}/api/admin/announcements/${currentAnnouncement.id}`, formData, { headers: getHeaders() });
        showToast('Pengumuman berhasil diupdate.', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/api/admin/announcements`, formData, { headers: getHeaders() });
        showToast('Pengumuman berhasil ditambahkan.', 'success');
      }
      setShowModal(false);
      fetchAnnouncements();
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1e293b]">Pengumuman Sekolah</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Kelola pengumuman kustom atau otomatis yang dihasilkan dari sistem pembuatan agenda.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg font-semibold flex items-center gap-2"
          >
            Tambah Pengumuman
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-fade-up p-6" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-[16px] font-bold text-[#1e293b] mb-6">Daftar Pengumuman</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2 w-12">No</th>
                <th className="pb-3">Isi Pengumuman</th>
                <th className="pb-3">Tipe</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2 w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin"></div>
                      <p className="text-sm font-medium">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : announcements.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <p className="font-semibold text-slate-500">Belum ada data pengumuman.</p>
                  </td>
                </tr>
              ) : (
                announcements.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 pl-2 text-slate-500">{index + 1}</td>
                    <td className="py-4">
                      <p className="font-bold text-[#1e293b]">{item.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-sm mt-1">{item.content}</p>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.type === 'agenda' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
                        {item.type === 'agenda' ? 'Otomatis (Agenda)' : 'Custom'}
                      </span>
                    </td>
                    <td className="py-4">
                      {item.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-slate-800 text-white border-slate-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-slate-50 text-slate-500 border-slate-100">
                          Tidak Aktif
                        </span>
                      )}
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
              <h3 className="text-xl font-bold text-slate-800">{currentAnnouncement ? 'Edit Pengumuman' : 'Tambah Pengumuman'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Pengumuman</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konten Pengumuman</label>
                <textarea rows="4" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all"></textarea>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipe</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all">
                    <option value="custom">Custom</option>
                    <option value="agenda">Otomatis (Agenda)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                  <select value={formData.is_active ? "1" : "0"} onChange={e => setFormData({...formData, is_active: e.target.value === "1"})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all">
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" disabled={isSaving} onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-slate-800 text-white font-medium hover:bg-slate-900 rounded-xl transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {isSaving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Menyimpan...</>
                  ) : 'Simpan Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && announcementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Pengumuman?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Anda yakin ingin menghapus pengumuman "{announcementToDelete.title}"? Tindakan ini tidak dapat dibatalkan.
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

export default AdminPengumuman;
