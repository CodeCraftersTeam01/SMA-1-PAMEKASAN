import React, { useState } from 'react';

const Pendaftar = () => {
  const [candidates, setCandidates] = useState([
    { id: 1, fullName: 'Budi Santoso', originSchool: 'SMPN 1 Pamekasan', registrationDate: '2026-03-10', status: 'Diterima' },
    { id: 2, fullName: 'Siti Aminah', originSchool: 'SMPN 2 Pamekasan', registrationDate: '2026-03-11', status: 'Menunggu' },
    { id: 3, fullName: 'Agus Riyadi', originSchool: 'SMPN 3 Pamekasan', registrationDate: '2026-03-12', status: 'Ditolak' },
    { id: 4, fullName: 'Rina Kusuma', originSchool: 'SMPN 1 Galis', registrationDate: '2026-03-13', status: 'Diterima' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  
  // Empty async functions for future backend integration
  const handleCreate = async (formData) => {
    // console.log("Creating candidate", formData);
    const newCandidate = { ...formData, id: Date.now(), registrationDate: new Date().toISOString().split('T')[0] };
    setCandidates([newCandidate, ...candidates]);
    setIsModalOpen(false);
  };

  const handleUpdate = async (id, formData) => {
    // console.log("Updating candidate", id, formData);
    setCandidates(candidates.map(c => c.id === id ? { ...c, ...formData } : c));
    setIsModalOpen(false);
    setCurrentCandidate(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      // console.log("Deleting candidate", id);
      setCandidates(candidates.filter(c => c.id !== id));
    }
  };

  const openModalForCreate = () => {
    setCurrentCandidate(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (candidate) => {
    setCurrentCandidate(candidate);
    setIsModalOpen(true);
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
      case 'Diterima': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
      case 'Ditolak': return 'bg-red-50 text-red-500 border-red-100';
      case 'Menunggu': return 'bg-amber-50 text-amber-500 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden animate-fade-up">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Data Pendaftar</h2>
            <p className="text-blue-100 text-sm max-w-xl">
              Kelola data calon siswa baru SMAN 1 Pamekasan.
            </p>
          </div>
          <button 
            onClick={openModalForCreate}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl transition-all shadow-sm font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Siswa
          </button>
        </div>
        <div className="absolute top-0 right-0 -m-8 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-32 -m-8 w-32 h-32 bg-indigo-900/20 rounded-full blur-xl"></div>
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">ID</th>
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
                  <td className="py-4 pl-2 font-medium text-slate-400">#{item.id}</td>
                  <td className="py-4 font-bold text-slate-700">{item.fullName}</td>
                  <td className="py-4">{item.originSchool}</td>
                  <td className="py-4 text-slate-500">{item.registrationDate}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                      {item.status}
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
        </div>
      </div>

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
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="fullName"
                  defaultValue={currentCandidate?.fullName || ''}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Asal Sekolah</label>
                <input 
                  type="text" 
                  name="originSchool"
                  defaultValue={currentCandidate?.originSchool || ''}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
                  placeholder="Contoh: SMPN 1 Pamekasan"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select 
                  name="status"
                  defaultValue={currentCandidate?.status || 'Menunggu'}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white"
                >
                  <option value="Menunggu">Menunggu</option>
                  <option value="Diterima">Diterima</option>
                  <option value="Ditolak">Ditolak</option>
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
