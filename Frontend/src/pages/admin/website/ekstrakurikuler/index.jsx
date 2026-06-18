import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../../../../components/Toast';

export default function AdminExtracurricular() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    image_path: '',
    imageFile: null,
  });

  const showToast = (message, type = 'info') => setToast({ message, type });

  const fetchItems = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '';
    const API_BASE_URL = rawApiUrl.replace(/\/$/, '');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/extracurriculars`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch extracurriculars:', error);
      showToast(error.response?.data?.message || 'Gagal memuat data ekstrakurikuler.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      id: null,
      name: '',
      description: '',
      image_path: '',
      imageFile: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description,
      image_path: item.image_path || '',
      imageFile: null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus ekstrakurikuler ini?')) return;

    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '';
    const API_BASE_URL = rawApiUrl.replace(/\/$/, '');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/extracurriculars/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      showToast('Ekstrakurikuler berhasil dihapus.', 'success');
      fetchItems();
    } catch (error) {
      console.error('Failed to delete extracurricular:', error);
      showToast(error.response?.data?.message || 'Gagal menghapus data.', 'error');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        imageFile: e.target.files[0],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '';
    const API_BASE_URL = rawApiUrl.replace(/\/$/, '');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const isEditing = formData.id !== null;
    const url = isEditing
      ? `${API_BASE_URL}/api/admin/extracurriculars/${formData.id}`
      : `${API_BASE_URL}/api/admin/extracurriculars`;

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('description', formData.description);

    if (formData.imageFile) {
      payload.append('image', formData.imageFile);
    } else if (formData.image_path) {
      payload.append('image_path', formData.image_path);
    }

    if (isEditing) {
      // Spoofing PUT method for PHP/Lumen multipart form processing
      payload.append('_method', 'PUT');
    }

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.status === 200 || response.status === 201) {
        showToast(`Ekstrakurikuler berhasil ${isEditing ? 'diperbarui' : 'ditambahkan'}.`, 'success');
        setIsModalOpen(false);
        fetchItems();
      }
    } catch (error) {
      console.error('Failed to save extracurricular:', error);
      showToast(error.response?.data?.message || 'Gagal menyimpan data.', 'error');
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1e293b]">Manajemen Ekstrakurikuler</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Kelola daftar kegiatan ekstrakurikuler sekolah untuk ditampilkan pada landing page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 font-semibold flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Ekskul
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Main Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up delay-100">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <h3 className="text-[16px] font-bold text-[#1e293b] shrink-0">Daftar Ekstrakurikuler</h3>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin mb-3"></div>
              <p className="text-slate-500 text-sm font-medium">Memuat data...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-20">Foto</th>
                  <th className="pb-3">Nama Kegiatan</th>
                  <th className="pb-3">Deskripsi Singkat</th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-600">
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pl-2">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                        {item.image_path ? (
                          <img
                            src={item.image_path}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/100x100?text=Ekskul';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                            <i className="bi bi-image text-lg"></i>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 font-bold text-[#1e293b]">{item.name}</td>
                    <td className="py-3 text-slate-500 max-w-xs truncate">{item.description}</td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-16 text-center">
                      <p className="font-semibold text-slate-500">Belum ada data ekstrakurikuler</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-[#1e293b]">
                {formData.id ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Nama Kegiatan</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                  placeholder="Contoh: Pramuka, Futsal, Teater"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Deskripsi Lengkap</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  rows="4"
                  required
                  placeholder="Tulis deskripsi lengkap kegiatan ekstrakurikuler..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Foto / Gambar (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-all cursor-pointer"
                />
                {formData.image_path && !formData.imageFile && (
                  <p className="text-xs text-slate-400 mt-2 truncate">
                    File saat ini: <a href={formData.image_path} target="_blank" rel="noreferrer" className="text-blue-500 underline">{formData.image_path}</a>
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Ekstrakurikuler'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
