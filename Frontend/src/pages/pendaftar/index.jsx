import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-blue-500' };
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white shadow-2xl shadow-slate-900/20 animate-fade-up ${colors[type] || colors.info}`}>
      {type === 'success' && <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
      {type === 'error' && <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

// ─── AI Step constants ────────────────────────────────────────────────────────
const AI_STEPS = { UPLOAD: 1, ANALYZING: 2, MAPPING: 3, PREVIEW: 4, IMPORTING: 5, RESULT: 6 };
const STEP_LABELS = ['Upload', 'Analisis AI', 'Mapping', 'Preview', 'Import'];

// ─── Options Constants ────────────────────────────────────────────────────────
const PENDIDIKAN_OPTIONS = [
  'Tidak Sekolah', 'SD / Sederajat', 'SMP / Sederajat', 'SMA / Sederajat',
  'D1 / D2 / D3', 'D4 / S1', 'S2', 'S3'
];
const PENGHASILAN_OPTIONS = [
  'Kurang dari Rp 1.000.000',
  'Rp 1.000.000 - Rp 2.000.000',
  'Rp 2.000.001 - Rp 3.000.000',
  'Rp 3.000.001 - Rp 5.000.000',
  'Rp 5.000.001 - Rp 10.000.000',
  'Lebih dari Rp 10.000.000'
];

// ─── Detail Field (read-only) ──────────────────────────────────────────────────
const DetailField = ({ label, value, highlight }) => (
  <div>
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
    <p className={`text-sm ${highlight ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{value || '-'}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Pendaftar = () => {
  const { can } = useAuth();
  const [candidates, setCandidates]   = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);
  const [toast, setToast]             = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // modals
  const [isModalOpen, setIsModalOpen]               = useState(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate]     = useState(null);
  const [viewCandidate, setViewCandidate]           = useState(null);
  const [isViewModalOpen, setIsViewModalOpen]       = useState(false);

  // Parent form logic
  const [parentType, setParentType] = useState('none');
  useEffect(() => {
    if (currentCandidate) {
      if (currentCandidate.nama_ayah || currentCandidate.nama_ibu) setParentType('ayah_ibu');
      else if (currentCandidate.nama_wali) setParentType('wali');
      else setParentType('none');
    } else {
      setParentType('none');
    }
  }, [currentCandidate]);

  const checkParentMode = (e) => {
    const form = e.target.closest('form') || e.target.closest('.bulk-edit-row');
    if (!form) return;
    const isAyahIbu = ['nama_ayah','pekerjaan_ayah','no_hp_ayah','alamat_ayah','pendidikan_ayah','penghasilan_ayah','nama_ibu','pekerjaan_ibu','no_hp_ibu','alamat_ibu','pendidikan_ibu','penghasilan_ibu'].some(name => form.querySelector(`[name="${name}"]`)?.value);
    const isWali = ['nama_wali','pekerjaan_wali','no_hp_wali','alamat_wali','pendidikan_wali','penghasilan_wali'].some(name => form.querySelector(`[name="${name}"]`)?.value);
    
    if (isAyahIbu) setParentType('ayah_ibu');
    else if (isWali) setParentType('wali');
    else setParentType('none');
  };

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

  // Batch selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState('massal');
  const [bulkEditData, setBulkEditData] = useState({ status: '', jalur: '' });
  const [perUserData, setPerUserData] = useState({});
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterJalur, setFilterJalur] = useState('');

  const showToast = (message, type = 'info') => setToast({ message, type });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/pendaftaran`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCandidates(Array.isArray(data) ? data : (data.data || []));
      else if (res.status === 404) setCandidates([]);
      else setError(data.message || 'Gagal mengambil data');
    } catch { setError('Terjadi kesalahan koneksi'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCandidates(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterStatus, filterJalur]);

  const filteredCandidates = candidates.filter(c => {
    const matchSearch = !searchQuery ||
      c.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nisn?.includes(searchQuery) ||
      c.no_pendaftaran?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nik?.includes(searchQuery) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nomor_hp?.includes(searchQuery);
    const matchStatus = !filterStatus || c.status === filterStatus;
    const matchJalur = !filterJalur || c.jalur === filterJalur;
    return matchSearch && matchStatus && matchJalur;
  });

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleCreate = async (formData) => {
    setIsLoading(true);
    const payload = { ...formData };
    if (!payload.no_pendaftaran?.trim()) delete payload.no_pendaftaran;
    try {
      const res  = await fetch(`${API_BASE_URL}/api/pendaftaran`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) { setIsModalOpen(false); showToast('Data pendaftar berhasil disimpan!', 'success'); fetchCandidates(); }
      else showToast(data.message || 'Gagal menyimpan data', 'error');
    } catch { showToast('Terjadi kesalahan koneksi', 'error'); }
    finally { setIsLoading(false); }
  };

  const handleUpdate = async (id, formData) => {
    setIsLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/pendaftaran/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) { setIsModalOpen(false); setCurrentCandidate(null); showToast('Data berhasil diperbarui!', 'success'); fetchCandidates(); }
      else showToast(data.message || 'Gagal memperbarui data', 'error');
    } catch { showToast('Terjadi kesalahan koneksi', 'error'); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/pendaftaran/${id}`, {
        method: 'DELETE', headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      if (res.ok) { showToast('Data berhasil dihapus!', 'success'); fetchCandidates(); }
      else showToast('Gagal menghapus data', 'error');
    } catch { showToast('Terjadi kesalahan koneksi', 'error'); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (currentCandidate) handleUpdate(currentCandidate.id, data);
    else handleCreate(data);
  };

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openModalForCreate = () => { setIsSelectionModalOpen(false); setCurrentCandidate(null); setIsModalOpen(true); };
  const openModalForEdit   = (c) => { setCurrentCandidate(c); setIsModalOpen(true); };
  const openViewModal      = (c) => { setViewCandidate(c); setIsViewModalOpen(true); };

  const openAiWizard = () => {
    setAiHeaderRow(0); setAiDbSchema([]);
    setIsSelectionModalOpen(false);
    setAiStep(AI_STEPS.UPLOAD);
    setAiFile(null); setAiAnalysis(null); setAiMapping({}); setAiResult(null); setAiError('');
    setIsAiWizardOpen(true);
  };

  // ── Template download ──────────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['nisn', 'nama_lengkap', 'nama_ayah', 'pekerjaan_ayah', 'pendidikan_ayah', 'penghasilan_ayah', 'no_hp_ayah', 'alamat_ayah', 'nama_ibu', 'pekerjaan_ibu', 'pendidikan_ibu', 'penghasilan_ibu', 'no_hp_ibu', 'alamat_ibu', 'nama_wali', 'pekerjaan_wali', 'pendidikan_wali', 'penghasilan_wali', 'no_hp_wali', 'alamat_wali', 'asal_sekolah', 'alamat', 'jalur'],
      ['1234567890', 'Nama Siswa Contoh', 'Ayah', 'Pekerjaan', 'D4 / S1', 'Rp 3.000.001 - Rp 5.000.000', '081', 'Alamat Ayah', 'Ibu', 'Pekerjaan', 'SMA / Sederajat', 'Rp 1.000.000 - Rp 2.000.000', '082', 'Alamat Ibu', '', '', '', '', '', '', 'SMPN 1 Pamekasan', 'Jl. Contoh No. 1 Pamekasan', 'zonasi'],
    ]);
    ws['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 40 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Pendaftar');
    XLSX.writeFile(wb, 'template_pendaftar.xlsx');
  };

  // ── AI Wizard ──────────────────────────────────────────────────────────────
  const handleAiAnalyze = async () => {
    if (!aiFile) return;
    setAiStep(AI_STEPS.ANALYZING);
    setAiError('');
    const fd = new FormData();
    fd.append('file', aiFile);
    fd.append('target_table', 'pendaftarans');
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
    setAiStep(AI_STEPS.IMPORTING);
    setImportProgress({ current: 0, total: 0, success: 0, fail: 0 });
    const fd = new FormData();
    fd.append('file', aiFile);
    fd.append('target_table', 'pendaftarans');
    fd.append('mapping', JSON.stringify(aiMapping));
    fd.append('header_row', String(aiHeaderRow));
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
              } catch (e) {
                // ignore JSON parse error for incomplete chunks
              }
            }
          }
        }
      }

      if (finalData) {
        setAiResult(finalData);
        setAiStep(AI_STEPS.RESULT);
        fetchCandidates();
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

  // ── Batch Selection ─────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedCandidates.map(c => c.id);
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
    if (!window.confirm(`Yakin ingin menghapus ${selectedIds.size} data pendaftar?`)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/pendaftaran/bulk-delete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ ids: [...selectedIds] }),
      });
      if (response.ok) {
        showToast(`${selectedIds.size} data pendaftar berhasil dihapus`, 'success');
        clearSelection();
        fetchCandidates();
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
    setBulkEditData({ status: '', jalur: '' });
    const initial = {};
    candidates.filter(c => selectedIds.has(c.id)).forEach(c => {
      initial[c.id] = { ...c };
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
        if (bulkEditData.status) payload.status = bulkEditData.status;
        if (bulkEditData.jalur) payload.jalur = bulkEditData.jalur;
        if (Object.keys(payload).length === 0) {
          showToast('Pilih setidaknya satu field untuk diubah', 'error');
          setIsBulkSaving(false);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/pendaftaran/bulk-update`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ ids: [...selectedIds], data: payload }),
        });
        if (response.ok) {
          showToast(`${selectedIds.size} data pendaftar berhasil diperbarui`, 'success');
        } else {
          const data = await response.json();
          showToast(data.message || 'Gagal memperbarui data', 'error');
          setIsBulkSaving(false);
          return;
        }
      } else {
        const updates = [];
        for (const id of selectedIds) {
          const orig = candidates.find(c => c.id === id);
          const edited = perUserData[id];
          if (!orig || !edited) continue;
          const data = {};
          const fields = [
            'no_pendaftaran', 'nisn', 'nama_lengkap', 'jenis_kelamin',
            'nama_ayah', 'pekerjaan_ayah', 'pendidikan_ayah', 'penghasilan_ayah', 'no_hp_ayah', 'alamat_ayah',
            'nama_ibu', 'pekerjaan_ibu', 'pendidikan_ibu', 'penghasilan_ibu', 'no_hp_ibu', 'alamat_ibu',
            'nama_wali', 'pekerjaan_wali', 'pendidikan_wali', 'penghasilan_wali', 'no_hp_wali', 'alamat_wali',
            'tempat_lahir', 'tanggal_lahir', 'nik', 'agama',
            'asal_sekolah', 'kecamatan', 'alamat', 'rt', 'rw', 'dusun', 'kelurahan', 'kode_pos', 'jenis_tinggal', 'alat_transportasi', 'lintang', 'bujur', 'email', 'nomor_hp',
            'status', 'jalur',
          ];
          fields.forEach(f => {
            if (String(edited[f] || '') !== String(orig[f] || '')) {
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
        const response = await fetch(`${API_BASE_URL}/api/pendaftaran/bulk-update-per-user`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ updates }),
        });
        if (response.ok) {
          showToast(`${updates.length} data pendaftar berhasil diperbarui`, 'success');
        } else {
          const data = await response.json();
          showToast(data.message || 'Gagal memperbarui data', 'error');
          setIsBulkSaving(false);
          return;
        }
      }
      setIsBulkEditModalOpen(false);
      clearSelection();
      fetchCandidates();
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setIsBulkSaving(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getStatusColor = (s) => ({ diterima: 'bg-emerald-50 text-emerald-500 border-emerald-100', ditolak: 'bg-red-50 text-red-500 border-red-100', pending: 'bg-amber-50 text-amber-500 border-amber-100' }[s] || 'bg-slate-50 text-slate-500 border-slate-100');
  const getStatusText  = (s) => ({ diterima: 'Diterima', ditolak: 'Ditolak', pending: 'Menunggu' }[s] || 'Menunggu');
  const getJalurClass  = (j) => ({ zonasi: 'bg-blue-50 text-blue-600 border-blue-100', afirmasi: 'bg-purple-50 text-purple-600 border-purple-100', prestasi: 'bg-amber-50 text-amber-600 border-amber-100' }[j] || 'bg-slate-50 text-slate-600 border-slate-100');

  const activeMappingCount = Object.values(aiMapping).filter(m => m && m.type !== 'none' && m.value !== '').length;
  const inactiveMappingCount = aiDbSchema.length - activeMappingCount;

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-slate-800">Data Pendaftar</h2>
            <p className="text-slate-500 text-sm">Kelola data calon siswa baru SMAN 1 Pamekasan.</p>
          </div>
          {can('pendaftaran', 'create') && (
            <button
              onClick={() => setIsSelectionModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tambah Pendaftaran
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up delay-75">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <h3 className="text-[16px] font-bold text-slate-800 shrink-0">Daftar Calon Siswa</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Status */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 text-slate-600 bg-white">
              <option value="">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="diterima">Diterima</option>
              <option value="ditolak">Ditolak</option>
            </select>
            {/* Filter Jalur */}
            <select value={filterJalur} onChange={e => setFilterJalur(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 text-slate-600 bg-white">
              <option value="">Semua Jalur</option>
              <option value="zonasi">Zonasi</option>
              <option value="afirmasi">Afirmasi</option>
              <option value="prestasi">Prestasi</option>
              <option value="perpindahan_tugas">Perpindahan Tugas</option>
            </select>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama / NISN..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-slate-600"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>

        {/* Batch Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 animate-fade-up">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-800"></span>
              <span className="text-sm font-semibold text-slate-700">{selectedIds.size} pendaftar dipilih</span>
              <button onClick={clearSelection} className="text-xs text-slate-400 hover:text-slate-600 ml-1 font-medium">Batal</button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={openBulkEdit} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit Massal
              </button>
              <button onClick={handleBulkDelete} className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Hapus Massal
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin" />
              <p className="text-sm font-medium">Memuat data...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-500">
              <p>{error}</p>
              <button onClick={fetchCandidates} className="mt-2 text-blue-500 underline text-sm">Coba lagi</button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-10">
                    <input
                      type="checkbox"
                      checked={paginatedCandidates.length > 0 && paginatedCandidates.every(c => selectedIds.has(c.id))}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500/20 cursor-pointer"
                    />
                  </th>
                  <th className="pb-3 pl-2">No. Pendaftaran</th>
                  <th className="pb-3">NISN</th>
                  <th className="pb-3">Nama Lengkap</th>
                  <th className="pb-3">JK</th>
                  <th className="pb-3">Asal Sekolah</th>
                  <th className="pb-3">Kecamatan</th>
                  <th className="pb-3">Jalur</th>
                  <th className="pb-3">Tgl Daftar</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-600">
                {paginatedCandidates.map(item => (
                  <tr key={item.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${selectedIds.has(item.id) ? 'bg-slate-50' : ''}`}>
                    <td className="py-4 pl-2 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500/20 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 pl-2 font-medium text-slate-400">{item.no_pendaftaran || '-'}</td>
                    <td className="py-4">{item.nisn || '-'}</td>
                    <td className="py-4 font-bold text-slate-700">{item.nama_lengkap}</td>
                    <td className="py-4 text-slate-500">
                      {item.jenis_kelamin ? (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold border ${item.jenis_kelamin === 'L' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-pink-50 text-pink-600 border-pink-200'}`}>
                          {item.jenis_kelamin}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-4">{item.asal_sekolah}</td>
                    <td className="py-4 text-slate-500">{item.kecamatan || '-'}</td>
                    <td className="py-4">
                      {item.jalur
                        ? <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getJalurClass(item.jalur)}`}>{item.jalur.replace('_', ' ')}</span>
                        : '-'}
                    </td>
                    <td className="py-4 text-slate-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status || 'pending')}`}>
                        {getStatusText(item.status || 'pending')}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        {can('pendaftaran', 'view') && (
                          <button onClick={() => openViewModal(item)} className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                        )}
                        {can('pendaftaran', 'edit') && (
                          <button onClick={() => openModalForEdit(item)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        )}
                        {can('pendaftaran', 'delete') && (
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan="11" className="py-12 text-center text-slate-400">
                      <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      {searchQuery ? 'Tidak ada data yang cocok dengan pencarian.' : 'Tidak ada data pendaftar.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredCandidates.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
            <p className="text-xs text-slate-500">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredCandidates.length)} dari {filteredCandidates.length} pendaftar
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
              {/* Manual */}
              <button onClick={openModalForCreate} className="flex flex-col items-center p-6 border-2 border-slate-100 rounded-2xl hover:border-slate-800 hover:bg-slate-50 transition-all group">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-1">Input Manual</h4>
                <p className="text-sm text-slate-500 text-center">Isi form pendaftaran satu per satu</p>
              </button>
              {/* AI Import */}
              <button onClick={openAiWizard} className="flex flex-col items-center p-6 border-2 border-violet-100 rounded-2xl hover:border-violet-500 hover:bg-violet-50/40 transition-all group">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                                <td key={s.column} className="px-3 py-3 text-slate-600 whitespace-nowrap max-w-[140px] truncate font-medium">
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

      {/* ── View Detail Modal ──────────────────────────────────────────────────── */}
      {isViewModalOpen && viewCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Detail Pendaftar</h3>
              <button onClick={() => { setIsViewModalOpen(false); setViewCandidate(null); }} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <DetailField label="No. Pendaftaran" value={viewCandidate.no_pendaftaran} />
                <DetailField label="NISN" value={viewCandidate.nisn} />
                <DetailField label="Nama Lengkap" value={viewCandidate.nama_lengkap} highlight />
                <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100"><h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Data Ayah</h4></div>
                <DetailField label="Nama Ayah" value={viewCandidate.nama_ayah} />
                <DetailField label="Pekerjaan Ayah" value={viewCandidate.pekerjaan_ayah} />
                <DetailField label="Pendidikan Ayah" value={viewCandidate.pendidikan_ayah} />
                <DetailField label="Penghasilan Ayah" value={viewCandidate.penghasilan_ayah} />
                <DetailField label="No HP Ayah" value={viewCandidate.no_hp_ayah} />
                <div className="sm:col-span-2"><DetailField label="Alamat Ayah" value={viewCandidate.alamat_ayah} /></div>
                
                <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100"><h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Data Ibu</h4></div>
                <DetailField label="Nama Ibu" value={viewCandidate.nama_ibu} />
                <DetailField label="Pekerjaan Ibu" value={viewCandidate.pekerjaan_ibu} />
                <DetailField label="Pendidikan Ibu" value={viewCandidate.pendidikan_ibu} />
                <DetailField label="Penghasilan Ibu" value={viewCandidate.penghasilan_ibu} />
                <DetailField label="No HP Ibu" value={viewCandidate.no_hp_ibu} />
                <div className="sm:col-span-2"><DetailField label="Alamat Ibu" value={viewCandidate.alamat_ibu} /></div>

                <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100"><h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Data Wali</h4></div>
                <DetailField label="Nama Wali" value={viewCandidate.nama_wali} />
                <DetailField label="Pekerjaan Wali" value={viewCandidate.pekerjaan_wali} />
                <DetailField label="Pendidikan Wali" value={viewCandidate.pendidikan_wali} />
                <DetailField label="Penghasilan Wali" value={viewCandidate.penghasilan_wali} />
                <DetailField label="No HP Wali" value={viewCandidate.no_hp_wali} />
                <div className="sm:col-span-2"><DetailField label="Alamat Wali" value={viewCandidate.alamat_wali} /></div>
                
                <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100"><h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Data Tambahan</h4></div>
                <DetailField label="Jenis Kelamin" value={viewCandidate.jenis_kelamin === 'L' ? 'Laki-laki' : viewCandidate.jenis_kelamin === 'P' ? 'Perempuan' : '-'} />
                <DetailField label="Tempat Lahir" value={viewCandidate.tempat_lahir} />
                <DetailField label="Tanggal Lahir" value={viewCandidate.tanggal_lahir ? new Date(viewCandidate.tanggal_lahir).toLocaleDateString('id-ID') : '-'} />
                <DetailField label="NIK" value={viewCandidate.nik} />
                <DetailField label="Agama" value={viewCandidate.agama} />
                <DetailField label="Asal Sekolah" value={viewCandidate.asal_sekolah} />
                <DetailField label="Kecamatan" value={viewCandidate.kecamatan} />
                <DetailField label="Email" value={viewCandidate.email} />
                <DetailField label="Nomor HP" value={viewCandidate.nomor_hp} />
                <div className="sm:col-span-2">
                  <DetailField label="Alamat" value={viewCandidate.alamat} />
                </div>
                <DetailField label="RT" value={viewCandidate.rt} />
                <DetailField label="RW" value={viewCandidate.rw} />
                <DetailField label="Dusun" value={viewCandidate.dusun} />
                <DetailField label="Kelurahan / Desa" value={viewCandidate.kelurahan} />
                <DetailField label="Kode Pos" value={viewCandidate.kode_pos} />
                <DetailField label="Jenis Tinggal" value={viewCandidate.jenis_tinggal} />
                <DetailField label="Alat Transportasi" value={viewCandidate.alat_transportasi} />
                <DetailField label="Lintang" value={viewCandidate.lintang} />
                <DetailField label="Bujur" value={viewCandidate.bujur} />
                <DetailField label="Jalur Pendaftaran" value={viewCandidate.jalur ? viewCandidate.jalur.replace('_', ' ') : '-'} />
                <DetailField label="Status" value={getStatusText(viewCandidate.status)} />
                <DetailField label="Tanggal Daftar" value={viewCandidate.created_at ? new Date(viewCandidate.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setIsViewModalOpen(false); setViewCandidate(null); }} className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Tutup</button>
                <button onClick={() => { setIsViewModalOpen(false); openModalForEdit(viewCandidate); }} className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition-all">
                  Edit Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Form Modal (Manual) ──────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">{currentCandidate ? 'Edit Data Pendaftar' : 'Tambah Pendaftar Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">No. Pendaftaran <span className="text-slate-400 font-normal">(kosongkan = otomatis)</span></label>
                  <input type="text" name="no_pendaftaran" defaultValue={currentCandidate?.no_pendaftaran || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="REG-20260518-1234" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">NISN</label>
                  <input type="text" name="nisn" defaultValue={currentCandidate?.nisn || ''} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="Masukkan NISN" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                  <input type="text" name="nama_lengkap" defaultValue={currentCandidate?.nama_lengkap || ''} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="Nama lengkap siswa" />
                </div>
                <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100"><h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Data Ayah</h4></div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Ayah</label>
                  <input type="text" name="nama_ayah" disabled={parentType === 'wali'} defaultValue={currentCandidate?.nama_ayah || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 disabled:bg-slate-100 disabled:text-slate-400" placeholder="Nama ayah" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Pekerjaan Ayah</label>
                  <input type="text" name="pekerjaan_ayah" disabled={parentType === 'wali'} defaultValue={currentCandidate?.pekerjaan_ayah || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 disabled:bg-slate-100 disabled:text-slate-400" placeholder="Pekerjaan ayah" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Pendidikan Ayah</label>
                  <select name="pendidikan_ayah" disabled={parentType === 'wali'} defaultValue={currentCandidate?.pendidikan_ayah || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white disabled:bg-slate-100 disabled:text-slate-400">
                    <option value="">— Pilih —</option>
                    {PENDIDIKAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Penghasilan Ayah</label>
                  <select name="penghasilan_ayah" disabled={parentType === 'wali'} defaultValue={currentCandidate?.penghasilan_ayah || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white disabled:bg-slate-100 disabled:text-slate-400">
                    <option value="">— Pilih —</option>
                    {PENGHASILAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">No HP Ayah</label>
                  <input type="text" name="no_hp_ayah" disabled={parentType === 'wali'} defaultValue={currentCandidate?.no_hp_ayah || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 disabled:bg-slate-100 disabled:text-slate-400" placeholder="No HP ayah" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat Ayah</label>
                  <textarea name="alamat_ayah" disabled={parentType === 'wali'} defaultValue={currentCandidate?.alamat_ayah || ''} onChange={checkParentMode} rows="2" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 resize-none disabled:bg-slate-100 disabled:text-slate-400" placeholder="Alamat ayah"></textarea>
                </div>

                <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100"><h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Data Ibu</h4></div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Ibu</label>
                  <input type="text" name="nama_ibu" disabled={parentType === 'wali'} defaultValue={currentCandidate?.nama_ibu || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 disabled:bg-slate-100 disabled:text-slate-400" placeholder="Nama ibu" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Pekerjaan Ibu</label>
                  <input type="text" name="pekerjaan_ibu" disabled={parentType === 'wali'} defaultValue={currentCandidate?.pekerjaan_ibu || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 disabled:bg-slate-100 disabled:text-slate-400" placeholder="Pekerjaan ibu" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Pendidikan Ibu</label>
                  <select name="pendidikan_ibu" disabled={parentType === 'wali'} defaultValue={currentCandidate?.pendidikan_ibu || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white disabled:bg-slate-100 disabled:text-slate-400">
                    <option value="">— Pilih —</option>
                    {PENDIDIKAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Penghasilan Ibu</label>
                  <select name="penghasilan_ibu" disabled={parentType === 'wali'} defaultValue={currentCandidate?.penghasilan_ibu || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white disabled:bg-slate-100 disabled:text-slate-400">
                    <option value="">— Pilih —</option>
                    {PENGHASILAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">No HP Ibu</label>
                  <input type="text" name="no_hp_ibu" disabled={parentType === 'wali'} defaultValue={currentCandidate?.no_hp_ibu || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 disabled:bg-slate-100 disabled:text-slate-400" placeholder="No HP ibu" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat Ibu</label>
                  <textarea name="alamat_ibu" disabled={parentType === 'wali'} defaultValue={currentCandidate?.alamat_ibu || ''} onChange={checkParentMode} rows="2" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 resize-none disabled:bg-slate-100 disabled:text-slate-400" placeholder="Alamat ibu"></textarea>
                </div>

                <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100"><h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Data Wali</h4></div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Wali</label>
                  <input type="text" name="nama_wali" disabled={parentType === 'ayah_ibu'} defaultValue={currentCandidate?.nama_wali || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 disabled:bg-slate-100 disabled:text-slate-400" placeholder="Nama wali" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Pekerjaan Wali</label>
                  <input type="text" name="pekerjaan_wali" disabled={parentType === 'ayah_ibu'} defaultValue={currentCandidate?.pekerjaan_wali || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 disabled:bg-slate-100 disabled:text-slate-400" placeholder="Pekerjaan wali" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Pendidikan Wali</label>
                  <select name="pendidikan_wali" disabled={parentType === 'ayah_ibu'} defaultValue={currentCandidate?.pendidikan_wali || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white disabled:bg-slate-100 disabled:text-slate-400">
                    <option value="">— Pilih —</option>
                    {PENDIDIKAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Penghasilan Wali</label>
                  <select name="penghasilan_wali" disabled={parentType === 'ayah_ibu'} defaultValue={currentCandidate?.penghasilan_wali || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white disabled:bg-slate-100 disabled:text-slate-400">
                    <option value="">— Pilih —</option>
                    {PENGHASILAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">No HP Wali</label>
                  <input type="text" name="no_hp_wali" disabled={parentType === 'ayah_ibu'} defaultValue={currentCandidate?.no_hp_wali || ''} onChange={checkParentMode} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 disabled:bg-slate-100 disabled:text-slate-400" placeholder="No HP wali" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat Wali</label>
                  <textarea name="alamat_wali" disabled={parentType === 'ayah_ibu'} defaultValue={currentCandidate?.alamat_wali || ''} onChange={checkParentMode} rows="2" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 resize-none disabled:bg-slate-100 disabled:text-slate-400" placeholder="Alamat wali"></textarea>
                </div>

                <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100"><h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Data Tambahan</h4></div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select name="jenis_kelamin" defaultValue={currentCandidate?.jenis_kelamin || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white">
                    <option value="">— Pilih —</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                  <input type="text" name="tempat_lahir" defaultValue={currentCandidate?.tempat_lahir || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="Tempat lahir" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input type="date" name="tanggal_lahir" defaultValue={currentCandidate?.tanggal_lahir || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">NIK</label>
                  <input type="text" name="nik" defaultValue={currentCandidate?.nik || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="Nomor Induk Kependudukan" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Agama</label>
                  <select name="agama" defaultValue={currentCandidate?.agama || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white">
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Asal Sekolah</label>
                  <input type="text" name="asal_sekolah" defaultValue={currentCandidate?.asal_sekolah || ''} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="SMPN 1 Pamekasan" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kecamatan</label>
                  <input type="text" name="kecamatan" defaultValue={currentCandidate?.kecamatan || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="Kecamatan tempat tinggal" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                  <textarea name="alamat" defaultValue={currentCandidate?.alamat || ''} required rows="2" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 resize-none" placeholder="Alamat lengkap siswa"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">RT</label>
                  <input type="text" name="rt" defaultValue={currentCandidate?.rt || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="001" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">RW</label>
                  <input type="text" name="rw" defaultValue={currentCandidate?.rw || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="002" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Dusun</label>
                  <input type="text" name="dusun" defaultValue={currentCandidate?.dusun || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="Nama dusun" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kelurahan / Desa</label>
                  <input type="text" name="kelurahan" defaultValue={currentCandidate?.kelurahan || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="Nama desa / kelurahan" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kode Pos</label>
                  <input type="text" name="kode_pos" defaultValue={currentCandidate?.kode_pos || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="69311" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Tinggal</label>
                  <select name="jenis_tinggal" defaultValue={currentCandidate?.jenis_tinggal || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white">
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
                  <select name="alat_transportasi" defaultValue={currentCandidate?.alat_transportasi || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white">
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Lintang</label>
                  <input type="number" step="any" name="lintang" defaultValue={currentCandidate?.lintang || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="-7.1234567" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Bujur</label>
                  <input type="number" step="any" name="bujur" defaultValue={currentCandidate?.bujur || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="113.1234567" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" name="email" defaultValue={currentCandidate?.email || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="email@contoh.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor HP</label>
                  <input type="text" name="nomor_hp" defaultValue={currentCandidate?.nomor_hp || ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600" placeholder="08xxxxxxxxxx" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Jalur Pendaftaran</label>
                  <select name="jalur" defaultValue={currentCandidate?.jalur || 'zonasi'} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white">
                    <option value="zonasi">Zonasi</option>
                    <option value="afirmasi">Afirmasi</option>
                    <option value="prestasi">Prestasi</option>
                    <option value="perpindahan_tugas">Perpindahan Tugas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select name="status" defaultValue={currentCandidate?.status || 'pending'} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 bg-white">
                    <option value="pending">Menunggu</option>
                    <option value="diterima">Diterima</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition-all">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Bulk Edit Modal ───────────────────────────────────────────────────── */}
      {isBulkEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Edit ({selectedIds.size} pendaftar)</h3>
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
                  ? 'Semua pendaftar yang dipilih akan mendapatkan nilai yang sama.'
                  : 'Edit data masing-masing pendaftar secara terpisah.'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-3">
              {bulkEditMode === 'massal' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                    <select value={bulkEditData.status} onChange={e => setBulkEditData(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600">
                      <option value="">— Tidak diubah —</option>
                      <option value="pending">Menunggu</option>
                      <option value="diterima">Diterima</option>
                      <option value="ditolak">Ditolak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Jalur Pendaftaran</label>
                    <select value={bulkEditData.jalur} onChange={e => setBulkEditData(prev => ({ ...prev, jalur: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600">
                      <option value="">— Tidak diubah —</option>
                      <option value="zonasi">Zonasi</option>
                      <option value="afirmasi">Afirmasi</option>
                      <option value="prestasi">Prestasi</option>
                      <option value="perpindahan_tugas">Perpindahan Tugas</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {[...selectedIds].map(id => {
                    const c = perUserData[id];
                    if (!c) return null;
                    return (
                      <div key={id} className="border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                          <p className="text-sm font-bold text-slate-700">{c.nama_lengkap || 'Tanpa Nama'} <span className="font-mono text-slate-400 font-normal">({c.nisn || '-'})</span></p>
                        </div>
                        <div className="p-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">No. Pendaftaran</label>
                              <input type="text" value={c.no_pendaftaran || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], no_pendaftaran: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">NISN</label>
                              <input type="text" value={c.nisn || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], nisn: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                              <input type="text" value={c.nama_lengkap || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], nama_lengkap: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100"><h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Data Ayah</h4></div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ayah</label>
                              <input type="text" name="nama_ayah" disabled={!!(c.nama_wali || c.pekerjaan_wali || c.no_hp_wali || c.alamat_wali || c.pendidikan_wali || c.penghasilan_wali)} value={c.nama_ayah || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], nama_ayah: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm disabled:bg-slate-100 disabled:text-slate-400" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Pekerjaan Ayah</label>
                              <input type="text" name="pekerjaan_ayah" disabled={!!(c.nama_wali || c.pekerjaan_wali || c.no_hp_wali || c.alamat_wali || c.pendidikan_wali || c.penghasilan_wali)} value={c.pekerjaan_ayah || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], pekerjaan_ayah: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm disabled:bg-slate-100 disabled:text-slate-400" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Pendidikan Ayah</label>
                              <select name="pendidikan_ayah" disabled={!!(c.nama_wali || c.pekerjaan_wali || c.no_hp_wali || c.alamat_wali || c.pendidikan_wali || c.penghasilan_wali)} value={c.pendidikan_ayah || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], pendidikan_ayah: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm bg-white disabled:bg-slate-100 disabled:text-slate-400">
                                <option value="">— Pilih —</option>
                                {PENDIDIKAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Penghasilan Ayah</label>
                              <select name="penghasilan_ayah" disabled={!!(c.nama_wali || c.pekerjaan_wali || c.no_hp_wali || c.alamat_wali || c.pendidikan_wali || c.penghasilan_wali)} value={c.penghasilan_ayah || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], penghasilan_ayah: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm bg-white disabled:bg-slate-100 disabled:text-slate-400">
                                <option value="">— Pilih —</option>
                                {PENGHASILAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>

                            <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100"><h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Data Ibu</h4></div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ibu</label>
                              <input type="text" name="nama_ibu" disabled={!!(c.nama_wali || c.pekerjaan_wali || c.no_hp_wali || c.alamat_wali || c.pendidikan_wali || c.penghasilan_wali)} value={c.nama_ibu || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], nama_ibu: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm disabled:bg-slate-100 disabled:text-slate-400" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Pekerjaan Ibu</label>
                              <input type="text" name="pekerjaan_ibu" disabled={!!(c.nama_wali || c.pekerjaan_wali || c.no_hp_wali || c.alamat_wali || c.pendidikan_wali || c.penghasilan_wali)} value={c.pekerjaan_ibu || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], pekerjaan_ibu: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm disabled:bg-slate-100 disabled:text-slate-400" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Pendidikan Ibu</label>
                              <select name="pendidikan_ibu" disabled={!!(c.nama_wali || c.pekerjaan_wali || c.no_hp_wali || c.alamat_wali || c.pendidikan_wali || c.penghasilan_wali)} value={c.pendidikan_ibu || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], pendidikan_ibu: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm bg-white disabled:bg-slate-100 disabled:text-slate-400">
                                <option value="">— Pilih —</option>
                                {PENDIDIKAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Penghasilan Ibu</label>
                              <select name="penghasilan_ibu" disabled={!!(c.nama_wali || c.pekerjaan_wali || c.no_hp_wali || c.alamat_wali || c.pendidikan_wali || c.penghasilan_wali)} value={c.penghasilan_ibu || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], penghasilan_ibu: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm bg-white disabled:bg-slate-100 disabled:text-slate-400">
                                <option value="">— Pilih —</option>
                                {PENGHASILAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>

                            <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100"><h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Data Wali</h4></div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Wali</label>
                              <input type="text" name="nama_wali" disabled={!!(c.nama_ayah || c.pekerjaan_ayah || c.pendidikan_ayah || c.penghasilan_ayah || c.nama_ibu || c.pekerjaan_ibu || c.pendidikan_ibu || c.penghasilan_ibu)} value={c.nama_wali || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], nama_wali: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm disabled:bg-slate-100 disabled:text-slate-400" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Pekerjaan Wali</label>
                              <input type="text" name="pekerjaan_wali" disabled={!!(c.nama_ayah || c.pekerjaan_ayah || c.pendidikan_ayah || c.penghasilan_ayah || c.nama_ibu || c.pekerjaan_ibu || c.pendidikan_ibu || c.penghasilan_ibu)} value={c.pekerjaan_wali || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], pekerjaan_wali: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm disabled:bg-slate-100 disabled:text-slate-400" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Pendidikan Wali</label>
                              <select name="pendidikan_wali" disabled={!!(c.nama_ayah || c.pekerjaan_ayah || c.pendidikan_ayah || c.penghasilan_ayah || c.nama_ibu || c.pekerjaan_ibu || c.pendidikan_ibu || c.penghasilan_ibu)} value={c.pendidikan_wali || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], pendidikan_wali: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm bg-white disabled:bg-slate-100 disabled:text-slate-400">
                                <option value="">— Pilih —</option>
                                {PENDIDIKAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Penghasilan Wali</label>
                              <select name="penghasilan_wali" disabled={!!(c.nama_ayah || c.pekerjaan_ayah || c.pendidikan_ayah || c.penghasilan_ayah || c.nama_ibu || c.pekerjaan_ibu || c.pendidikan_ibu || c.penghasilan_ibu)} value={c.penghasilan_wali || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], penghasilan_wali: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm bg-white disabled:bg-slate-100 disabled:text-slate-400">
                                <option value="">— Pilih —</option>
                                {PENGHASILAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>

                            <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100"><h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Data Tambahan</h4></div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                              <select value={c.jenis_kelamin || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], jenis_kelamin: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm">
                                <option value="">— Pilih —</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                              <input type="text" value={c.tempat_lahir || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], tempat_lahir: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                              <input type="date" value={c.tanggal_lahir || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], tanggal_lahir: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">NIK</label>
                              <input type="text" value={c.nik || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], nik: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Agama</label>
                              <select value={c.agama || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], agama: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm">
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
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Asal Sekolah</label>
                              <input type="text" value={c.asal_sekolah || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], asal_sekolah: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Kecamatan</label>
                              <input type="text" value={c.kecamatan || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], kecamatan: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                              <input type="email" value={c.email || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], email: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor HP</label>
                              <input type="text" value={c.nomor_hp || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], nomor_hp: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                              <textarea rows={2} value={c.alamat || ''} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], alamat: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm resize-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                              <select value={c.status || 'pending'} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], status: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm">
                                <option value="pending">Menunggu</option>
                                <option value="diterima">Diterima</option>
                                <option value="ditolak">Ditolak</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Jalur Pendaftaran</label>
                              <select value={c.jalur || 'zonasi'} onChange={e => setPerUserData(prev => ({ ...prev, [id]: { ...prev[id], jalur: e.target.value } }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600 text-sm">
                                <option value="zonasi">Zonasi</option>
                                <option value="afirmasi">Afirmasi</option>
                                <option value="prestasi">Prestasi</option>
                                <option value="perpindahan_tugas">Perpindahan Tugas</option>
                              </select>
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
              <button onClick={() => setIsBulkEditModalOpen(false)} className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
              <button onClick={handleBulkUpdate} disabled={isBulkSaving} className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition-all disabled:opacity-40 flex items-center gap-2">
                {isBulkSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

    </div>
  );
};

export default Pendaftar;