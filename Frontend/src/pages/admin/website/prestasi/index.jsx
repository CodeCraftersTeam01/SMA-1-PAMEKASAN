import React, { useState, useEffect } from 'react';

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
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      )}
      {type === 'error' && (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      )}
      {type === 'warning' && (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Ya, Hapus', confirmClass = 'bg-red-600 hover:bg-red-700 text-white' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-up">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-fade-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md ${confirmClass}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default function AdminPrestasi() {
  const [prestasi, setPrestasi] = useState([]);
  const [siswas, setSiswas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    year: new Date().getFullYear(),
    siswa_ids: [''],
    student_name: '',
    status: 'approved',
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, type: null, id: null });
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (message, type = 'info') => setToast({ message, type });

  const fetchPrestasi = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/achievements`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        setPrestasi(await response.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSiswas = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/siswa`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const siswaList = Array.isArray(data) ? data : (data.data || []);
        setSiswas(siswaList);
      }
    } catch (error) {
      console.error("Failed to fetch siswas", error);
    }
  };

  useEffect(() => {
    fetchPrestasi();
    fetchSiswas();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(prestasi.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/achievements/bulk-delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedItems })
      });
      if (response.ok) {
        setSelectedItems([]);
        fetchPrestasi();
        showToast(`${selectedItems.length} data berhasil dihapus`, 'success');
      } else {
        showToast("Gagal menghapus data terpilih.", 'error');
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan koneksi.", 'error');
    } finally {
      setIsBulkDeleting(false);
      setConfirmDelete({ open: false, type: null, id: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = formData.id !== null;
    const url = isEditing 
      ? `${import.meta.env.VITE_API_BASE_URL}/api/admin/achievements/${formData.id}`
      : `${import.meta.env.VITE_API_BASE_URL}/api/admin/achievements`;
      
    // Filter out empty siswa_ids
    const payload = {
      ...formData,
      siswa_ids: formData.siswa_ids.filter(id => id !== '')
    };

    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setIsModalOpen(false);
        fetchPrestasi();
        showToast(isEditing ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan', 'success');
      } else {
        showToast('Gagal menyimpan data', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Terjadi kesalahan koneksi', 'error');
    }
  };

  const handleEdit = (item) => {
    setFormData({ 
      ...item, 
      siswa_ids: item.siswas && item.siswas.length > 0 ? item.siswas.map(s => s.id) : [''],
      status: item.status || 'approved'
    });
    setIsModalOpen(true);
  };

  const handleAddSiswa = () => {
    setFormData({ ...formData, siswa_ids: [...formData.siswa_ids, ''] });
  };

  const handleRemoveSiswa = (index) => {
    const newSiswas = formData.siswa_ids.filter((_, i) => i !== index);
    if (newSiswas.length === 0) newSiswas.push('');
    setFormData({ ...formData, siswa_ids: newSiswas });
  };

  const handleSiswaChange = (index, value) => {
    const newSiswas = [...formData.siswa_ids];
    newSiswas[index] = value;
    setFormData({ ...formData, siswa_ids: newSiswas, student_name: '' });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/achievements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
      });
      if (response.ok) {
        showToast('Data berhasil dihapus', 'success');
        fetchPrestasi();
      } else {
        showToast('Gagal menghapus data', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setConfirmDelete({ open: false, type: null, id: null });
    }
  };

  const handleToggleStatus = async (item) => {
    if (updatingStatusId) return; // Prevent multiple clicks
    setUpdatingStatusId(item.id);
    const newStatus = item.status === 'approved' ? 'pending' : 'approved';
    const payload = { status: newStatus };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/achievements/${item.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        fetchPrestasi();
        showToast('Status berhasil diperbarui', 'success');
      } else {
        const errorText = await response.text();
        showToast(`Gagal memperbarui status. Detail: ${errorText}`, 'error');
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan koneksi.", 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1e293b]">Manajemen Prestasi</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Kelola data prestasi siswa yang akan ditampilkan di landing page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => {
              setFormData({ id: null, title: '', description: '', year: new Date().getFullYear(), level: 'Tingkat Nasional', siswa_ids: [''], student_name: '', status: 'approved' });
              setIsModalOpen(true);
            }} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 font-semibold flex items-center gap-2 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tambah Prestasi
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up delay-100">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-4">
            <h3 className="text-[16px] font-bold text-[#1e293b] shrink-0">Daftar Prestasi</h3>
            {selectedItems.length > 0 && (
              <button
                onClick={() => setConfirmDelete({ open: true, type: 'bulk' })}
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
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Memuat data...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300" checked={prestasi.length > 0 && selectedItems.length === prestasi.length} onChange={handleSelectAll} />
                </th>
                <th className="pb-3 pl-2">Tahun</th>
                <th className="pb-3">Siswa / Tim</th>
                <th className="pb-3">Judul Prestasi</th>
                <th className="pb-3">Tingkat</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-slate-600">
              {prestasi.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 pl-4 w-10">
                    <input type="checkbox" className="rounded border-slate-300" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} />
                  </td>
                  <td className="py-4 pl-2 font-bold text-slate-800">{item.year}</td>
                  <td className="py-4">
                    {item.siswas && item.siswas.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {item.siswas.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="font-semibold text-blue-700">{s.nama_lengkap}</span>
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">{s.kelas}</span>
                          </div>
                        ))}
                      </div>
                    ) : item.student_name ? (
                      <span className="font-semibold text-slate-700">{item.student_name}</span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Umum</span>
                    )}
                  </td>
                  <td className="py-4 max-w-xs">
                    <p className="font-bold text-slate-800 line-clamp-1">{item.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                  </td>
                  <td className="py-4"><span className="px-2 py-1 rounded-md text-[10px] font-bold border bg-slate-50 text-slate-600 border-slate-200">{item.level}</span></td>
                  <td className="py-4">
                    {item.status === 'pending' ? (
                      <span className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold rounded-md">Menunggu</span>
                    ) : (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold rounded-md">Disetujui</span>
                    )}
                  </td>
                  <td className="py-4 text-right pr-2">
                    <div className="flex items-center justify-end gap-1">
                      {item.status === 'pending' && (
                        <button onClick={() => handleToggleStatus(item)} disabled={updatingStatusId === item.id} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50" title="Setujui">
                          {updatingStatusId === item.id ? (
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          )}
                        </button>
                      )}
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => setConfirmDelete({ open: true, type: 'single', id: item.id })} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {prestasi.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <p className="font-semibold text-slate-500">Belum ada data prestasi</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {formData.id ? 'Edit Prestasi' : 'Tambah Prestasi Baru'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Isi form di bawah untuk mengelola data prestasi</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Judul Prestasi</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" required placeholder="Contoh: Juara 1 Lomba Cerdas Cermat" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tingkat</label>
                  <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full border p-3 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 transition-all">
                    <option value="Tingkat Sekolah">Tingkat Sekolah</option>
                    <option value="Tingkat Kabupaten">Tingkat Kabupaten</option>
                    <option value="Tingkat Provinsi">Tingkat Provinsi</option>
                    <option value="Tingkat Nasional">Tingkat Nasional</option>
                    <option value="Tingkat Internasional">Tingkat Internasional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tahun</label>
                  <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" required min="2000" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status Publikasi</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border p-3 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 transition-all">
                    <option value="pending">Menunggu Verifikasi</option>
                    <option value="approved">Disetujui / Tampil</option>
                    <option value="rejected">Ditolak / Sembunyikan</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-2">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-bold text-slate-800">Siswa (Opsional jika manual)</label>
                  <button type="button" onClick={handleAddSiswa} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    + Tambah Siswa / Anggota
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.siswa_ids.map((siswaId, index) => (
                    <div key={index} className="flex gap-3 bg-white p-3 rounded-xl border border-slate-200 items-center shadow-sm">
                      <select 
                        value={siswaId || ''} 
                        onChange={e => handleSiswaChange(index, e.target.value)} 
                        className="flex-grow border-0 focus:ring-0 text-sm bg-transparent"
                      >
                        <option value="">-- Pilih Siswa --</option>
                        {siswas.map(s => (
                          <option key={s.id} value={s.id}>{s.nama_lengkap} ({s.kelas})</option>
                        ))}
                      </select>
                      {formData.siswa_ids.length > 1 && (
                        <button type="button" onClick={() => handleRemoveSiswa(index)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-slate-200 mt-4">
                  <label className="block text-sm font-medium mb-2 text-slate-700">Atau Nama Manual / Tim Luar (Jika tidak ada di database)</label>
                  <input type="text" value={formData.student_name || ''} onChange={e => setFormData({...formData, student_name: e.target.value, siswa_ids: ['']})} disabled={formData.siswa_ids.some(id => id !== '')} className="w-full border p-3 rounded-lg disabled:bg-slate-100 disabled:text-slate-400 text-sm focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Contoh: Tim Basket Putra / John Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi Singkat</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" rows="3" required placeholder="Ceritakan singkat mengenai prestasi ini..."></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl font-medium transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 transition-all">Simpan Prestasi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <ConfirmDialog
        isOpen={confirmDelete.open}
        title="Hapus Prestasi"
        message={confirmDelete.type === 'bulk' ? `Apakah Anda yakin ingin menghapus ${selectedItems.length} data terpilih?` : 'Apakah Anda yakin ingin menghapus prestasi ini? Tindakan ini tidak dapat dibatalkan.'}
        onConfirm={() => confirmDelete.type === 'bulk' ? handleBulkDelete() : handleDelete(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ open: false, type: null, id: null })}
      />
    </div>
  );
}
