import React, { useState, useEffect } from 'react';

export default function AdminNavbar() {
  const [navbars, setNavbars] = useState([]);
  const [pages, setPages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    label: '',
    url: '',
    order: 0,
    is_active: true,
    parent_id: ''
  });
  const [urlType, setUrlType] = useState('page'); // 'page' or 'custom'

  const [selectedItems, setSelectedItems] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchNavbars = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/navbars`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        setNavbars(await response.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/pages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        setPages(await response.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNavbars();
    fetchPages();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(navbars.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus ${selectedItems.length} navigasi terpilih?`)) return;
    setIsBulkDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/navbars/bulk-delete`, {
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
        fetchNavbars();
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
    const apiUrl = isEditing 
      ? `${import.meta.env.VITE_API_BASE_URL}/api/admin/navbars/${formData.id}`
      : `${import.meta.env.VITE_API_BASE_URL}/api/admin/navbars`;
      
    const payload = {
      ...formData,
      parent_id: formData.parent_id === '' ? null : formData.parent_id,
      url: formData.url === '' ? null : formData.url,
    };

    try {
      const response = await fetch(apiUrl, {
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
        fetchNavbars();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Save error:", errorData);
        alert(`Gagal menyimpan navigasi. ${errorData.message || ''}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setUrlType(item.url?.startsWith('/p/') ? 'page' : 'custom');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus navigasi ini?")) {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/navbars/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
      });
      fetchNavbars();
    }
  };

  const handleOpenNew = () => {
    setFormData({ id: null, label: '', url: '', order: navbars.length + 1, is_active: true, parent_id: '' });
    setUrlType('page');
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1e293b]">Pengaturan Navbar</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Atur menu navigasi (navbar) yang tampil di website utama. Hubungkan menu ke Halaman Kustom.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleOpenNew} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 font-semibold flex items-center gap-2 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tambah Menu Navbar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up delay-100">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-4">
            <h3 className="text-[16px] font-bold text-[#1e293b] shrink-0">Daftar Menu Navigasi</h3>
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
                  <input type="checkbox" className="rounded border-slate-300" checked={navbars.length > 0 && selectedItems.length === navbars.length} onChange={handleSelectAll} />
                </th>
                <th className="pb-3 pl-2 w-16">Urutan</th>
                <th className="pb-3">Label Menu</th>
                <th className="pb-3">URL Target</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-slate-600">
              {navbars.filter(n => !n.parent_id).map(item => (
                <React.Fragment key={item.id}>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors bg-white">
                    <td className="py-4 pl-4 w-10">
                      <input type="checkbox" className="rounded border-slate-300" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} />
                    </td>
                    <td className="py-4 pl-2 font-medium"><span className="px-2 py-1 rounded-md text-[10px] font-bold border bg-slate-50 text-slate-600 border-slate-200">{item.order}</span></td>
                    <td className="py-4 font-bold text-slate-700">{item.label}</td>
                    <td className="py-4 text-blue-600">{item.url}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${item.is_active ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {item.is_active ? 'Ditampilkan' : 'Disembunyikan'}
                      </span>
                    </td>
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
                  {/* Render children */}
                  {navbars.filter(child => child.parent_id === item.id).map(child => (
                    <tr key={child.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors bg-slate-50/30">
                      <td className="py-3 pl-4 w-10">
                        <input type="checkbox" className="rounded border-slate-300" checked={selectedItems.includes(child.id)} onChange={() => handleSelectItem(child.id)} />
                      </td>
                      <td className="py-3 pl-8 font-medium"><span className="px-2 py-1 rounded-md text-[9px] font-bold border bg-white text-slate-500 border-slate-200">{child.order}</span></td>
                      <td className="py-3 text-slate-600 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        {child.label}
                      </td>
                      <td className="py-3 text-blue-500 text-xs">{child.url}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-bold border ${child.is_active ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                          {child.is_active ? 'Aktif' : 'Non-aktif'}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(child)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(child.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              {navbars.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <p className="font-semibold text-slate-500">Belum ada menu navigasi</p>
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
              <h2 className="text-xl font-bold">{formData.id ? 'Edit Menu' : 'Tambah Menu'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label Menu (Tampil di Navbar)</label>
                  <input type="text" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Induk Menu (Parent)</label>
                  <select value={formData.parent_id || ''} onChange={e => setFormData({...formData, parent_id: e.target.value || null})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">-- Menu Utama (Tidak ada) --</option>
                    {navbars.filter(n => !n.parent_id && n.id !== formData.id).map(n => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urutan Tampil</label>
                  <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Publikasi</label>
                  <select value={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="true">Ditampilkan</option>
                    <option value="false">Disembunyikan</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Tautan</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="urlType" checked={urlType === 'page'} onChange={() => { setUrlType('page'); setFormData({...formData, url: ''}); }} className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Halaman Kustom</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="urlType" checked={urlType === 'custom'} onChange={() => { setUrlType('custom'); setFormData({...formData, url: ''}); }} className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">URL Bebas</span>
                  </label>
                </div>
                
                {urlType === 'page' ? (
                  <select value={formData.url || ''} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">-- Pilih Halaman (Kosongkan jika hanya Parent) --</option>
                    {pages.map(page => (
                      <option key={page.id} value={`/p/${page.slug}`}>{page.title}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" value={formData.url || ''} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://... atau /pendaftaran (Kosongkan jika hanya Parent)" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Simpan Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
