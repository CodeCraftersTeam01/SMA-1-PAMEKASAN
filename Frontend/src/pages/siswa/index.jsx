import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';

const AI_STEPS = { UPLOAD: 1, ANALYZING: 2, MAPPING: 3, PREVIEW: 4, IMPORTING: 5, RESULT: 6 };
const STEP_LABELS = ['Upload', 'Analisis AI', 'Mapping', 'Preview', 'Import'];

const DetailField = ({ label, value, highlight }) => (
  <div>
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
    <p className={`text-sm ${highlight ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{value || '-'}</p>
  </div>
);


// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white shadow-2xl shadow-slate-900/20 animate-fade-up ${colors[type] || colors.info}`}>
      {type === 'success' && (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {type === 'error' && (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

const Siswa = () => {
  const { can } = useAuth();
  const [siswaList, setSiswaList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Form modal + selection modal
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formSiswa, setFormSiswa] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewSiswa, setViewSiswa] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // AI wizard
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
  const [aiStep, setAiStep]                 = useState(AI_STEPS.UPLOAD);
  const [aiFile, setAiFile]                 = useState(null);
  const [aiAnalysis, setAiAnalysis]         = useState(null);
  const [aiMapping, setAiMapping]           = useState({});
  const [aiHeaderRow, setAiHeaderRow]       = useState(0);
  const [aiDbSchema, setAiDbSchema]         = useState([]);
  const [aiResult, setAiResult]             = useState(null);
  const [aiError, setAiError]               = useState('');
  const [importProgress, setImportProgress] = useState(null);
  
  // AI wizard options
  const [aiImportType, setAiImportType] = useState('baru');
  const [aiTahunAjaranId, setAiTahunAjaranId] = useState('');

  // Batch selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState('massal');
  const [bulkEditData, setBulkEditData] = useState({ is_active: '' });
  const [perUserData, setPerUserData] = useState({});
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterTahunMasuk, setFilterTahunMasuk] = useState('');
  const [filterTahunAjaran, setFilterTahunAjaran] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const showToast = (message, type = 'info') => setToast({ message, type });

  const fetchSiswa = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/siswa`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSiswaList(Array.isArray(data) ? data : (data.data || []));
      } else if (response.status === 404) {
        setSiswaList([]);
      } else {
        showToast('Gagal memuat data siswa', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKelas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/kelas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setKelasList(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error("Gagal memuat kelas", error);
    }
  };

  const fetchTahunAjaran = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tahun-ajaran`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTahunAjaranList(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error("Gagal memuat tahun ajaran", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSiswa();
      fetchKelas();
      fetchTahunAjaran();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [searchQuery, filterTahunMasuk, filterTahunAjaran, itemsPerPage]);

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data siswa ini?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/siswa/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (response.ok) {
        showToast('Data siswa berhasil dihapus', 'success');
        fetchSiswa();
      } else {
        showToast('Gagal menghapus data', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    }
  };

  const openFormForCreate = () => {
    setIsSelectionModalOpen(false);
    setFormSiswa({
      nis: '', kelas: '', nama_lengkap: '', jenis_kelamin: 'L', nisn: '',
      tempat_lahir: '', tanggal_lahir: '', agama: 'Islam', alamat: '',
      rt: '', rw: '', dusun: '', kelurahan: '', kode_pos: '',
      jenis_tinggal: '', alat_transportasi: '', lintang: '', bujur: '',
      nomor_hp: '', email: '',
      penerima_kps: false, nomor_kps: '', penerima_kip: false, nomor_kip: '',
      is_active: true, tahun_masuk: '', tahun_ajaran_id: '',
      kelas_10: '', kelas_11: '', kelas_12: '', tahun_lulus: ''
    });
    setIsFormModalOpen(true);
  };

  const openFormForEdit = (siswa) => {
    setFormSiswa({ ...siswa });
    setIsFormModalOpen(true);
  };

  const openViewModal = (siswa) => {
    setViewSiswa(siswa);
    setIsViewModalOpen(true);
  };

  const openAiWizardFromSelection = () => {
    setIsSelectionModalOpen(false);
    setAiHeaderRow(0); setAiDbSchema([]);
    setAiStep(AI_STEPS.UPLOAD);
    setAiFile(null); setAiAnalysis(null); setAiMapping({}); setAiResult(null); setAiError('');
    setAiImportType('baru'); setAiTahunAjaranId('');
    setIsAiWizardOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!formSiswa) return;
    setIsSaving(true);
    try {
      const payload = {};
      const fields = [
        'nis', 'kelas', 'nama_lengkap', 'jenis_kelamin', 'nisn', 'tempat_lahir',
        'tanggal_lahir', 'agama', 'alamat', 'rt', 'rw', 'dusun', 'kelurahan', 'kode_pos', 
        'jenis_tinggal', 'alat_transportasi', 'lintang', 'bujur', 'nomor_hp', 'email',
        'penerima_kps', 'nomor_kps', 'penerima_kip', 'nomor_kip',
        'is_active', 'tahun_masuk', 'kelas_10', 'kelas_11', 'kelas_12', 'tahun_ajaran_id', 'tahun_lulus'
      ];
      fields.forEach(f => { if (formSiswa[f] !== undefined) payload[f] = formSiswa[f]; });
      payload.is_active = payload.is_active === true || payload.is_active === 1;

      // Hitung otomatis kelas saat ini berdasarkan tahun_ajaran_id jika ada
      if (payload.tahun_ajaran_id && tahunAjaranList.length > 0) {
        const activeTA = tahunAjaranList.find(t => t.is_active === 1 || t.is_active === true);
        const selectedTA = tahunAjaranList.find(t => t.id === Number(payload.tahun_ajaran_id));
        if (activeTA && selectedTA) {
          const getStartYear = (str) => parseInt(str?.substring(0, 4) || "0", 10);
          const startYear = getStartYear(selectedTA.tahun);
          const diff = getStartYear(activeTA.tahun) - startYear;
          
          if (diff === 0) payload.kelas = payload.kelas_10 || '';
          else if (diff === 1) payload.kelas = payload.kelas_11 || '';
          else if (diff >= 2) payload.kelas = payload.kelas_12 || '';
          
          if (!payload.tahun_lulus && diff >= 3) {
            payload.tahun_lulus = startYear + 3;
          }
        }
      }

      const isEditing = !!formSiswa.id;
      const url = isEditing
        ? `${API_BASE_URL}/api/siswa/${formSiswa.id}`
        : `${API_BASE_URL}/api/siswa`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showToast(isEditing ? 'Data siswa berhasil diperbarui' : 'Data siswa berhasil ditambahkan', 'success');
        setIsFormModalOpen(false);
        setFormSiswa(null);
        fetchSiswa();
      } else {
        const data = await response.json();
        showToast(data.message || 'Gagal menyimpan data', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Batch Selection ──────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedSiswa.map(s => s.id);
    const allSelected = pageIds.every(id => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Yakin ingin menghapus ${selectedIds.size} data siswa?`)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/siswa/bulk-delete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ ids: [...selectedIds] }),
      });
      if (response.ok) {
        showToast(`${selectedIds.size} data siswa berhasil dihapus`, 'success');
        clearSelection();
        fetchSiswa();
      } else {
        const data = await response.json();
        showToast(data.message || 'Gagal menghapus data', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    }
  };

  const openBulkEdit = () => {
    setBulkEditMode('massal');
    setBulkEditData({ is_active: '' });
    const initial = {};
    siswaList.filter(s => selectedIds.has(s.id)).forEach(s => {
      initial[s.id] = { ...s };
    });
    setPerUserData(initial);
    setIsBulkEditModalOpen(true);
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkSaving(true);
    try {
      if (bulkEditMode === 'massal') {
        const payload = {};
        if (bulkEditData.is_active !== '') payload.is_active = bulkEditData.is_active === '1';
        if (Object.keys(payload).length === 0) {
          showToast('Pilih setidaknya satu field untuk diubah', 'error');
          setIsBulkSaving(false);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/siswa/bulk-update`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ ids: [...selectedIds], data: payload }),
        });
        if (response.ok) {
          showToast(`${selectedIds.size} data siswa berhasil diperbarui`, 'success');
        } else {
          const data = await response.json();
          showToast(data.message || 'Gagal memperbarui data', 'error');
          setIsBulkSaving(false);
          return;
        }
      } else {
        const updates = [];
        for (const id of selectedIds) {
          const orig = siswaList.find(s => s.id === id);
          const edited = perUserData[id];
          if (!orig || !edited) continue;
          const data = {};
          const fields = [
            'nis', 'kelas', 'nama_lengkap', 'jenis_kelamin', 'nisn', 'tempat_lahir',
            'tanggal_lahir', 'agama', 'alamat', 'nomor_hp', 'email',
            'penerima_kps', 'nomor_kps', 'penerima_kip', 'nomor_kip', 'is_active',
          ];
          fields.forEach(f => {
            if (f === 'is_active') {
              if (String(edited[f]) !== String(orig[f])) data[f] = !!edited[f];
            } else if (String(edited[f] || '') !== String(orig[f] || '')) {
              data[f] = edited[f];
            }
          });
          if (Object.keys(data).length > 0) updates.push({ id, data });
        }
        if (updates.length === 0) {
          showToast('Tidak ada perubahan data', 'info');
          setIsBulkSaving(false);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/siswa/bulk-update-per-user`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ updates }),
        });
        if (response.ok) {
          showToast(`${updates.length} data siswa berhasil diperbarui`, 'success');
        } else {
          const data = await response.json();
          showToast(data.message || 'Gagal memperbarui data', 'error');
          setIsBulkSaving(false);
          return;
        }
      }
      setIsBulkEditModalOpen(false);
      clearSelection();
      fetchSiswa();
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setIsBulkSaving(false);
    }
  };

  const tahunMasukOptions = [...new Set(siswaList.map(s => s.tahun_masuk).filter(Boolean))].sort();
  const tahunAjaranOptions = [...new Set(siswaList.map(s => s.tahun_ajaran?.tahun).filter(Boolean))].sort();

  const filteredSiswa = siswaList.filter(s => {
    const matchSearch = !searchQuery ||
      s.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.kelas?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTahunMasuk = !filterTahunMasuk || s.tahun_masuk?.toString() === filterTahunMasuk;
    const matchTahunAjaran = !filterTahunAjaran || s.tahun_ajaran?.tahun === filterTahunAjaran;
    return matchSearch && matchTahunMasuk && matchTahunAjaran;
  });

  const totalPages = Math.ceil(filteredSiswa.length / itemsPerPage);
  const paginatedSiswa = filteredSiswa.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  // ── AI Wizard ──────────────────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['nis', 'nama_lengkap'],
      ['12345678', 'Nama Siswa Contoh'],
    ]);
    ws['!cols'] = [{ wch: 15 }, { wch: 30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
    XLSX.writeFile(wb, 'template_siswa.xlsx');
  };

  const handleAiAnalyze = async () => {
    if (!aiFile) return;
    if (aiImportType === 'lama' && !aiTahunAjaranId) {
      setAiError('Pilih Tahun Ajaran untuk data lama terlebih dahulu.');
      return;
    }
    setAiStep(AI_STEPS.ANALYZING);
    setAiError('');
    const fd = new FormData();
    fd.append('file', aiFile);
    fd.append('target_table', 'siswas');
    try {
      const res  = await fetch(`${API_BASE_URL}/api/ai-import/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menganalisis file');
      setAiAnalysis(data);
      const initialMapping = {};
      Object.entries(data.ai_mapping).forEach(([excel, db]) => {
        if (db) initialMapping[db] = { type: 'column', value: excel };
      });
      setAiMapping(initialMapping);
      setAiHeaderRow(data.header_row ?? 0);
      setAiDbSchema(data.db_schema ?? []);
      setAiStep(AI_STEPS.MAPPING);
    } catch (e) {
      setAiError(e.message);
      setAiStep(AI_STEPS.UPLOAD);
    }
  };

  const handleAiExecute = async () => {
    if (!aiFile || !aiAnalysis) return;
    if (aiImportType === 'lama' && !aiTahunAjaranId) {
      setAiError('Pilih Tahun Ajaran untuk data lama.');
      return;
    }

    setAiStep(AI_STEPS.IMPORTING);
    setImportProgress({ current: 0, total: 0, success: 0, fail: 0 });
    const fd = new FormData();
    fd.append('file', aiFile);
    fd.append('target_table', 'siswas');
    fd.append('mapping', JSON.stringify(aiMapping));
    fd.append('header_row', String(aiHeaderRow));
    fd.append('import_type', aiImportType);
    if (aiImportType === 'lama') {
      fd.append('tahun_ajaran_id', aiTahunAjaranId);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-import/execute`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: fd,
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal mengimport');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';
      let finalData = null;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          let parts = buffer.split('\n\n');
          buffer = parts.pop(); 

          for (let part of parts) {
            if (part.startsWith('data: ')) {
              try {
                const data = JSON.parse(part.substring(6));
                if (data.type === 'start') {
                  setImportProgress(prev => ({ ...prev, total: data.total }));
                } else if (data.type === 'progress') {
                  setImportProgress({
                    current: data.current,
                    total: data.total,
                    success: data.success,
                    fail: data.fail
                  });
                } else if (data.type === 'complete') {
                  finalData = data;
                }
              } catch {
                // ignore parsing error
              }
            }
          }
        }
      }

      if (finalData) {
        setAiResult(finalData);
        setAiStep(AI_STEPS.RESULT);
        fetchSiswa();
      } else {
        throw new Error('Respons import tidak lengkap dari server.');
      }
    } catch (e) {
      setAiError(e.message);
      setAiStep(AI_STEPS.MAPPING);
    } finally {
      setImportProgress(null);
    }
  };

  const activeMappingCount = Object.values(aiMapping).filter(m => m && m.type !== 'none' && m.value !== '').length;
  const inactiveMappingCount = aiDbSchema.length - activeMappingCount;

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1e293b]">Data Siswa</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Kelola data siswa aktif SMAN 1 Pamekasan. Migrasikan pendaftar yang diterima menjadi siswa resmi.
            </p>
          </div>
           <div className="flex items-center gap-3">
            {can('siswa', 'create') && (
              <button
                onClick={() => setIsSelectionModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 font-semibold flex items-center gap-2 shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Tambah Siswa
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up delay-75">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Siswa</p>
            <p className="text-2xl font-bold text-slate-800">{siswaList.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Siswa Aktif</p>
            <p className="text-2xl font-bold text-slate-800">{siswaList.filter(s => s.is_active).length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Alumni</p>
            <p className="text-2xl font-bold text-slate-800">{siswaList.filter(s => !s.is_active).length}</p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up delay-100">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <h3 className="text-[16px] font-bold text-[#1e293b] shrink-0">Daftar Siswa</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Limit */}
            <select 
              value={itemsPerPage} 
              onChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }} 
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 text-slate-600 bg-white"
            >
              <option value={10}>10 Data</option>
              <option value={50}>50 Data</option>
              <option value={100}>100 Data</option>
              <option value={500}>500 Data</option>
              <option value={1000}>1000 Data</option>
            </select>
            {/* Filter Tahun Masuk */}
            <select value={filterTahunMasuk} onChange={e => setFilterTahunMasuk(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 text-slate-600 bg-white">
              <option value="">Semua Tahun Masuk</option>
              {tahunMasukOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {/* Filter Tahun Ajaran */}
            <select value={filterTahunAjaran} onChange={e => setFilterTahunAjaran(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 text-slate-600 bg-white">
              <option value="">Semua Tahun Ajaran</option>
              {tahunAjaranOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama / NIS..."
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-slate-600"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Batch Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 animate-fade-up">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-800"></span>
              <span className="text-sm font-semibold text-slate-700">{selectedIds.size} siswa dipilih</span>
              <button onClick={clearSelection} className="text-xs text-slate-400 hover:text-slate-600 ml-1 font-medium">Batal</button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openBulkEdit}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit Massal
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Hapus Massal
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Memuat data siswa...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-10">
                    <input
                      type="checkbox"
                      checked={paginatedSiswa.length > 0 && paginatedSiswa.every(s => selectedIds.has(s.id))}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500/20 cursor-pointer"
                    />
                  </th>
                  <th className="pb-3 pl-2">NIS</th>
                  <th className="pb-3">Kelas</th>
                  <th className="pb-3">Nama Lengkap</th>
                  <th className="pb-3">JK</th>
                  <th className="pb-3">NISN</th>
                  <th className="pb-3">Tahun Masuk</th>
                  <th className="pb-3">Tahun Lulus</th>
                  <th className="pb-3">Tahun Ajaran</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-600">
                {paginatedSiswa.map((item) => (
                  <tr key={item.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${selectedIds.has(item.id) ? 'bg-slate-50' : ''}`}>
                    <td className="py-4 pl-2 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500/20 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 pl-2">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg text-xs">
                        {item.nis || '-'}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500">
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold border bg-slate-50 text-slate-600 border-slate-200">
                        {item.kelas || '-'}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-slate-700">{item.nama_lengkap}</td>
                    <td className="py-4 text-slate-500">
                      {item.jenis_kelamin ? (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold border ${item.jenis_kelamin === 'L' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-pink-50 text-pink-600 border-pink-200'}`}>
                          {item.jenis_kelamin}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-4 text-slate-500">
                      <span className="font-mono text-xs">{item.nisn || '-'}</span>
                    </td>
                    <td className="py-4 text-slate-500">{item.tahun_masuk}</td>
                    <td className="py-4 text-slate-500">{item.tahun_lulus || '-'}</td>
                    <td className="py-4">
                      {item.tahun_ajaran ? (
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold border bg-indigo-50 text-indigo-600 border-indigo-100">
                          {item.tahun_ajaran.tahun}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-4">
                      {item.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-slate-800 text-white border-slate-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-slate-50 text-slate-500 border-slate-100">
                          Alumni
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-1">
                        {can('siswa', 'view') && (
                          <button
                            onClick={() => openViewModal(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                        {can('siswa', 'edit') && (
                          <button
                            onClick={() => openFormForEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {can('siswa', 'delete') && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedSiswa.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="10" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="font-semibold text-slate-500">Belum ada data siswa</p>
                        <p className="text-sm text-slate-400">Klik "Tambah Siswa" untuk menambahkan data siswa baru</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredSiswa.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
            <p className="text-xs text-slate-500">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredSiswa.length)} dari {filteredSiswa.length} siswa
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              {(() => {
                const items = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) items.push(i);
                } else {
                  items.push(1);
                  if (currentPage > 3) items.push('…');
                  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) items.push(i);
                  if (currentPage < totalPages - 2) items.push('…');
                  items.push(totalPages);
                }
                return items.map((p, idx) =>
                  p === '…' ? (
                    <span key={`ellipsis-${idx}`} className="text-slate-300 px-1 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${currentPage === p ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {p}
                    </button>
                  )
                );
              })()}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── AI Wizard Modal ──────────────────────────────────────────────────── */}
      {isAiWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col max-h-[92vh]">

            {/* Thin accent bar */}
            <div className="h-1 bg-slate-800 rounded-t-2xl" />

            {/* Wizard Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold text-sm">AI Import — Smart Column Mapper</p>
                    <p className="text-slate-400 text-[11px]">nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free</p>
                  </div>
                </div>
                {aiStep !== AI_STEPS.ANALYZING && aiStep !== AI_STEPS.IMPORTING && (
                  <button onClick={() => setIsAiWizardOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
              {/* Step bar */}
              <div className="flex items-center gap-1.5">
                {STEP_LABELS.map((label, idx) => {
                  const stepMap = [AI_STEPS.UPLOAD, AI_STEPS.ANALYZING, AI_STEPS.MAPPING, AI_STEPS.PREVIEW, AI_STEPS.RESULT];
                  const thisStep = stepMap[idx];
                  const isDone   = aiStep > thisStep && !(aiStep === AI_STEPS.ANALYZING && idx === 1) && !(aiStep === AI_STEPS.IMPORTING && idx === 3);
                  const isActive = aiStep === thisStep || (aiStep === AI_STEPS.ANALYZING && idx === 1) || (aiStep === AI_STEPS.IMPORTING && idx === 3) || (aiStep === AI_STEPS.IMPORTING && idx === 4 && false);
                  return (
                    <React.Fragment key={label}>
                      <div className="flex items-center gap-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isDone ? 'bg-slate-500 text-white' : isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[10px] font-semibold hidden sm:block ${isActive ? 'text-slate-800' : isDone ? 'text-slate-500' : 'text-slate-300'}`}>{label}</span>
                      </div>
                      {idx < STEP_LABELS.length - 1 && <div className={`flex-1 h-px ${isDone ? 'bg-slate-300' : 'bg-slate-200'}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* STEP 1 — Upload */}
              {aiStep === AI_STEPS.UPLOAD && (
                <div className="space-y-5">
                  {/* Pilihan Jenis Import diletakkan di awal */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
                    <p className="text-sm font-bold text-slate-800 mb-3">Pengaturan Import Data</p>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${aiImportType === 'baru' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-300 bg-white'}`}>
                        <input type="radio" name="aiImportType" value="baru" checked={aiImportType === 'baru'} onChange={() => setAiImportType('baru')} className="w-4 h-4 text-blue-600 focus:ring-blue-500/20" />
                        <div>
                          <p className="text-sm font-bold text-slate-800">Siswa Baru / Aktif</p>
                          <p className="text-xs text-slate-500 mt-0.5">Siswa yang masih aktif bersekolah</p>
                        </div>
                      </label>
                      <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${aiImportType === 'lama' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-300 bg-white'}`}>
                        <input type="radio" name="aiImportType" value="lama" checked={aiImportType === 'lama'} onChange={() => setAiImportType('lama')} className="w-4 h-4 text-blue-600 focus:ring-blue-500/20" />
                        <div>
                          <p className="text-sm font-bold text-slate-800">Siswa Lama / Alumni</p>
                          <p className="text-xs text-slate-500 mt-0.5">Siswa yang sudah lulus atau alumni</p>
                        </div>
                      </label>
                    </div>

                    {aiImportType === 'lama' && (() => {
                      const activeTA = tahunAjaranList.find(t => t.is_active === 1 || t.is_active === true);
                      const getStartYear = (str) => parseInt(str?.substring(0, 4) || "0", 10);
                      const activeYear = activeTA ? getStartYear(activeTA.tahun) : new Date().getFullYear();
                      const pastTahunAjaran = tahunAjaranList.filter(t => getStartYear(t.tahun) <= activeYear - 3);

                      return (
                        <div className="animate-fade-up">
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Pilih Tahun Ajaran (Angkatan Lama)</label>
                          <select 
                            value={aiTahunAjaranId} 
                            onChange={(e) => setAiTahunAjaranId(e.target.value)}
                            className="w-full text-sm px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-800/10 transition-all font-medium bg-slate-50"
                          >
                            <option value="">— Pilih Tahun Ajaran —</option>
                            {pastTahunAjaran.map(ta => (
                              <option key={ta.id} value={ta.id}>{ta.tahun}</option>
                            ))}
                          </select>
                          {pastTahunAjaran.length === 0 && (
                            <p className="text-xs text-red-500 mt-2 font-medium">Data Tahun Ajaran lama (&lt;= 3 tahun lalu) tidak ditemukan di sistem.</p>
                          )}
                          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3 items-start">
                            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <div>
                              <p className="text-sm font-bold text-amber-800 mb-0.5">Peringatan Penting</p>
                              <p className="text-xs text-amber-700 leading-relaxed">
                                Pastikan data alumni atau siswa lama yang Anda tambahkan <strong>berada dalam rentang 1 tahun dari Tahun Ajaran yang Anda pilih</strong> di atas. Semua data ini akan otomatis diatur sebagai Alumni (Tidak Aktif) dan kolom kelas diabaikan.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {aiError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex gap-2 items-start">
                      <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {aiError}
                    </div>
                  )}

                  <div className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${aiFile ? 'border-slate-400 bg-slate-50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/30'}`}>
                    <input type="file" accept=".csv,.xlsx,.xls" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setAiFile(e.target.files?.[0] || null)} />
                    <div className="pointer-events-none">
                      {aiFile ? (
                        <>
                          <svg className="w-12 h-12 text-slate-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <p className="text-sm font-bold text-slate-700 mb-1">{aiFile.name}</p>
                          <p className="text-xs text-slate-400">File dipilih. Klik untuk ganti.</p>
                        </>
                      ) : (
                        <>
                          <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          <p className="text-sm font-semibold text-slate-600 mb-1">Klik atau drag file ke sini</p>
                          <p className="text-xs text-slate-400">Format <strong>.CSV .XLSX .XLS</strong> — Nama kolom bebas, AI petakan otomatis</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
                    <strong>Cara kerja:</strong> Upload file Excel/CSV dengan format kolom apapun (misal: "Nama Siswa", "No. NISN", "Sekolah Asal"). AI akan otomatis mencocokkan ke kolom database. Kamu bisa koreksi mapping sebelum import.
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button type="button" onClick={handleDownloadTemplate} className="text-sm text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download Template
                    </button>
                    <button onClick={handleAiAnalyze} disabled={!aiFile} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Analisis dengan AI
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 — Analyzing */}
              {aiStep === AI_STEPS.ANALYZING && (
                <div className="py-16 flex flex-col items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-800 font-bold text-lg mb-1">AI sedang menganalisis...</p>
                    <p className="text-slate-500 text-sm">Membaca kolom Excel dan mencocokkan dengan skema database</p>
                    <p className="text-slate-400 text-xs mt-2 font-medium animate-pulse">nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free</p>
                  </div>
                </div>
              )}

              {/* STEP 3 — Mapping */}
              {aiStep === AI_STEPS.MAPPING && aiAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Total baris data: <span className="text-slate-800 font-bold">{aiAnalysis.total_rows}</span></p>
                      <p className="text-xs text-slate-400 mt-0.5">{aiFile?.name} — header terdeteksi di <span className="text-slate-600 font-semibold">baris {aiHeaderRow + 1}</span></p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-bold border border-slate-200">✓ {activeMappingCount} terpetakan</span>
                      <span className="bg-slate-50 text-slate-400 px-2 py-1 rounded-full font-bold border border-slate-100">✗ {inactiveMappingCount} diabaikan</span>
                    </div>
                  </div>

                  {/* Info kolom DB wajib */}
                  {aiDbSchema.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
                      <strong>Kolom database wajib diisi:</strong>{' '}
                      {aiDbSchema.filter(s => s.required).map(s => s.column).join(', ') || 'tidak ada'}.
                      {' '}Kolom opsional:{' '}
                      {aiDbSchema.filter(s => !s.required).map(s => s.column).join(', ') || '-'}
                    </div>
                  )}

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 bg-slate-50/50 px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <div className="col-span-5">Kolom Database (Wajib Diisi)</div>
                      <div className="col-span-1 text-center"></div>
                      <div className="col-span-6">Sumber Data Excel / Manual</div>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                      {aiDbSchema.map(schema => {
                        const db = schema.column;
                        const mapData = aiMapping[db] || { type: 'none', value: '' };
                        const isMapped = mapData.type !== 'none' && mapData.value !== '';
                        return (
                          <div key={db} className="grid grid-cols-12 px-5 py-4 items-center hover:bg-slate-50/80 transition-colors gap-3">
                            <div className="col-span-5 flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-slate-800">{db}</span>
                                {schema.required && <span className="text-red-400 text-lg leading-none" title="Wajib Diisi">*</span>}
                              </div>
                              <span className="text-xs text-slate-400 mt-1">{schema.type}</span>
                            </div>
                            
                            <div className="col-span-1 text-center flex justify-center">
                              {isMapped ? (
                                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                              ) : (
                                <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                              )}
                            </div>

                            <div className="col-span-6 flex flex-col gap-2 relative">
                              <select
                                value={mapData.type === 'column' ? `COL:${mapData.value}` : mapData.type === 'fixed' ? 'FIXED' : ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val === '') {
                                    setAiMapping(prev => ({ ...prev, [db]: { type: 'none', value: '' } }));
                                  } else if (val === 'FIXED') {
                                    const defaultVal = db === 'jalur' ? 'zonasi' : db === 'status' ? 'pending' : '';
                                    setAiMapping(prev => ({ ...prev, [db]: { type: 'fixed', value: defaultVal } }));
                                  } else if (val.startsWith('COL:')) {
                                    setAiMapping(prev => ({ ...prev, [db]: { type: 'column', value: val.replace('COL:', '') } }));
                                  }
                                }}
                                className={`w-full text-sm px-3 py-2.5 rounded-xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-slate-800/10 font-medium ${mapData.type === 'column' ? 'border-slate-300 text-slate-700 bg-slate-50' : mapData.type === 'fixed' ? 'border-slate-300 text-slate-700 bg-slate-50' : 'border-slate-200 text-slate-400 bg-white hover:border-slate-300'}`}
                              >
                                <option value="">— Abaikan (Jangan isi) —</option>
                                <optgroup label="AMBIL DARI KOLOM EXCEL">
                                  {aiAnalysis.excel_columns_with_sample?.map(ex => (
                                    <option key={ex.header} value={`COL:${ex.header}`}>
                                      {ex.header} {ex.sample ? `- (Contoh: ${ex.sample})` : ''}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="PILIHAN LAIN">
                                  <option value="FIXED">➜ Isi Manual (Semua baris bernilai sama)</option>
                                </optgroup>
                              </select>
                              
                              {mapData.type === 'fixed' && (
                                <div className="animate-fade-up">
                                  {db === 'jalur' ? (
                                    <select
                                      value={mapData.value}
                                      onChange={e => setAiMapping(prev => ({ ...prev, [db]: { type: 'fixed', value: e.target.value } }))}
                                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700 font-semibold shadow-sm"
                                    >
                                      <option value="zonasi">Zonasi</option>
                                      <option value="afirmasi">Afirmasi</option>
                                      <option value="prestasi">Prestasi</option>
                                      <option value="perpindahan_tugas">Perpindahan Tugas</option>
                                    </select>
                                  ) : db === 'status' ? (
                                    <select
                                      value={mapData.value}
                                      onChange={e => setAiMapping(prev => ({ ...prev, [db]: { type: 'fixed', value: e.target.value } }))}
                                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700 font-semibold shadow-sm"
                                    >
                                      <option value="pending">Menunggu</option>
                                      <option value="diterima">Diterima</option>
                                      <option value="ditolak">Ditolak</option>
                                    </select>
                                  ) : (
                                    <input
                                      type="text"
                                      value={mapData.value}
                                      placeholder={`Ketik nilai untuk ${db}...`}
                                      onChange={e => setAiMapping(prev => ({ ...prev, [db]: { type: 'fixed', value: e.target.value } }))}
                                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700 shadow-sm placeholder:text-slate-400 font-medium"
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {aiError && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{aiError}</div>}

                  <div className="flex items-center justify-between pt-1">
                    <button onClick={() => setAiStep(AI_STEPS.UPLOAD)} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                      Ganti File
                    </button>
                    <button onClick={() => setAiStep(AI_STEPS.PREVIEW)} disabled={activeMappingCount === 0} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition-all disabled:opacity-40 flex items-center gap-2">
                      Preview Data
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4 — Preview */}
              {aiStep === AI_STEPS.PREVIEW && aiAnalysis && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-0.5">Preview 5 baris pertama</p>
                    <p className="text-xs text-slate-400">Periksa data sebelum diimport ke database</p>
                  </div>

                  <div className="border border-slate-100 rounded-xl overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          {aiDbSchema.filter(s => aiMapping[s.column] && aiMapping[s.column].type !== 'none' && aiMapping[s.column].value !== '').map(s => (
                            <th key={s.column} className="px-3 py-2 text-left font-bold text-slate-600 whitespace-nowrap">
                              {s.column}
                              <span className="text-slate-400 font-normal ml-1">
                                ({aiMapping[s.column].type === 'fixed' ? 'Manual' : aiMapping[s.column].value})
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {aiAnalysis.preview_rows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            {aiDbSchema.filter(s => aiMapping[s.column] && aiMapping[s.column].type !== 'none' && aiMapping[s.column].value !== '').map(s => {
                              const mapData = aiMapping[s.column];
                              const val = mapData.type === 'fixed' ? mapData.value : (row[mapData.value] || <span className="text-slate-300">—</span>);
                              return (
                                <td key={s.column} className="px-3 py-3 text-slate-600 whitespace-nowrap max-w-35 truncate font-medium">
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
                    <strong>Total {aiAnalysis.total_rows} baris</strong> akan diimport. Proses ini tidak dapat dibatalkan.
                  </div>

                  {aiError && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{aiError}</div>}

                  <div className="flex items-center justify-between pt-1">
                    <button onClick={() => setAiStep(AI_STEPS.MAPPING)} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                      Edit Mapping
                    </button>
                    <button onClick={handleAiExecute} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition-all flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      Import {aiAnalysis.total_rows} Data
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5 — Importing */}
              {aiStep === AI_STEPS.IMPORTING && (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                  </div>
                  <div className="text-center w-full max-w-md">
                    <p className="text-slate-800 font-bold text-lg mb-1">Mengimport data...</p>
                    
                    {importProgress ? (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>{Math.round((importProgress.current / (importProgress.total || 1)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                          <div 
                            className="bg-slate-800 h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${(importProgress.current / (importProgress.total || 1)) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-slate-500 text-xs font-medium">
                          Memproses {importProgress.current} dari {importProgress.total} baris... 
                          <span className="text-emerald-600 ml-1">({importProgress.success} Sukses)</span>
                          {importProgress.fail > 0 && <span className="text-red-500 ml-1">({importProgress.fail} Gagal)</span>}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">Sedang mempersiapkan data ke database, mohon tunggu</p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 6 — Result */}
              {aiStep === AI_STEPS.RESULT && aiResult && (
                <div className="space-y-4">
                  <div className={`rounded-2xl p-6 text-center ${aiResult.fail_count === 0 ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${aiResult.fail_count === 0 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      <svg className={`w-8 h-8 ${aiResult.fail_count === 0 ? 'text-emerald-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={aiResult.fail_count === 0 ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                      </svg>
                    </div>
                    <h4 className={`text-xl font-bold mb-1 ${aiResult.fail_count === 0 ? 'text-emerald-800' : 'text-amber-800'}`}>
                      {aiResult.fail_count === 0 ? 'Import Berhasil!' : 'Import Selesai'}
                    </h4>
                    <p className={`text-sm ${aiResult.fail_count === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>{aiResult.message}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-emerald-600">{aiResult.success_count}</p>
                      <p className="text-xs text-emerald-500 font-semibold mt-1">Berhasil Diimport</p>
                    </div>
                    <div className={`border rounded-xl p-4 text-center ${aiResult.fail_count > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                      <p className={`text-3xl font-bold ${aiResult.fail_count > 0 ? 'text-red-600' : 'text-slate-400'}`}>{aiResult.fail_count}</p>
                      <p className={`text-xs font-semibold mt-1 ${aiResult.fail_count > 0 ? 'text-red-500' : 'text-slate-400'}`}>Gagal</p>
                    </div>
                  </div>

                  {aiResult.errors?.length > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-red-700 mb-2">Detail Error:</p>
                      <ul className="space-y-1">
                        {aiResult.errors.map((err, i) => <li key={i} className="text-xs text-red-600">• {err}</li>)}
                      </ul>
                    </div>
                  )}

                  <button onClick={() => setIsAiWizardOpen(false)} className="w-full py-3 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition-all">
                    Tutup &amp; Lihat Data
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── Selection Modal ──────────────────────────────────────────────────── */}
      {isSelectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Pilih Metode Input</h3>
              <button onClick={() => setIsSelectionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={openFormForCreate} className="flex flex-col items-center p-6 border-2 border-slate-100 rounded-2xl hover:border-slate-800 hover:bg-slate-50 transition-all group">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-1">Input Manual</h4>
                <p className="text-sm text-slate-500 text-center">Isi data siswa satu per satu</p>
              </button>
              <button onClick={openAiWizardFromSelection} className="flex flex-col items-center p-6 border-2 border-violet-100 rounded-2xl hover:border-violet-500 hover:bg-violet-50/40 transition-all group">
                <div className="w-14 h-14 bg-linear-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-1">Import + AI</h4>
                <p className="text-sm text-slate-500 text-center">Upload Excel — AI petakan kolom otomatis</p>
                <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">Powered by OpenRouter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Form Modal ───────────────────────────────────────────────────────── */}
      {isFormModalOpen && formSiswa && (() => {
        const activeTA = tahunAjaranList.find(t => t.is_active === 1 || t.is_active === true);
        const selectedTA = tahunAjaranList.find(t => t.id === Number(formSiswa.tahun_ajaran_id));
        let diff = -1;
        let autoGradYear = '';
        if (activeTA && selectedTA) {
          const getStartYear = (str) => parseInt(str?.substring(0, 4) || "0", 10);
          const startYear = getStartYear(selectedTA.tahun);
          diff = getStartYear(activeTA.tahun) - startYear;
          if (diff >= 3) autoGradYear = startYear + 3;
        }

        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">{formSiswa.id ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
              <button onClick={() => { setIsFormModalOpen(false); setFormSiswa(null); }} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* NIS */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">NIS</label>
                  <input type="text" placeholder="Kosongkan agar di-generate otomatis" value={formSiswa.nis || ''} onChange={e => setFormSiswa(prev => ({ ...prev, nis: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                  <p className="text-xs text-slate-400 mt-1">Kosongkan jika ingin digenerate oleh sistem sesuai dengan format Management NIS.</p>
                </div>

                {/* Tahun Ajaran */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                  <select value={formSiswa.tahun_ajaran_id || ''} onChange={e => setFormSiswa(prev => ({ ...prev, tahun_ajaran_id: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600">
                    <option value="">— Pilih Tahun Ajaran —</option>
                    {tahunAjaranList.map(ta => (
                      <option key={ta.id} value={ta.id}>{ta.tahun} {ta.is_active ? '(Aktif)' : ''}</option>
                    ))}
                  </select>
                </div>

                {/* History Kelas (Dinamis berdasarkan Tahun Ajaran) */}
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(() => {
                    return (
                      <>
                        {diff >= 0 && (
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Kelas 10</label>
                            <select value={formSiswa.kelas_10 || ''} onChange={e => setFormSiswa(prev => ({ ...prev, kelas_10: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600">
                              <option value="">— Pilih Kelas 10 —</option>
                              {kelasList.filter(k => String(k.tingkat) === '10' || String(k.nama_kelas).startsWith('X.') || String(k.nama_kelas).startsWith('X-')).map(k => (
                                <option key={k.id} value={k.nama_kelas}>{k.nama_kelas}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {diff >= 1 && (
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Kelas 11</label>
                            <select value={formSiswa.kelas_11 || ''} onChange={e => setFormSiswa(prev => ({ ...prev, kelas_11: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600">
                              <option value="">— Pilih Kelas 11 —</option>
                              {kelasList.filter(k => String(k.tingkat) === '11' || String(k.nama_kelas).startsWith('XI.') || String(k.nama_kelas).startsWith('XI-')).map(k => (
                                <option key={k.id} value={k.nama_kelas}>{k.nama_kelas}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {diff >= 2 && (
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Kelas 12</label>
                            <select value={formSiswa.kelas_12 || ''} onChange={e => setFormSiswa(prev => ({ ...prev, kelas_12: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600">
                              <option value="">— Pilih Kelas 12 —</option>
                              {kelasList.filter(k => String(k.tingkat) === '12' || String(k.nama_kelas).startsWith('XII.') || String(k.nama_kelas).startsWith('XII-')).map(k => (
                                <option key={k.id} value={k.nama_kelas}>{k.nama_kelas}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>


                {/* NISN */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">NISN</label>
                  <input type="text" value={formSiswa.nisn || ''} onChange={e => setFormSiswa(prev => ({ ...prev, nisn: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                </div>

                {/* Tahun Lulus (Otomatis Muncul) */}
                {diff >= 3 && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tahun Lulus</label>
                    <input 
                      type="number" 
                      placeholder={autoGradYear ? String(autoGradYear) : ''}
                      value={formSiswa.tahun_lulus || autoGradYear || ''} 
                      onChange={e => setFormSiswa(prev => ({ ...prev, tahun_lulus: e.target.value }))} 
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" 
                    />
                  </div>
                )}

                {/* Nama Lengkap */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                  <input type="text" value={formSiswa.nama_lengkap || ''} onChange={e => setFormSiswa(prev => ({ ...prev, nama_lengkap: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select value={formSiswa.jenis_kelamin || ''} onChange={e => setFormSiswa(prev => ({ ...prev, jenis_kelamin: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600">
                    <option value="">— Pilih —</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                {/* Tempat Lahir */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                  <input type="text" value={formSiswa.tempat_lahir || ''} onChange={e => setFormSiswa(prev => ({ ...prev, tempat_lahir: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input type="date" value={formSiswa.tanggal_lahir || ''} onChange={e => setFormSiswa(prev => ({ ...prev, tanggal_lahir: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                </div>

                {/* Agama */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Agama</label>
                  <select value={formSiswa.agama || ''} onChange={e => setFormSiswa(prev => ({ ...prev, agama: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600">
                    <option value="">— Pilih —</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>

                {/* Nomor HP */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor HP</label>
                  <input type="text" value={formSiswa.nomor_hp || ''} onChange={e => setFormSiswa(prev => ({ ...prev, nomor_hp: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" value={formSiswa.email || ''} onChange={e => setFormSiswa(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                </div>

                {/* Alamat */}
                <div className="sm:col-span-2 border-t border-slate-100 pt-5 mt-4">
                  <p className="text-sm font-bold text-slate-700 mb-4">Detail Alamat & Tempat Tinggal</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Jalan / Alamat Lengkap</label>
                      <textarea rows={2} value={formSiswa.alamat || ''} onChange={e => setFormSiswa(prev => ({ ...prev, alamat: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">RT / RW</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="RT" value={formSiswa.rt || ''} onChange={e => setFormSiswa(prev => ({ ...prev, rt: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                        <input type="text" placeholder="RW" value={formSiswa.rw || ''} onChange={e => setFormSiswa(prev => ({ ...prev, rw: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Dusun</label>
                      <input type="text" value={formSiswa.dusun || ''} onChange={e => setFormSiswa(prev => ({ ...prev, dusun: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Kelurahan / Desa</label>
                      <input type="text" value={formSiswa.kelurahan || ''} onChange={e => setFormSiswa(prev => ({ ...prev, kelurahan: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Kode Pos</label>
                      <input type="text" value={formSiswa.kode_pos || ''} onChange={e => setFormSiswa(prev => ({ ...prev, kode_pos: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Tinggal</label>
                      <select value={formSiswa.jenis_tinggal || ''} onChange={e => setFormSiswa(prev => ({ ...prev, jenis_tinggal: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white">
                        <option value="">— Pilih —</option>
                        <option value="Bersama Orang Tua">Bersama Orang Tua</option>
                        <option value="Bersama Wali">Bersama Wali</option>
                        <option value="Kos">Kos</option>
                        <option value="Asrama">Asrama</option>
                        <option value="Panti Asuhan">Panti Asuhan</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Alat Transportasi</label>
                      <select value={formSiswa.alat_transportasi || ''} onChange={e => setFormSiswa(prev => ({ ...prev, alat_transportasi: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white">
                        <option value="">— Pilih —</option>
                        <option value="Jalan Kaki">Jalan Kaki</option>
                        <option value="Sepeda">Sepeda</option>
                        <option value="Sepeda Motor">Sepeda Motor</option>
                        <option value="Mobil Pribadi">Mobil Pribadi</option>
                        <option value="Antar Jemput Sekolah">Antar Jemput Sekolah</option>
                        <option value="Angkutan Umum">Angkutan Umum</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Lintang (Latitude)</label>
                      <input type="text" value={formSiswa.lintang || ''} onChange={e => setFormSiswa(prev => ({ ...prev, lintang: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Bujur (Longitude)</label>
                      <input type="text" value={formSiswa.bujur || ''} onChange={e => setFormSiswa(prev => ({ ...prev, bujur: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                    </div>
                  </div>
                </div>

                {/* Status Aktif */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select value={formSiswa.is_active ? '1' : '0'} onChange={e => setFormSiswa(prev => ({ ...prev, is_active: e.target.value === '1' }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600">
                    <option value="1">Aktif</option>
                    <option value="0">Alumni</option>
                  </select>
                </div>

              </div>

              {/* Separator KPS / KIP */}
              <div className="mt-6 mb-4 border-t border-slate-100 pt-5">
                <p className="text-sm font-bold text-slate-700 mb-4">Data KPS &amp; KIP</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Penerima KPS */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Penerima KPS</label>
                    <select value={formSiswa.penerima_kps ? '1' : '0'} onChange={e => setFormSiswa(prev => ({ ...prev, penerima_kps: e.target.value === '1' }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600">
                      <option value="0">Tidak</option>
                      <option value="1">Ya</option>
                    </select>
                  </div>

                  {/* Nomor KPS */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor KPS</label>
                    <input type="text" value={formSiswa.nomor_kps || ''} onChange={e => setFormSiswa(prev => ({ ...prev, nomor_kps: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                  </div>

                  {/* Penerima KIP */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Penerima KIP</label>
                    <select value={formSiswa.penerima_kip ? '1' : '0'} onChange={e => setFormSiswa(prev => ({ ...prev, penerima_kip: e.target.value === '1' }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600">
                      <option value="0">Tidak</option>
                      <option value="1">Ya</option>
                    </select>
                  </div>

                  {/* Nomor KIP */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor KIP</label>
                    <input type="text" value={formSiswa.nomor_kip || ''} onChange={e => setFormSiswa(prev => ({ ...prev, nomor_kip: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                  </div>

                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 flex justify-end gap-3">
              <button onClick={() => { setIsFormModalOpen(false); setFormSiswa(null); }} className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                Batal
              </button>
              <button onClick={handleFormSubmit} disabled={isSaving} className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition-all disabled:opacity-40 flex items-center gap-2">
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── View Detail Modal ──────────────────────────────────────────────────── */}
      {isViewModalOpen && viewSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Detail Siswa</h3>
              <button onClick={() => { setIsViewModalOpen(false); setViewSiswa(null); }} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <DetailField label="NIS" value={viewSiswa.nis} highlight />
                <DetailField label="NISN" value={viewSiswa.nisn} />
                <DetailField label="Nama Lengkap" value={viewSiswa.nama_lengkap} highlight />
                <DetailField label="Kelas Saat Ini" value={viewSiswa.kelas} />
                <DetailField label="Kelas 10" value={viewSiswa.kelas_10} />
                <DetailField label="Kelas 11" value={viewSiswa.kelas_11} />
                <DetailField label="Kelas 12" value={viewSiswa.kelas_12} />
                <DetailField label="Jenis Kelamin" value={viewSiswa.jenis_kelamin === 'L' ? 'Laki-laki' : viewSiswa.jenis_kelamin === 'P' ? 'Perempuan' : '-'} />
                <DetailField label="Tempat Lahir" value={viewSiswa.tempat_lahir} />
                <DetailField label="Tanggal Lahir" value={viewSiswa.tanggal_lahir ? new Date(viewSiswa.tanggal_lahir).toLocaleDateString('id-ID') : '-'} />
                <DetailField label="Nomor HP" value={viewSiswa.nomor_hp} />
                <DetailField label="Email" value={viewSiswa.email} />
                <DetailField label="Tahun Masuk" value={viewSiswa.tahun_masuk} />
                <DetailField label="Tahun Ajaran" value={viewSiswa.tahun_ajaran?.tahun} />
                <DetailField label="Status" value={viewSiswa.is_active ? 'Aktif' : 'Alumni'} />
                <DetailField label="Tahun Lulus" value={viewSiswa.tahun_lulus} />
                <DetailField label="Penerima KPS" value={viewSiswa.penerima_kps ? 'Ya' : 'Tidak'} />
                <DetailField label="Nomor KPS" value={viewSiswa.nomor_kps} />
                <DetailField label="Penerima KIP" value={viewSiswa.penerima_kip ? 'Ya' : 'Tidak'} />
                <DetailField label="Nomor KIP" value={viewSiswa.nomor_kip} />
                <div className="sm:col-span-2">
                  <DetailField label="Alamat" value={viewSiswa.alamat} />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setIsViewModalOpen(false); setViewSiswa(null); }} className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Tutup</button>
                <button onClick={() => { setIsViewModalOpen(false); openFormForEdit(viewSiswa); }} className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition-all">
                  Edit Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Edit Modal ───────────────────────────────────────────────────── */}
      {isBulkEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Edit ({selectedIds.size} siswa)</h3>
              <button onClick={() => setIsBulkEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="px-6 pt-5 pb-2">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setBulkEditMode('massal')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${bulkEditMode === 'massal' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Edit Massal
                </button>
                <button
                  onClick={() => setBulkEditMode('per-user')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${bulkEditMode === 'per-user' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Edit Per-User
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {bulkEditMode === 'massal'
                  ? 'Semua siswa yang dipilih akan mendapatkan nilai yang sama.'
                  : 'Edit data masing-masing siswa secara terpisah.'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-3">
              {bulkEditMode === 'massal' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                    <select value={bulkEditData.is_active} onChange={e => setBulkEditData(prev => ({ ...prev, is_active: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600">
                      <option value="">— Tidak diubah —</option>
                      <option value="1">Aktif</option>
                      <option value="0">Alumni</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {[...selectedIds].map(id => {
                    const s = perUserData[id];
                    if (!s) return null;
                    return (
                      <div key={id} className="border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                          <p className="text-sm font-bold text-slate-700">{s.nama_lengkap || 'Tanpa Nama'} <span className="font-mono text-slate-400 font-normal">({s.nis || '-'})</span></p>
                        </div>
                        <div className="p-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">NIS</label>
                              <input type="text" value={s.nis || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], nis: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas</label>
                              <select value={s.kelas || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], kelas: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm">
                                <option value="">— Pilih —</option>
                                <option value="X">X</option>
                                <option value="XI">XI</option>
                                <option value="XII">XII</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                              <input type="text" value={s.nama_lengkap || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], nama_lengkap: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                              <select value={s.jenis_kelamin || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], jenis_kelamin: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm">
                                <option value="">— Pilih —</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">NISN</label>
                              <input type="text" value={s.nisn || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], nisn: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                              <input type="text" value={s.tempat_lahir || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], tempat_lahir: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                              <input type="date" value={s.tanggal_lahir || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], tanggal_lahir: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Agama</label>
                              <select value={s.agama || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], agama: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm">
                                <option value="">— Pilih —</option>
                                <option value="Islam">Islam</option>
                                <option value="Kristen">Kristen</option>
                                <option value="Katolik">Katolik</option>
                                <option value="Hindu">Hindu</option>
                                <option value="Buddha">Buddha</option>
                                <option value="Konghucu">Konghucu</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor HP</label>
                              <input type="text" value={s.nomor_hp || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], nomor_hp: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                              <input type="email" value={s.email || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], email: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat</label>
                              <textarea rows={2} value={s.alamat || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], alamat: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm resize-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                              <select value={s.is_active ? '1' : '0'} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], is_active: e.target.value === '1' } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm">
                                <option value="1">Aktif</option>
                                <option value="0">Alumni</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Penerima KPS</label>
                              <select value={s.penerima_kps ? '1' : '0'} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], penerima_kps: e.target.value === '1' } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm">
                                <option value="0">Tidak</option>
                                <option value="1">Ya</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor KPS</label>
                              <input type="text" value={s.nomor_kps || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], nomor_kps: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Penerima KIP</label>
                              <select value={s.penerima_kip ? '1' : '0'} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], penerima_kip: e.target.value === '1' } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm">
                                <option value="0">Tidak</option>
                                <option value="1">Ya</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor KIP</label>
                              <input type="text" value={s.nomor_kip || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], nomor_kip: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsBulkEditModalOpen(false)} className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                Batal
              </button>
              <button onClick={handleBulkUpdate} disabled={isBulkSaving} className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition-all disabled:opacity-40 flex items-center gap-2">
                {isBulkSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

    </div>
  );
};

export default Siswa;
