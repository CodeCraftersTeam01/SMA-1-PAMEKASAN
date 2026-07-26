import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminTestimonial() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    role: 'alumni',
    message: '',
    status: 'pending',
    graduation_year: '',
    current_occupation: '',
    avatar_url: '',
    imageFile: null,
    rating: 5,
  });

  const fetchItems = async () => {
    setTimeout(() => {
      setIsLoading(true);
      setErrorMessage('');
      setSelectedItems([]);
    }, 0);
    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '';
    const API_BASE_URL = rawApiUrl.replace(/\/$/, '');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/testimonials`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      setErrorMessage(error.response?.data?.message || 'Gagal memuat data testimoni.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      id: null,
      name: '',
      role: 'alumni',
      message: '',
      status: 'pending',
      graduation_year: '',
      current_occupation: '',
      avatar_url: '',
      imageFile: null,
      rating: 5,
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      role: item.role,
      message: item.message,
      status: item.status,
      graduation_year: item.graduation_year || '',
      current_occupation: item.current_occupation || '',
      avatar_url: item.avatar_url || '',
      imageFile: null,
      rating: item.rating || 5,
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus testimoni ini?')) return;

    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '';
    const API_BASE_URL = rawApiUrl.replace(/\/$/, '');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/testimonials/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      fetchItems();
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      alert(error.response?.data?.message || 'Gagal menghapus data.');
    }
  };

  const handleToggleStatus = async (id) => {
    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '';
    const API_BASE_URL = rawApiUrl.replace(/\/$/, '');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      await axios.post(`${API_BASE_URL}/api/admin/testimonials/${id}/status`, { _method: 'PATCH' }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      fetchItems();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert(error.response?.data?.message || 'Gagal memperbarui status.');
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
    setIsSaving(true);
    setErrorMessage('');

    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '';
    const API_BASE_URL = rawApiUrl.replace(/\/$/, '');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const isEditing = formData.id !== null;
    const url = isEditing
      ? `${API_BASE_URL}/api/admin/testimonials/${formData.id}`
      : `${API_BASE_URL}/api/admin/testimonials`;

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('role', formData.role);
    payload.append('message', formData.message);
    payload.append('status', formData.status);
    payload.append('rating', formData.rating);
    if (formData.graduation_year) payload.append('graduation_year', formData.graduation_year);
    if (formData.current_occupation) payload.append('current_occupation', formData.current_occupation);

    if (formData.imageFile) {
      payload.append('image', formData.imageFile);
    }

    if (isEditing) {
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
        setIsModalOpen(false);
        fetchItems();
      }
    } catch (error) {
      console.error('Failed to save testimonial:', error);
      setErrorMessage(error.response?.data?.message || 'Gagal menyimpan data.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Hapus ${selectedItems.length} testimoni terpilih?`)) return;
    setIsBulkDeleting(true);

    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '';
    const API_BASE_URL = rawApiUrl.replace(/\/$/, '');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      await axios.post(`${API_BASE_URL}/api/admin/testimonials/bulk-delete`, { ids: selectedItems }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      fetchItems();
    } catch (error) {
      console.error('Failed to bulk delete testimonials:', error);
      alert(error.response?.data?.message || 'Gagal menghapus data terpilih.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1e293b]">Manajemen Testimoni</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Kelola daftar testimoni dari alumni, siswa, atau orangtua untuk ditampilkan pada landing page.
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
              Tambah Testimoni
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up delay-100">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-4">
            <h3 className="text-[16px] font-bold text-[#1e293b] shrink-0">Daftar Testimoni</h3>
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isBulkDeleting ? 'Menghapus...' : `Hapus (${selectedItems.length})`}
              </button>
            )}
          </div>
        </div>

        {errorMessage && !isModalOpen && (
          <div className="mb-4 p-3.5 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
            {errorMessage}
          </div>
        )}

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
                  <th className="pb-3 pl-4 w-10">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selectedItems.length === items.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500/20 cursor-pointer"
                    />
                  </th>
                  <th className="pb-3 pl-2 w-16">Foto</th>
                  <th className="pb-3">Identitas</th>
                  <th className="pb-3 w-1/3">Pesan</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-600">
                {items.map((item) => (
                  <tr key={item.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${selectedItems.includes(item.id) ? 'bg-slate-50/80' : ''}`}>
                    <td className="py-3 pl-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500/20 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 pl-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                        {item.avatar_url ? (
                          <img
                            src={import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') + item.avatar_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=eff6ff`;
                            }}
                          />
                        ) : (
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=eff6ff`} alt="Avatar" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="font-bold text-[#1e293b]">{item.name}</div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        {item.role} {item.graduation_year ? `'${item.graduation_year.toString().slice(-2)}` : ''}
                      </div>
                      <div className="flex text-amber-400 gap-0.5 mt-1 shrink-0">
                        {Array.from({ length: Number(item.rating) || 5 }).map((_, i) => (
                          <svg key={`active-${i}`} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                        {Array.from({ length: 5 - (Number(item.rating) || 5) }).map((_, i) => (
                          <svg key={`inactive-${i}`} className="w-3.5 h-3.5 text-slate-200" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-slate-500">
                      <div className="max-w-xs truncate" title={item.message}>
                        {item.message}
                      </div>
                    </td>
                    <td className="py-3">
                      <button 
                        onClick={() => handleToggleStatus(item.id)}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                          item.status === 'approved' 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                        title="Klik untuk mengubah status"
                      >
                        {item.status === 'approved' ? 'Approved' : 'Pending'}
                      </button>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex items-center justify-end gap-1">
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleToggleStatus(item.id)}
                            className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Setujui"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
                {items.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <p className="font-semibold text-slate-500">Belum ada data testimoni</p>
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
        <div className="fixed inset-0 z-50 flex p-4 bg-black/55 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md m-auto border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-[#1e293b]">
                {formData.id ? 'Edit Testimoni' : 'Tambah Testimoni'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Peran</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="alumni">Alumni</option>
                    <option value="siswa">Siswa</option>
                    <option value="orangtua">Orangtua</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Tahun Lulus</label>
                  <input
                    type="number"
                    value={formData.graduation_year}
                    onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Contoh: 2024 (Jika Alumni)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Pekerjaan/Kampus Saat Ini</label>
                <input
                  type="text"
                  value={formData.current_occupation}
                  onChange={(e) => setFormData({ ...formData, current_occupation: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Opsional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Pesan / Cerita</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Penilaian (Rating)</label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="text-amber-400 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                    >
                      <svg
                        className={`w-7 h-7 ${
                          star <= formData.rating 
                            ? 'fill-current text-amber-400' 
                            : 'text-slate-300 hover:text-amber-300'
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        fill={star <= formData.rating ? 'currentColor' : 'none'}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.564-.37-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Status Publikasi</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="pending">Pending (Sembunyikan)</option>
                  <option value="approved">Approved (Tampilkan)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Foto Profil (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-all cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
