import React, { useState, useEffect } from 'react';

export default function AdminPrestasi() {
  const [prestasi, setPrestasi] = useState([]);
  const [siswas, setSiswas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    year: new Date().getFullYear(),
    level: 'Tingkat Nasional',
    siswa_ids: [''],
    student_name: '',
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchPrestasi = async () => {
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
    if (!window.confirm(`Yakin ingin menghapus ${selectedItems.length} data terpilih?`)) return;
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
      } else {
        alert("Gagal menghapus data terpilih.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsBulkDeleting(false);
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
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setFormData({ 
      ...item, 
      siswa_ids: item.siswas && item.siswas.length > 0 ? item.siswas.map(s => s.id) : [''] 
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
    if (window.confirm("Hapus prestasi ini?")) {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/achievements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchPrestasi();
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
              setFormData({ id: null, title: '', description: '', year: new Date().getFullYear(), level: 'Tingkat Nasional', siswa_ids: [''], student_name: '' });
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
                  <input type="checkbox" className="rounded border-slate-300" checked={prestasi.length > 0 && selectedItems.length === prestasi.length} onChange={handleSelectAll} />
                </th>
                <th className="pb-3 pl-2">Tahun</th>
                <th className="pb-3">Siswa / Tim</th>
                <th className="pb-3">Judul Prestasi</th>
                <th className="pb-3">Tingkat</th>
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
                  <td className="py-4 text-right pr-2">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
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
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="text-xl font-bold">{formData.id ? 'Edit Prestasi' : 'Tambah Prestasi'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tahun</label>
                  <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full border p-2 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tingkat</label>
                  <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full border p-2 rounded-lg">
                    <option>Tingkat Internasional</option>
                    <option>Tingkat Nasional</option>
                    <option>Tingkat Provinsi</option>
                    <option>Tingkat Kabupaten</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Judul Prestasi</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border p-2 rounded-lg" required placeholder="Contoh: Juara 1 Olimpiade Matematika" />
              </div>
              
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-sm text-slate-800">Siswa / Tim (Dari Database)</h3>
                  <button type="button" onClick={handleAddSiswa} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-100 transition-colors">
                    + Tambah Anggota
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
                
                <div className="pt-4 border-t border-slate-200">
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
    </div>
  );
}
