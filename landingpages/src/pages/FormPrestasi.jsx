import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Send, CheckCircle, AlertCircle, ArrowLeft, Search, User, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api/public';
const STORAGE_BASE = 'http://localhost:8000/storage';

export default function FormPrestasi() {
  const [form, setForm] = useState({
    siswa_id: '',
    student_name: '',
    title: '',
    category: '',
    year: new Date().getFullYear(),
    level: '',
    description: '',
  });
  const [nisQuery, setNisQuery] = useState('');
  const [nisnQuery, setNisnQuery] = useState('');
  const [searchMode, setSearchMode] = useState('nis');
  const [siswaData, setSiswaData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleLookup = async () => {
    const queryParam = searchMode === 'nis' ? `nis=${nisQuery}` : `nisn=${nisnQuery}`;
    if ((searchMode === 'nis' && !nisQuery) || (searchMode === 'nisn' && !nisnQuery)) return;

    setSearchLoading(true);
    setSearchStatus(null);
    setSiswaData(null);

    try {
      const res = await fetch(`${API_BASE}/siswa/lookup?${queryParam}`, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY || 'smansa123',
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSiswaData(data.data);
        setForm(prev => ({
          ...prev,
          siswa_id: data.data.id,
          student_name: data.data.nama_lengkap,
        }));
        setSearchStatus({ type: 'success', message: `Ditemukan: ${data.data.nama_lengkap}` });
      } else {
        setSearchStatus({ type: 'error', message: data.message || 'Siswa tidak ditemukan' });
        setSiswaData(null);
        setForm(prev => ({ ...prev, siswa_id: '', student_name: '' }));
      }
    } catch (err) {
      setSearchStatus({ type: 'error', message: 'Gagal terhubung ke server' });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append('student_name', form.student_name);
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('year', form.year);
      formData.append('level', form.level);
      formData.append('description', form.description);
      if (form.siswa_id) formData.append('siswa_id', form.siswa_id);
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch(`${API_BASE}/achievements/submit`, {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY || 'smansa123',
          'Accept': 'application/json',
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: data.message || 'Prestasi berhasil dikirim!' });
        setForm({
          siswa_id: '',
          student_name: '',
          title: '',
          category: '',
          year: new Date().getFullYear(),
          level: '',
          description: '',
        });
        setSiswaData(null);
        removeImage();
        setNisQuery('');
        setNisnQuery('');
      } else {
        const errMsg = data.message || data.error || 'Terjadi kesalahan. Silakan coba lagi.';
        setStatus({ type: 'error', message: errMsg });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Gagal terhubung ke server. Periksa koneksi Anda.' });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: '', label: 'Pilih Kategori' },
    { value: 'akademik', label: 'Akademik' },
    { value: 'non-akademik', label: 'Non-Akademik' },
    { value: 'olahraga', label: 'Olahraga' },
    { value: 'seni', label: 'Seni' },
  ];

  const levels = [
    { value: '', label: 'Pilih Tingkat' },
    { value: 'Sekolah', label: 'Sekolah' },
    { value: 'Kecamatan', label: 'Kecamatan' },
    { value: 'Kabupaten', label: 'Kabupaten' },
    { value: 'Provinsi', label: 'Provinsi' },
    { value: 'Nasional', label: 'Nasional' },
    { value: 'Internasional', label: 'Internasional' },
  ];

  const inputClass = "w-full bg-white border border-gray-200 rounded-full px-6 py-4 text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-base shadow-sm";
  const labelClass = "block text-sm font-bold text-smansa-navy mb-2";
  const selectClass = "w-full bg-white border border-gray-200 rounded-full px-6 py-4 text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-base shadow-sm appearance-none cursor-pointer";

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <Link to="/#prestasi" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-yellow-50 text-smansa-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-smansa-navy mb-4 tracking-tight">Form Prestasi Siswa</h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Laporkan pencapaian terbaru siswa-siswi SMAN 1 Pamekasan. Masukkan NIS atau NISN untuk memverifikasi data diri.
            </p>
          </div>

          {status && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-4 p-6 rounded-3xl mb-8 border ${
                status.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {status.type === 'success' ? <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" /> : <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />}
              <div>
                <p className="font-bold text-base">{status.type === 'success' ? 'Berhasil!' : 'Gagal'}</p>
                <p className="text-sm mt-1 opacity-80">{status.message}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="space-y-8">

              {/* NIS / NISN Lookup */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-bold text-smansa-navy mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-smansa-gold" /> Verifikasi Data Siswa
                </h3>

                <div className="flex gap-2 mb-4">
                  <button type="button" onClick={() => setSearchMode('nis')}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${searchMode === 'nis' ? 'bg-smansa-navy text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    NIS
                  </button>
                  <button type="button" onClick={() => setSearchMode('nisn')}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${searchMode === 'nisn' ? 'bg-smansa-navy text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    NISN
                  </button>
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchMode === 'nis' ? nisQuery : nisnQuery}
                    onChange={(e) => searchMode === 'nis' ? setNisQuery(e.target.value) : setNisnQuery(e.target.value)}
                    placeholder={searchMode === 'nis' ? 'Masukkan NIS...' : 'Masukkan NISN...'}
                    className="flex-1 bg-white border border-gray-200 rounded-full px-5 py-3 text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLookup())}
                  />
                  <button type="button" onClick={handleLookup} disabled={searchLoading}
                    className="bg-smansa-navy text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-blue-900 transition-all hover:scale-105 shadow-md disabled:opacity-60 disabled:hover:scale-100 flex items-center gap-2 shrink-0">
                    {searchLoading ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    ) : <Search className="w-4 h-4" />}
                    Cari
                  </button>
                </div>

                {searchStatus && (
                  <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${
                    searchStatus.type === 'success' ? 'text-green-700' : 'text-red-600'
                  }`}>
                    {searchStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {searchStatus.message}
                  </div>
                )}

                {siswaData && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-white rounded-2xl p-5 border border-green-200 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-smansa-navy text-lg">{siswaData.nama_lengkap}</p>
                        <div className="flex gap-3 text-sm text-gray-500 mt-1">
                          <span>NIS: {siswaData.nis}</span>
                          {siswaData.nisn && <span>NISN: {siswaData.nisn}</span>}
                          {siswaData.kelas && <span>Kelas: {siswaData.kelas}</span>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Nama Siswa <span className="text-red-500">*</span></label>
                  <input type="text" name="student_name" value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} placeholder="Nama akan terisi otomatis" className={`${inputClass} bg-gray-100 cursor-not-allowed`} required disabled />
                </div>
                <div>
                  <label className={labelClass}>Tahun Prestasi <span className="text-red-500">*</span></label>
                  <input type="number" name="year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} min="1900" max="2099" className={inputClass} required />
                </div>
              </div>

              <div>
                <label className={labelClass}>Judul Prestasi <span className="text-red-500">*</span></label>
                <input type="text" name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Contoh: Juara 1 Olimpiade Matematika" className={inputClass} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Kategori <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select name="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={selectClass} required>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Tingkat <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select name="level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={selectClass} required>
                      {levels.map((lvl) => (
                        <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Deskripsi Prestasi <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Jelaskan secara singkat tentang prestasi yang diraih..."
                  rows="5"
                  className="w-full bg-white border border-gray-200 rounded-3xl px-6 py-4 text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-base shadow-sm resize-none"
                  required
                ></textarea>
              </div>

              {/* Image Upload */}
              <div>
                <label className={labelClass}>Dokumentasi / Foto Prestasi</label>
                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-6 text-center hover:border-blue-300 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="max-h-48 rounded-2xl mx-auto shadow-sm" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(); }} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="w-14 h-14 bg-blue-50 text-smansa-gold rounded-2xl flex items-center justify-center">
                        <Upload className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-bold text-smansa-navy">Klik untuk upload foto</p>
                        <p className="text-sm text-gray-400 mt-1">Format: JPEG, PNG, WebP. Maks 5MB</p>
                      </div>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <p className="text-sm text-gray-400"><span className="text-red-500">*</span> Wajib diisi</p>
              <button
                type="submit"
                disabled={loading}
                className="bg-smansa-navy text-white px-10 py-4 rounded-full font-bold text-base inline-flex items-center gap-3 hover:bg-blue-900 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Kirim Prestasi
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
