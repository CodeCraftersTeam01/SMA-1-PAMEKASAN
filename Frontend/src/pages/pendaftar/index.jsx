import React, { useState, useEffect } from 'react';

const Pendaftar = () => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/pendaftaran`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Handle both possible structures (direct array or wrapper)
        setCandidates(Array.isArray(data) ? data : (data.data || []));
      } else {
        if (response.status === 404) {
             setCandidates([]);
        } else {
          setError(data.message || 'Gagal mengambil data');
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);
  
  // API integration functions
  const handleCreate = async (formData) => {
    setIsLoading(true);
    // Generate a no_pendaftaran (e.g. REG-YYYYMMDD-Random)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const no_pendaftaran = `REG-${dateStr}-${randomStr}`;

    const dataToSend = {
      ...formData,
      no_pendaftaran,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/pendaftaran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });
      const data = await response.json();
      
      if (response.ok) {
        setIsModalOpen(false);
        fetchCandidates();
      } else {
        alert(data.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat menyimpan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id, formData) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/pendaftaran/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (response.ok) {
        setIsModalOpen(false);
        setCurrentCandidate(null);
        fetchCandidates();
      } else {
        alert(data.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat menyimpan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/pendaftaran/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          fetchCandidates();
        } else {
          alert('Gagal menghapus data');
        }
      } catch (err) {
        alert('Terjadi kesalahan koneksi');
      }
    }
  };

  const handleOpenSelectionModal = () => {
    setIsSelectionModalOpen(true);
  };

  const openModalForCreate = () => {
    setIsSelectionModalOpen(false);
    setCurrentCandidate(null);
    setIsModalOpen(true);
  };

  const openImportModal = () => {
    setIsSelectionModalOpen(false);
    setIsImportModalOpen(true);
  };

  const handleDownloadTemplate = () => {
    const csvHeader = "nisn,nama_lengkap,asal_sekolah,alamat\n";
    const blob = new Blob([csvHeader], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_pendaftar.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openModalForEdit = (candidate) => {
    setCurrentCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/pendaftaran/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      const data = await response.json();
      
      if (response.ok) {
        setIsImportModalOpen(false);
        fetchCandidates();
      } else {
        alert(data.message || 'Gagal mengimport data');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat import');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    if (currentCandidate) {
      handleUpdate(currentCandidate.id, data);
    } else {
      handleCreate(data);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'diterima': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
      case 'ditolak': return 'bg-red-50 text-red-500 border-red-100';
      case 'pending': return 'bg-amber-50 text-amber-500 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'diterima': return 'Diterima';
      case 'ditolak': return 'Ditolak';
      case 'pending': return 'Menunggu';
      default: return 'Menunggu';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1e293b]">Data Pendaftar</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Kelola data calon siswa baru SMAN 1 Pamekasan.
            </p>
          </div>
          <button 
            onClick={handleOpenSelectionModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up delay-75">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[16px] font-bold text-[#1e293b]">Daftar Calon Siswa</h3>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cari nama..." 
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Memuat data...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-500">
               <p>{error}</p>
               <button onClick={fetchCandidates} className="mt-2 text-blue-500 underline text-sm">Coba lagi</button>
            </div>
          ) : (
            <table className="w-full text-left responsive border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">No. Pendaftaran</th>
                  <th className="pb-3">NISN</th>
                  <th className="pb-3">Nama Lengkap</th>
                  <th className="pb-3">Asal Sekolah</th>
                  <th className="pb-3">Tanggal Daftar</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-600">
                {candidates.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-2 font-medium text-slate-400">{item.no_pendaftaran || '-'}</td>
                    <td className="py-4 text-slate-600">{item.nisn || '-'}</td>
                    <td className="py-4 font-bold text-slate-700">{item.nama_lengkap}</td>
                    <td className="py-4">{item.asal_sekolah}</td>
                    <td className="py-4 text-slate-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status || 'pending')}`}>
                        {getStatusText(item.status || 'pending')}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModalForEdit(item)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                {candidates.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      Tidak ada data pendaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Selection Modal */}
      {isSelectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Pilih Metode Input</h3>
              <button 
                onClick={() => setIsSelectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Input Manual */}
              <button
                onClick={openModalForCreate}
                className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-1">Input Manual</h4>
                <p className="text-sm text-slate-500 text-center">Isi form pendaftaran satu per satu secara manual</p>
              </button>

              {/* Card 2: Import Excel */}
              <button
                onClick={openImportModal}
                className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
              >
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-1">Import Excel</h4>
                <p className="text-sm text-slate-500 text-center">Upload data massal menggunakan file CSV</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Import Data CSV</h3>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all relative">
                <input 
                  type="file" 
                  name="file" 
                  accept=".csv" 
                  required 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
                />
                <div className="pointer-events-none">
                  <svg className="w-10 h-10 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm font-medium text-slate-700 mb-1">Klik atau drag file ke sini</p>
                  <p className="text-xs text-slate-500">Mendukung file .csv</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button type="button" onClick={handleDownloadTemplate} className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Template
                </button>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Mengupload...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>Upload & Import</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                {currentCandidate ? 'Edit Data Pendaftar' : 'Tambah Pendaftar Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">NISN</label>
                <input 
                  type="text" 
                  name="nisn"
                  defaultValue={currentCandidate?.nisn || ''}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
                  placeholder="Masukkan NISN"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="nama_lengkap"
                  defaultValue={currentCandidate?.nama_lengkap || ''}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Asal Sekolah</label>
                <input 
                  type="text" 
                  name="asal_sekolah"
                  defaultValue={currentCandidate?.asal_sekolah || ''}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
                  placeholder="Contoh: SMPN 1 Pamekasan"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea 
                  name="alamat"
                  defaultValue={currentCandidate?.alamat || ''}
                  required
                  rows="3"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 resize-none"
                  placeholder="Masukkan alamat lengkap"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 hidden">Status</label>
                <select hidden
                  name="status"
                  defaultValue={currentCandidate?.status || 'pending'}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white"
                >
                  <option value="pending">Menunggu</option>
                  <option value="diterima">Diterima</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Pendaftar;