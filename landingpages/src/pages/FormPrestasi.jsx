import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Send, CheckCircle, AlertCircle, ArrowLeft, Search, User, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api/public';
const STORAGE_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/storage';

const SearchableSiswaSelect = ({ value, onChange, siswas }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const selectedSiswa = siswas.find(s => String(s.id) === String(value));
  const displayValue = isOpen
    ? searchQuery
    : (selectedSiswa ? `${selectedSiswa.nama_lengkap} (${selectedSiswa.kelas || ''})` : '');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSiswas = siswas.filter(s => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    const nameMatch = (s.nama_lengkap || '').toLowerCase().includes(term);
    const kelasMatch = (s.kelas || '').toLowerCase().includes(term);
    const nisMatch = (s.nis || '').toString().includes(term);
    const nisnMatch = (s.nisn || '').toString().includes(term);
    return nameMatch || kelasMatch || nisMatch || nisnMatch;
  });

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={displayValue}
          onFocus={() => {
            setSearchQuery('');
            setIsOpen(true);
          }}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (value && e.target.value === '') {
              onChange('');
            }
          }}
          placeholder="Cari nama siswa, kelas, NIS, atau NISN..."
          className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 pr-10 text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSearchQuery('');
            }}
            className="absolute right-3 text-gray-400 hover:text-gray-600 text-xs p-1"
            title="Bersihkan pilihan"
          >
            ✕
          </button>
        ) : (
          <svg className="w-4 h-4 absolute right-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-100">
          <div
            onClick={() => {
              onChange('');
              setSearchQuery('');
              setIsOpen(false);
            }}
            className="px-4 py-2.5 text-xs text-gray-400 hover:bg-gray-50 cursor-pointer font-medium"
          >
            -- Kosongkan / Tanpa Siswa --
          </div>
          {filteredSiswas.length > 0 ? (
            filteredSiswas.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  onChange(String(s.id));
                  setSearchQuery('');
                  setIsOpen(false);
                }}
                className={`px-4 py-3 text-sm hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors ${
                  String(s.id) === String(value) ? 'bg-blue-50/80 font-bold text-blue-700' : 'text-gray-700'
                }`}
              >
                <div>
                  <div className="font-semibold">{s.nama_lengkap}</div>
                  <div className="text-xs text-gray-400">
                    Kelas: {s.kelas || '-'} {s.nis ? `• NIS: ${s.nis}` : ''}
                  </div>
                </div>
                {String(s.id) === String(value) && (
                  <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-xs text-gray-400 text-center italic">
              Siswa "{searchQuery}" tidak ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function FormPrestasi() {
  const [form, setForm] = useState({
    siswa_ids: [''],
    student_name: '',
    title: '',
    category: '',
    year: new Date().getFullYear(),
    level: '',
    description: '',
  });

  const [siswas, setSiswas] = useState([]);
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

    // Fetch active siswas list for searchable dropdown
    fetch(`${API_BASE}/siswa/search`, {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY || 'smansa123',
        'Accept': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.data)) {
          setSiswas(data.data);
        }
      })
      .catch(err => console.error('Failed to fetch siswas:', err));
  }, []);

  const handleAddSiswa = () => {
    setForm(prev => ({ ...prev, siswa_ids: [...prev.siswa_ids, ''] }));
  };

  const handleRemoveSiswa = (index) => {
    setForm(prev => {
      const updated = prev.siswa_ids.filter((_, i) => i !== index);
      return { ...prev, siswa_ids: updated.length ? updated : [''] };
    });
  };

  const handleSiswaChange = (index, value) => {
    setForm(prev => {
      const updated = [...prev.siswa_ids];
      updated[index] = value;
      return { ...prev, siswa_ids: updated };
    });
  };

  const compressImageFile = (file, maxDimension = 2048, quality = 0.8) => {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith('image/')) return resolve(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Proportional scaling for both portrait & landscape orientations
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file);
              const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressed);
            },
            'image/webp',
            quality
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      const compressed = await compressImageFile(file);
      setImageFile(compressed);
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
      if (!imageFile) {
        setStatus({ type: 'error', message: 'Dokumentasi / Foto Prestasi wajib diupload.' });
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('year', form.year);
      formData.append('level', form.level);
      formData.append('description', form.description);

      if (form.student_name) {
        formData.append('student_name', form.student_name);
      }

      form.siswa_ids.filter(id => id !== '').forEach(id => {
        formData.append('siswa_ids[]', id);
      });

      if (imageFile) {
        formData.append('image', imageFile);
      }

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
        setStatus({ type: 'success', message: data.message || 'Prestasi berhasil dikirim dan sedang menunggu verifikasi Admin!' });
        setForm({
          siswa_ids: [''],
          student_name: '',
          title: '',
          category: '',
          year: new Date().getFullYear(),
          level: '',
          description: '',
        });
        removeImage();
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
      <SEO 
        title="Kirim Prestasi Siswa"
        description="Formulir pelaporan prestasi siswa SMAN 1 Pamekasan. Laporkan prestasi akademik, non-akademik, seni, atau olahraga Anda untuk dipublikasikan di website sekolah."
        keywords="lapor prestasi SMANSA, submit prestasi SMAN 1 Pamekasan, formulir prestasi SMANSA"
      />
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/#prestasi" className="inline-flex items-center gap-2 text-smansa-navy font-bold hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-yellow-50 text-smansa-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-smansa-navy mb-4 tracking-tight">Form Prestasi Siswa</h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Laporkan pencapaian terbaru siswa-siswi SMAN 1 Pamekasan. Anda dapat memilih siswa individu maupun anggota tim.
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

              {/* Multi-Siswa / Tim Selection */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 md:p-8">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-base font-bold text-smansa-navy flex items-center gap-2">
                    <User className="w-5 h-5 text-smansa-gold" /> Pilih Siswa / Anggota Tim (Database)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSiswa}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-100/80 px-4 py-2 rounded-full transition-colors"
                  >
                    + Tambah Anggota
                  </button>
                </div>

                <div className="space-y-3">
                  {form.siswa_ids.map((siswaId, index) => (
                    <div key={index} className="flex gap-3 bg-white p-3 rounded-2xl border border-gray-200 items-center shadow-sm">
                      <SearchableSiswaSelect
                        value={siswaId || ''}
                        onChange={val => handleSiswaChange(index, val)}
                        siswas={siswas}
                      />
                      {form.siswa_ids.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSiswa(index)}
                          className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                          title="Hapus anggota"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-5 border-t border-blue-100 mt-5">
                  <label className="block text-sm font-bold text-smansa-navy mb-2">
                    Atau Nama Manual / Nama Tim Luar (Jika tidak ada di database)
                  </label>
                  <input
                    type="text"
                    value={form.student_name || ''}
                    onChange={e => setForm(prev => ({ ...prev, student_name: e.target.value, siswa_ids: [''] }))}
                    disabled={form.siswa_ids.some(id => id !== '')}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    placeholder="Contoh: Tim Robotik Putra SMANSA / John Doe"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Judul Prestasi <span className="text-red-500">*</span></label>
                <input type="text" name="title" value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Contoh: Juara 1 Olimpiade Matematika" className={inputClass} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Tahun Prestasi <span className="text-red-500">*</span></label>
                  <input type="number" name="year" value={form.year} onChange={(e) => setForm(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))} min="1900" max="2099" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Kategori <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select name="category" value={form.category} onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))} className={selectClass} required>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Tingkat <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select name="level" value={form.level} onChange={(e) => setForm(prev => ({ ...prev, level: e.target.value }))} className={selectClass} required>
                    {levels.map((lvl) => (
                      <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Deskripsi Prestasi <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Jelaskan secara singkat tentang prestasi yang diraih..."
                  rows="5"
                  className="w-full bg-white border border-gray-200 rounded-3xl px-6 py-4 text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-base shadow-sm resize-none"
                  required
                ></textarea>
              </div>

              <div>
                <label className={labelClass}>Dokumentasi / Foto Prestasi <span className="text-red-500">*</span></label>
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
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-700">Klik untuk upload foto dokumentasi</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP hingga 50MB (otomatis dikompresi)</p>
                      </div>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-smansa-navy text-white py-5 rounded-full font-bold text-lg hover:bg-blue-900 transition-all hover:scale-[1.01] shadow-xl shadow-blue-950/10 disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Mengirim Prestasi...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 text-smansa-gold" /> Kirim Prestasi Siswa
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
