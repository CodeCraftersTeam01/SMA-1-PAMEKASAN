import React, { useState, useEffect } from 'react';

export default function AdminPrograms() {
  const [programs, setPrograms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    image_path: '',
    image: null,
    features_json: [],
    order: 0,
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/programs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        setPrograms(await response.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(programs.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus ${selectedItems.length} program terpilih?`)) return;
    setIsBulkDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/programs/bulk-delete`, {
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
        fetchPrograms();
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
      ? `${import.meta.env.VITE_API_BASE_URL}/api/admin/programs/${formData.id}`
      : `${import.meta.env.VITE_API_BASE_URL}/api/admin/programs`;
      
    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('order', formData.order);
    payload.append('features_json', JSON.stringify(formData.features_json));
    
    if (formData.image) {
      payload.append('image', formData.image);
    }

    if (isEditing) {
      payload.append('_method', 'PUT');
    }
      
    try {
      const response = await fetch(url, {
        method: 'POST', // Use POST with _method=PUT in payload for FormData support
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Accept': 'application/json'
        },
        body: payload
      });
      if (response.ok) {
        setIsModalOpen(false);
        fetchPrograms();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setFormData({ 
      ...item, 
      image_path: item.image_path || '',
      image: null,
      features_json: Array.isArray(item.features_json) ? item.features_json : [] 
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus program ini?")) {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/programs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
      });
      fetchPrograms();
    }
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features_json: [...formData.features_json, { title: '', desc: '', icon: '' }]
    });
  };

  const removeFeature = (index) => {
    const newFeatures = [...formData.features_json];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features_json: newFeatures });
  };

  const updateFeature = (index, field, value) => {
    const newFeatures = [...formData.features_json];
    newFeatures[index][field] = value;
    setFormData({ ...formData, features_json: newFeatures });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1e293b]">Program Peminatan</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Kelola tab daftar program peminatan/penjurusan sekolah untuk ditampilkan di landing page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setFormData({ id: null, title: '', description: '', image_path: '', image: null, features_json: [], order: 0 }); setIsModalOpen(true); }} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 font-semibold flex items-center gap-2 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tambah Program
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up delay-100">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-4">
            <h3 className="text-[16px] font-bold text-[#1e293b] shrink-0">Daftar Program</h3>
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
                  <input type="checkbox" className="rounded border-slate-300" checked={programs.length > 0 && selectedItems.length === programs.length} onChange={handleSelectAll} />
                </th>
                <th className="pb-3 pl-2 w-16">Urutan</th>
                <th className="pb-3 w-20">Gambar</th>
                <th className="pb-3">Judul Program</th>
                <th className="pb-3">Deskripsi Utama</th>
                <th className="pb-3 text-right pr-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-slate-600">
              {programs.map(item => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 pl-4 w-10">
                    <input type="checkbox" className="rounded border-slate-300" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} />
                  </td>
                  <td className="py-4 pl-2 font-medium"><span className="px-2 py-1 rounded-md text-[10px] font-bold border bg-slate-50 text-slate-600 border-slate-200">{item.order}</span></td>
                  <td className="py-4">
                    {item.image_path ? (
                      <img src={item.image_path} alt={item.title} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                    ) : (
                      <span className="text-xs text-slate-400 italic">No image</span>
                    )}
                  </td>
                  <td className="py-4 font-bold text-slate-700">{item.title}</td>
                  <td className="py-4 truncate max-w-xs text-slate-500">{item.description}</td>
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
              {programs.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <p className="font-semibold text-slate-500">Belum ada data program</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="text-xl font-bold">{formData.id ? 'Edit Program' : 'Tambah Program'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Judul Program</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border p-2 rounded-lg" required placeholder="Contoh: MIPA, IPS, Bahasa" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deskripsi Utama</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded-lg" rows="3" required placeholder="Deskripsi mengenai program ini..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Urutan Tampil (Order)</label>
                  <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: e.target.value})} className="w-full border p-2 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Foto / Gambar Program (Opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFormData({...formData, image: e.target.files[0]})}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-all cursor-pointer"
                  />
                  {formData.image_path && !formData.image && (
                    <p className="text-xs text-slate-400 mt-2 truncate">
                      File saat ini: <a href={formData.image_path} target="_blank" rel="noreferrer" className="text-blue-500 underline">{formData.image_path}</a>
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm">Poin Keunggulan Spesifik Program (Opsional)</h3>
                  <button type="button" onClick={addFeature} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-100 transition-colors">+ Tambah Poin</button>
                </div>
                
                <div className="space-y-3">
                  {formData.features_json.map((feat, index) => (
                    <div key={index} className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 relative">
                      <div className="flex-1 space-y-2">
                        <input type="text" value={feat.title} onChange={(e) => updateFeature(index, 'title', e.target.value)} placeholder="Judul (Misal: Fasilitas Lab)" className="w-full border p-2 rounded text-sm" required />
                        <input type="text" value={feat.desc} onChange={(e) => updateFeature(index, 'desc', e.target.value)} placeholder="Deskripsi" className="w-full border p-2 rounded text-sm" required />
                        <input type="text" value={feat.icon} onChange={(e) => updateFeature(index, 'icon', e.target.value)} placeholder="Bootstrap Icon Class (opsional)" className="w-full border p-2 rounded text-sm" />
                      </div>
                      <button type="button" onClick={() => removeFeature(index)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg self-start">
                        ✕
                      </button>
                    </div>
                  ))}
                  {formData.features_json.length === 0 && (
                    <p className="text-sm text-slate-400 italic">Belum ada poin. Tambahkan poin jika perlu.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
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
