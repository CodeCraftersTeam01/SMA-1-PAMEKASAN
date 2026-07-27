import React, { useState, useEffect, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white shadow-2xl shadow-slate-900/20 animate-fade-up ${colors[type] || colors.info}`}>
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default function SetKelas() {
  const [activeTab, setActiveTab] = useState('siswa'); // 'siswa' or 'guru'
  
  const [siswaList, setSiswaList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Siswa State
  const [sourceClass, setSourceClass] = useState('');
  const [searchSource, setSearchSource] = useState('');
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [stagedMoves, setStagedMoves] = useState({});

  // Guru State
  const [sourceTeacherClass, setSourceTeacherClass] = useState('');
  const [searchTeacherSource, setSearchTeacherSource] = useState('');
  const [activeTeacherId, setActiveTeacherId] = useState(null);
  const [stagedTeacherMoves, setStagedTeacherMoves] = useState({});

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const showToast = (message, type = 'info') => setToast({ message, type });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resSiswa, resKelas, resTeacher] = await Promise.all([
        fetch(`${API_BASE_URL}/api/siswa`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/kelas`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/admin/teachers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (resSiswa.ok) {
        const dataSiswa = await resSiswa.json();
        setSiswaList(Array.isArray(dataSiswa) ? dataSiswa : (dataSiswa.data || []));
      }
      
      if (resKelas.ok) {
        const dataKelas = await resKelas.json();
        setKelasList(Array.isArray(dataKelas) ? dataKelas : (dataKelas.data || []));
      }

      if (resTeacher.ok) {
        const dataTeacher = await resTeacher.json();
        setTeacherList(Array.isArray(dataTeacher) ? dataTeacher : (dataTeacher.data || []));
      }
    } catch (e) {
      console.error(e);
      showToast('Gagal memuat data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Panel Kiri Siswa
  const sourceStudents = useMemo(() => {
    if (!sourceClass) return [];
    let filtered;
    if (sourceClass === '_NEW_STUDENTS_') {
      filtered = siswaList.filter(s => (!s.kelas || s.kelas === '') && s.is_active && !stagedMoves[s.id]);
    } else {
      filtered = siswaList.filter(s => s.kelas === sourceClass && s.is_active && !stagedMoves[s.id]);
    }

    if (searchSource) {
      filtered = filtered.filter(s => 
        s.nama_lengkap?.toLowerCase().includes(searchSource.toLowerCase()) || 
        s.nis?.toLowerCase().includes(searchSource.toLowerCase())
      );
    }
    return filtered.sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap));
  }, [siswaList, sourceClass, stagedMoves, searchSource]);

  // Panel Kiri Guru
  const sourceTeachers = useMemo(() => {
    if (!sourceTeacherClass) return [];
    let filtered;
    if (sourceTeacherClass === '_NEW_TEACHERS_') {
      filtered = teacherList.filter(t => (!t.kelas || t.kelas === '') && !stagedTeacherMoves[t.id]);
    } else {
      filtered = teacherList.filter(t => t.kelas === sourceTeacherClass && !stagedTeacherMoves[t.id]);
    }

    if (searchTeacherSource) {
      filtered = filtered.filter(t => 
        t.name?.toLowerCase().includes(searchTeacherSource.toLowerCase()) || 
        t.jabatan?.toLowerCase().includes(searchTeacherSource.toLowerCase()) ||
        t.subject?.toLowerCase().includes(searchTeacherSource.toLowerCase())
      );
    }
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [teacherList, sourceTeacherClass, stagedTeacherMoves, searchTeacherSource]);

  // Panel Kanan Siswa: Group staged moves by target class
  const stagedGroups = useMemo(() => {
    const groups = {};
    Object.keys(stagedMoves).forEach(id => {
      const target = stagedMoves[id];
      if (!groups[target]) groups[target] = [];
      const siswa = siswaList.find(s => s.id === parseInt(id));
      if (siswa) groups[target].push(siswa);
    });
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === '_ALUMNI_') return 1;
      if (b === '_ALUMNI_') return -1;
      return a.localeCompare(b);
    });
    return sortedKeys.map(key => ({
      targetName: key,
      students: groups[key].sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap))
    }));
  }, [stagedMoves, siswaList]);

  // Panel Kanan Guru: Group staged moves by target class
  const stagedTeacherGroups = useMemo(() => {
    const groups = {};
    Object.keys(stagedTeacherMoves).forEach(id => {
      const target = stagedTeacherMoves[id];
      if (!groups[target]) groups[target] = [];
      const teacher = teacherList.find(t => t.id === parseInt(id));
      if (teacher) groups[target].push(teacher);
    });
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === '_REMOVE_') return 1;
      if (b === '_REMOVE_') return -1;
      return a.localeCompare(b);
    });
    return sortedKeys.map(key => ({
      targetName: key,
      teachers: groups[key].sort((a, b) => a.name.localeCompare(b.name))
    }));
  }, [stagedTeacherMoves, teacherList]);

  // Siswa Target Select
  const selectTarget = (siswaId, target) => {
    setStagedMoves(prev => ({ ...prev, [siswaId]: target }));
    setActiveStudentId(null);
  };

  // Guru Target Select
  const selectTeacherTarget = (teacherId, target) => {
    setStagedTeacherMoves(prev => ({ ...prev, [teacherId]: target }));
    setActiveTeacherId(null);
  };

  // Cancel Siswa Move
  const cancelMove = (siswaId) => {
    setStagedMoves(prev => {
      const next = { ...prev };
      delete next[siswaId];
      return next;
    });
  };

  // Cancel Guru Move
  const cancelTeacherMove = (teacherId) => {
    setStagedTeacherMoves(prev => {
      const next = { ...prev };
      delete next[teacherId];
      return next;
    });
  };

  // Save Siswa
  const handleSaveSiswa = async () => {
    const idsToMove = Object.keys(stagedMoves);
    if (idsToMove.length === 0) return;
    setIsSaving(true);
    
    const updates = idsToMove.map(id => {
      const target = stagedMoves[id];
      if (target === '_ALUMNI_') {
        return { id: parseInt(id), data: { is_active: false, tahun_lulus: new Date().getFullYear() } };
      } else {
        return { id: parseInt(id), data: { kelas: target, is_active: true } };
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/siswa/bulk-update-per-user`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      if (response.ok) {
        showToast(`${updates.length} siswa berhasil dipindahkan!`, 'success');
        setStagedMoves({});
        fetchData(); 
      } else {
        showToast('Gagal menyimpan pemindahan.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Terjadi kesalahan koneksi.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Guru
  const handleSaveTeacher = async () => {
    const idsToMove = Object.keys(stagedTeacherMoves);
    if (idsToMove.length === 0) return;
    setIsSaving(true);
    
    const updates = idsToMove.map(id => {
      const target = stagedTeacherMoves[id];
      return { id: parseInt(id), data: { kelas: target === '_REMOVE_' ? null : target } };
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/teachers/bulk-update-per-user`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      if (response.ok) {
        showToast(`${updates.length} guru berhasil diperbarui!`, 'success');
        setStagedTeacherMoves({});
        fetchData(); 
      } else {
        showToast('Gagal menyimpan pemindahan.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Terjadi kesalahan koneksi.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const currentStagedCount = activeTab === 'siswa' 
    ? Object.keys(stagedMoves).length 
    : Object.keys(stagedTeacherMoves).length;

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 shrink-0 animate-fade-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1 text-[#1e293b]">Rombak & Pembagian Set Kelas</h2>
            <p className="text-slate-500 text-sm">
              Kelola penempatan kelas untuk siswa dan guru pembimbing kelas secara dinamis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {currentStagedCount > 0 && (
              <span className="text-sm font-semibold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 animate-pulse">
                {currentStagedCount} Menunggu
              </span>
            )}
            <button
              onClick={activeTab === 'siswa' ? handleSaveSiswa : handleSaveTeacher}
              disabled={isSaving || currentStagedCount === 0}
              className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg font-semibold flex items-center gap-2"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mt-5 flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200/50">
          <button
            onClick={() => setActiveTab('siswa')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${activeTab === 'siswa' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Siswa
          </button>
          <button
            onClick={() => setActiveTab('guru')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${activeTab === 'guru' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Guru / Wali Kelas
          </button>
        </div>
      </div>

      {activeTab === 'siswa' ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 animate-fade-up delay-100">
          
          {/* PANEL KIRI SISWA (SUMBER) */}
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Kelas Asal (Sumber)</label>
              <select
                value={sourceClass}
                onChange={(e) => setSourceClass(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              >
                <option value="">-- Pilih Kelas --</option>
                <option value="_NEW_STUDENTS_" className="text-indigo-600 font-semibold">Siswa Baru / Tanpa Kelas</option>
                {kelasList.map(k => (
                  <option key={k.id} value={k.nama_kelas}>{k.nama_kelas} ({k.tingkat})</option>
                ))}
              </select>
              {sourceClass && (
                <input
                  type="text"
                  placeholder="Cari siswa..."
                  value={searchSource}
                  onChange={(e) => setSearchSource(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 bg-slate-50/50">
              {isLoading ? <div className="text-center mt-10 text-slate-400">Loading...</div> : !sourceClass ? (
                <div className="text-center mt-10 text-slate-400">Pilih kelas asal terlebih dahulu</div>
              ) : sourceStudents.length === 0 ? (
                <div className="text-center mt-10 text-slate-400">Tidak ada siswa tersisa</div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-2">
                    {sourceStudents.map(siswa => (
                      <motion.div key={siswa.id} layout className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                        <div 
                          onClick={() => setActiveStudentId(activeStudentId === siswa.id ? null : siswa.id)}
                          className="p-3 flex items-center justify-between hover:bg-indigo-50 cursor-pointer"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-700">{siswa.nama_lengkap}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{siswa.nis || 'Belum ada NIS'}</p>
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeStudentId === siswa.id ? 'bg-indigo-600 text-white rotate-90' : 'bg-slate-100 text-slate-400'}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>

                        {/* BUBBLE OPTIONS */}
                        <AnimatePresence>
                          {activeStudentId === siswa.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-indigo-50/50 border-t border-indigo-100 px-3 py-3"
                            >
                              <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Pilih Tujuan (Kenaikan/Pindah):</p>
                              <div className="flex flex-wrap gap-1.5">
                                {kelasList.filter(k => {
                                  if (sourceClass === '_NEW_STUDENTS_') return true;
                                  const sourceObj = kelasList.find(c => c.nama_kelas === sourceClass);
                                  const sTingkat = sourceObj?.tingkat?.toString();
                                  const kTingkat = k.tingkat?.toString();
                                  
                                  // Jika asal kelas 10/X -> Tujuan kelas 11/XI atau pindah kelas sesama 10
                                  if (sTingkat === '10' || sTingkat === 'X') return kTingkat === '11' || kTingkat === 'XI' || (kTingkat === sTingkat && k.nama_kelas !== sourceClass);
                                  // Jika asal kelas 11/XI -> Tujuan kelas 12/XII atau pindah kelas sesama 11
                                  if (sTingkat === '11' || sTingkat === 'XI') return kTingkat === '12' || kTingkat === 'XII' || (kTingkat === sTingkat && k.nama_kelas !== sourceClass);
                                  // Jika asal kelas 12/XII -> Jangan tampilkan pilihan kelas apapun, langsung ke tombol Luluskan
                                  if (sTingkat === '12' || sTingkat === 'XII') return false;
                                  
                                  return k.nama_kelas !== sourceClass;
                                }).map(k => (
                                  <button
                                    key={k.id}
                                    onClick={() => selectTarget(siswa.id, k.nama_kelas)}
                                    className="bg-white border border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-sm"
                                  >
                                    {k.nama_kelas}
                                  </button>
                                ))}

                                {/* Opsi Luluskan HANYA muncul untuk kelas 12 */}
                                {(() => {
                                  if (sourceClass === '_NEW_STUDENTS_') return null;
                                  const sourceObj = kelasList.find(c => c.nama_kelas === sourceClass);
                                  const isKelas12 = sourceObj?.tingkat?.toString() === '12' || sourceObj?.tingkat?.toString() === 'XII';
                                  if (!isKelas12) return null;
                                  return (
                                    <button
                                      onClick={() => selectTarget(siswa.id, '_ALUMNI_')}
                                      className="bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 border px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-sm ml-auto"
                                    >
                                      🎓 Luluskan
                                    </button>
                                  );
                                })()}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
            <div className="p-3 bg-white border-t border-slate-200 text-xs text-center text-slate-500 font-medium">
              Sisa: {sourceStudents.length} siswa
            </div>
          </div>

          {/* PANEL KANAN SISWA (Daftar Pindah) */}
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex flex-col gap-3">
              <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Daftar Pemindahan Siswa (Staging)</label>
              <p className="text-[11px] text-emerald-600/80">Siswa yang dipindah akan muncul di sini sesuai target kelasnya.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 bg-slate-50/30">
              {stagedGroups.length === 0 ? (
                <div className="text-center mt-10 text-slate-400 text-sm">Belum ada siswa yang dipindahkan</div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {stagedGroups.map(group => (
                      <motion.div key={group.targetName} layout className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className={`px-3 py-2 font-bold text-xs flex justify-between items-center ${group.targetName === '_ALUMNI_' ? 'bg-orange-50 text-orange-700 border-b border-orange-100' : 'bg-slate-100 text-slate-700 border-b border-slate-200'}`}>
                          <span>{group.targetName === '_ALUMNI_' ? '🎓 KE ALUMNI (LULUS)' : `KE KELAS ${group.targetName}`}</span>
                          <span className="bg-white px-2 py-0.5 rounded-md shadow-sm text-[10px]">{group.students.length} Siswa</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {group.students.map(siswa => (
                            <div key={siswa.id} className="p-2.5 flex justify-between items-center hover:bg-slate-50 group transition-colors">
                              <div>
                                <p className="text-xs font-bold text-slate-700">{siswa.nama_lengkap}</p>
                                <p className="text-[10px] text-slate-400 font-mono">Asal: {siswa.kelas || 'Siswa Baru'}</p>
                              </div>
                              <button
                                onClick={() => cancelMove(siswa.id)}
                                className="w-6 h-6 rounded-md bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                                title="Batal Pindah"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 animate-fade-up delay-100">
          
          {/* PANEL KIRI GURU (SUMBER) */}
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Kelas Mengajar/Wali Kelas Asal</label>
              <select
                value={sourceTeacherClass}
                onChange={(e) => setSourceTeacherClass(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              >
                <option value="">-- Pilih Kelas --</option>
                <option value="_NEW_TEACHERS_" className="text-indigo-600 font-semibold">Guru Baru / Tanpa Kelas</option>
                {kelasList.map(k => (
                  <option key={k.id} value={k.nama_kelas}>{k.nama_kelas} ({k.tingkat})</option>
                ))}
              </select>
              {sourceTeacherClass && (
                <input
                  type="text"
                  placeholder="Cari guru..."
                  value={searchTeacherSource}
                  onChange={(e) => setSearchTeacherSource(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 bg-slate-50/50">
              {isLoading ? <div className="text-center mt-10 text-slate-400">Loading...</div> : !sourceTeacherClass ? (
                <div className="text-center mt-10 text-slate-400">Pilih kelas asal guru terlebih dahulu</div>
              ) : sourceTeachers.length === 0 ? (
                <div className="text-center mt-10 text-slate-400">Tidak ada guru tersisa</div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-2">
                    {sourceTeachers.map(teacher => (
                      <motion.div key={teacher.id} layout className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                        <div 
                          onClick={() => setActiveTeacherId(activeTeacherId === teacher.id ? null : teacher.id)}
                          className="p-3 flex items-center justify-between hover:bg-indigo-50 cursor-pointer"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-700">{teacher.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {teacher.jabatan || 'Guru'} {teacher.subject ? `• ${teacher.subject}` : ''}
                            </p>
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeTeacherId === teacher.id ? 'bg-indigo-600 text-white rotate-90' : 'bg-slate-100 text-slate-400'}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>

                        {/* BUBBLE OPTIONS */}
                        <AnimatePresence>
                          {activeTeacherId === teacher.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-indigo-50/50 border-t border-indigo-100 px-3 py-3"
                            >
                              <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Tugaskan ke Kelas:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {kelasList.map(k => (
                                  <button
                                    key={k.id}
                                    onClick={() => selectTeacherTarget(teacher.id, k.nama_kelas)}
                                    className="bg-white border border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-sm"
                                  >
                                    {k.nama_kelas}
                                  </button>
                                ))}

                                {sourceTeacherClass !== '_NEW_TEACHERS_' && (
                                  <button
                                    onClick={() => selectTeacherTarget(teacher.id, '_REMOVE_')}
                                    className="bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-sm ml-auto"
                                  >
                                    ✖ Bebastugaskan
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
            <div className="p-3 bg-white border-t border-slate-200 text-xs text-center text-slate-500 font-medium">
              Sisa: {sourceTeachers.length} guru
            </div>
          </div>

          {/* PANEL KANAN GURU (Daftar Pindah) */}
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex flex-col gap-3">
              <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Daftar Pemindahan Guru (Staging)</label>
              <p className="text-[11px] text-emerald-600/80">Guru yang dipindahkan akan muncul di sini sesuai kelas tujuannya.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 bg-slate-50/30">
              {stagedTeacherGroups.length === 0 ? (
                <div className="text-center mt-10 text-slate-400 text-sm">Belum ada guru yang dipindahkan</div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {stagedTeacherGroups.map(group => (
                      <motion.div key={group.targetName} layout className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className={`px-3 py-2 font-bold text-xs flex justify-between items-center ${group.targetName === '_REMOVE_' ? 'bg-rose-50 text-rose-700 border-b border-rose-100' : 'bg-slate-100 text-slate-700 border-b border-slate-200'}`}>
                          <span>{group.targetName === '_REMOVE_' ? '✖ DIBEBASTUGASKAN (TANPA KELAS)' : `KE KELAS ${group.targetName}`}</span>
                          <span className="bg-white px-2 py-0.5 rounded-md shadow-sm text-[10px]">{group.teachers.length} Guru</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {group.teachers.map(teacher => (
                            <div key={teacher.id} className="p-2.5 flex justify-between items-center hover:bg-slate-50 group transition-colors">
                              <div>
                                <p className="text-xs font-bold text-slate-700">{teacher.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">Asal: {teacher.kelas || 'Tanpa Kelas'}</p>
                              </div>
                              <button
                                onClick={() => cancelTeacherMove(teacher.id)}
                                className="w-6 h-6 rounded-md bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                                title="Batal Pindah"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
