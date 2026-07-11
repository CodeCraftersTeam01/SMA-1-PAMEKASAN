import React, { useState, useEffect } from 'react';

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    subject: '',
    jabatan: '',
    photoFile: null,
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/teachers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        setTeachers(await response.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(teachers.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus ${selectedItems.length} guru terpilih?`)) return;
    setIsBulkDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/teachers/bulk-delete`, {
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
        fetchTeachers();
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
      ? `${import.meta.env.VITE_API_BASE_URL}/api/admin/teachers/${formData.id}`
      : `${import.meta.env.VITE_API_BASE_URL}/api/admin/teachers`;
      
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('subject', formData.subject);
    payload.append('jabatan', formData.jabatan);
    if (formData.photoFile) {
      payload.append('photo', formData.photoFile);
    }
    
    // For PUT in Laravel/Lumen with file uploads, it's often easier to POST with _method=PUT
    if (isEditing) {
      payload.append('_method', 'PUT');
    }

    try {
      const response = await fetch(url, {
        method: 'POST', // Use POST even for edit, with _method=PUT in payload
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Accept': 'application/json'
        },
        body: payload
      });
      if (response.ok) {
        setIsModalOpen(false);
        fetchTeachers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setFormData({ 
      id: item.id, 
      name: item.name, 
      subject: item.subject || '', 
      jabatan: item.jabatan || '',
      photoFile: null 
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data guru ini?")) {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/teachers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
      });
      fetchTeachers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1e293b]">Data Guru</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Kelola daftar tenaga pendidik / guru untuk ditampilkan di landing page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setFormData({ id: null, name: '', subject: '', jabatan: '', photoFile: null }); setIsModalOpen(true); }} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 font-semibold flex items-center gap-2 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tambah Guru
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up delay-100">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-4">
            <h3 className="text-[16px] font-bold text-[#1e293b] shrink-0">Daftar Guru</h3>
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
                  <input type="checkbox" className="rounded border-slate-300" checked={teachers.length > 0 && selectedItems.length === teachers.length} onChange={handleSelectAll} />
                </th>
                <th className="pb-3 pl-2 w-16">Foto</th>
                <th className="pb-3">Nama Guru</th>
                <th className="pb-3">Jabatan</th>
                <th className="pb-3 text-center">Mata Pelajaran</th>
                <th className="pb-3 text-right pr-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-slate-600">
              {teachers.map(item => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 pl-4 w-10">
                    <input type="checkbox" className="rounded border-slate-300" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} />
                  </td>
                  <td className="py-4 pl-2 font-medium">
                    {item.photo ? (
                      <img src={`${import.meta.env.VITE_API_BASE_URL}/storage/${item.photo}`} alt={item.name} className="w-10 h-10 rounded-full object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">?</div>
                    )}
                  </td>
                  <td className="py-4 font-bold text-slate-700">{item.name}</td>
                  <td className="py-4 font-semibold text-slate-600">{item.jabatan || '-'}</td>
                  <td className="py-4 truncate max-w-xs text-slate-500 text-center">{item.subject || '-'}</td>
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
              {teachers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <p className="font-semibold text-slate-500">Belum ada data guru</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="text-xl font-bold">{formData.id ? 'Edit Guru' : 'Tambah Guru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap & Gelar</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded-lg" required placeholder="Contoh: Drs. Budi Santoso, M.Pd" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mata Pelajaran (Opsional)</label>
                <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="Contoh: Matematika" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jabatan / Posisi</label>
                <input type="text" value={formData.jabatan} onChange={e => setFormData({...formData, jabatan: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="Contoh: Kepala Sekolah / Guru Mata Pelajaran" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Foto Profile (Opsional)</label>
                <input type="file" accept="image/*" onChange={e => setFormData({...formData, photoFile: e.target.files[0]})} className="w-full border p-2 rounded-lg text-sm" />
                {formData.id && <p className="text-xs text-slate-500 mt-1">Kosongkan jika tidak ingin mengubah foto</p>}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
