import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Briefcase, 
  TrendingUp, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  RefreshCw, 
  User, 
  Calendar, 
  Lock, 
  ShieldAlert, 
  BookOpen, 
  Coins 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TestimonialForm from '../components/TestimonialForm';

const API_BASE = 'http://localhost:8000/api/public';

export default function TrackingAlumni() {
  // Portal Status
  const [portalStatus, setPortalStatus] = useState({ isOpen: true, message: '', loading: true });
  
  // Login State
  const [credentials, setCredentials] = useState({ nis: '', tanggal_lahir: '', captcha_code: '' });
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifiedStudent, setVerifiedStudent] = useState(null);

  // Form State
  const [form, setForm] = useState({
    kategori_pilihan: 'kuliah',
    
    // Kuliah
    univ_pilihan_1: '',
    jurusan_pilihan_1: '',
    univ_pilihan_2: '',
    jurusan_pilihan_2: '',
    jalur_seleksi: '',
    status_seleksi: 'Rencana',
    
    // Kerja
    nama_perusahaan: '',
    posisi_pekerjaan: '',
    estimasi_gaji: '',
    
    // Bisnis
    bidang_bisnis: '',
    nama_bisnis: '',
    modal_awal: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [testimonialDone, setTestimonialDone] = useState(false);

  // Fetch Portal Status & Captcha on Mount
  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    
    checkPortalStatus();
    fetchCaptcha();
  }, []);

  const checkPortalStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/alumni-tracking/status`, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY || 'smansa123',
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      setPortalStatus({
        isOpen: data.is_open,
        message: data.message,
        loading: false
      });
    } catch (err) {
      setPortalStatus({
        isOpen: false,
        message: 'Gagal menghubungi server untuk memvalidasi status portal.',
        loading: false
      });
    }
  };

  const fetchCaptcha = async () => {
    try {
      const res = await fetch(`${API_BASE}/alumni-tracking/captcha`, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY || 'smansa123',
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCaptchaImage(data.captcha_image);
        setCaptchaKey(data.captcha_key);
        setCredentials(prev => ({ ...prev, captcha_code: '' }));
      }
    } catch (err) {
      console.error('Error fetching captcha:', err);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!credentials.nis || !credentials.tanggal_lahir || !credentials.captcha_code) {
      setVerifyError('Semua field login wajib diisi.');
      return;
    }

    setIsVerifying(true);
    setVerifyError('');

    try {
      const res = await fetch(`${API_BASE}/alumni-tracking/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY || 'smansa123',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          nis: credentials.nis,
          tanggal_lahir: credentials.tanggal_lahir,
          captcha_key: captchaKey,
          captcha_code: credentials.captcha_code
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setVerifiedStudent(data.siswa);
        if (data.rencana_karir) {
          const rk = data.rencana_karir;
          setForm({
            kategori_pilihan: rk.kategori_pilihan || 'kuliah',
            univ_pilihan_1: rk.univ_pilihan_1 || '',
            jurusan_pilihan_1: rk.jurusan_pilihan_1 || '',
            univ_pilihan_2: rk.univ_pilihan_2 || '',
            jurusan_pilihan_2: rk.jurusan_pilihan_2 || '',
            jalur_seleksi: rk.jalur_seleksi || '',
            status_seleksi: rk.status_seleksi || 'Rencana',
            nama_perusahaan: rk.nama_perusahaan || '',
            posisi_pekerjaan: rk.posisi_pekerjaan || '',
            estimasi_gaji: rk.estimasi_gaji || '',
            bidang_bisnis: rk.bidang_bisnis || '',
            nama_bisnis: rk.nama_bisnis || '',
            modal_awal: rk.modal_awal || '',
          });
        }
      } else {
        setVerifyError(data.message || 'Verifikasi gagal. Periksa kembali NIS, Tanggal Lahir, dan CAPTCHA Anda.');
        fetchCaptcha();
      }
    } catch (err) {
      setVerifyError('Terjadi kesalahan koneksi ke server. Silakan coba kembali.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const payload = {
      nis: credentials.nis,
      tanggal_lahir: credentials.tanggal_lahir,
      kategori_pilihan: form.kategori_pilihan,
      
      // Kuliah
      univ_pilihan_1: form.kategori_pilihan === 'kuliah' ? form.univ_pilihan_1 : null,
      jurusan_pilihan_1: form.kategori_pilihan === 'kuliah' ? form.jurusan_pilihan_1 : null,
      univ_pilihan_2: form.kategori_pilihan === 'kuliah' ? form.univ_pilihan_2 : null,
      jurusan_pilihan_2: form.kategori_pilihan === 'kuliah' ? form.jurusan_pilihan_2 : null,
      jalur_seleksi: form.kategori_pilihan === 'kuliah' ? form.jalur_seleksi : null,
      status_seleksi: form.kategori_pilihan === 'kuliah' ? form.status_seleksi : null,

      // Kerja
      nama_perusahaan: form.kategori_pilihan === 'kerja' ? form.nama_perusahaan : null,
      posisi_pekerjaan: form.kategori_pilihan === 'kerja' ? form.posisi_pekerjaan : null,
      estimasi_gaji: form.kategori_pilihan === 'kerja' ? form.estimasi_gaji : null,

      // Bisnis
      bidang_bisnis: form.kategori_pilihan === 'bisnis' ? form.bidang_bisnis : null,
      nama_bisnis: form.kategori_pilihan === 'bisnis' ? form.nama_bisnis : null,
      modal_awal: form.kategori_pilihan === 'bisnis' ? form.modal_awal : null,
    };

    try {
      const res = await fetch(`${API_BASE}/alumni-tracking/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY || 'smansa123',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSubmitSuccess(true);
      } else {
        setStatus({ type: 'error', message: data.message || 'Terjadi kesalahan saat menyimpan data.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Gagal mengirim data rencana karir. Silakan coba lagi nanti.' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-full px-6 py-3.5 text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm";
  const labelClass = "block text-xs font-bold text-smansa-navy mb-2 uppercase tracking-wider ml-2";
  const selectClass = "w-full bg-white border border-gray-200 rounded-full px-6 py-3.5 text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm appearance-none cursor-pointer";

  // Success Screen
  if (submitSuccess) {
    if (!testimonialDone) {
      // Determine default occupation string
      let occ = '';
      if (form.kategori_pilihan === 'kuliah') {
        occ = form.univ_pilihan_1 ? form.univ_pilihan_1 + (form.jurusan_pilihan_1 ? ' - ' + form.jurusan_pilihan_1 : '') : '';
      } else if (form.kategori_pilihan === 'kerja') {
        occ = form.nama_perusahaan ? form.nama_perusahaan + (form.posisi_pekerjaan ? ' - ' + form.posisi_pekerjaan : '') : '';
      } else if (form.kategori_pilihan === 'bisnis') {
        occ = form.nama_bisnis ? form.nama_bisnis + (form.bidang_bisnis ? ' - ' + form.bidang_bisnis : '') : '';
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 pt-32 pb-24 font-sans text-gray-800">
          <div className="w-full max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="bg-white border border-gray-100 rounded-[2.5rem] p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden mb-8"
            >
              <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-green-400 to-emerald-500"></div>
              
              <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-smansa-navy mb-3 tracking-tight">Rencana Karir Tersimpan!</h2>
              <p className="text-gray-500 leading-relaxed max-w-sm mx-auto text-sm">
                Terima kasih <strong className="text-smansa-navy">{verifiedStudent?.nama}</strong>. Data rencana karir Anda berhasil terekam.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TestimonialForm 
                lockedRole="alumni"
                defaultName={verifiedStudent?.nama || ""}
                defaultGraduationYear={verifiedStudent?.tahun_lulus || ""}
                defaultOccupation={occ}
                onSuccessCallback={() => setTestimonialDone(true)}
              />
            </motion.div>
            
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  setSubmitSuccess(false);
                  setVerifiedStudent(null);
                  setCredentials({ nis: '', tanggal_lahir: '', captcha_code: '' });
                  fetchCaptcha();
                }}
                className="px-8 py-3 bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              >
                Lewati & Selesai
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 pt-32 pb-24 font-sans text-gray-800">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full max-w-lg bg-white border border-gray-100 rounded-[2.5rem] p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-blue-400 to-blue-600"></div>
            
            <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
              <CheckCircle className="w-10 h-10 text-blue-500" />
            </div>
            
            <h2 className="text-3xl font-bold text-smansa-navy mb-4 tracking-tight">Selesai!</h2>
            <p className="text-gray-500 leading-relaxed max-w-sm mx-auto mb-10 text-base">
              Terima kasih <strong className="text-smansa-navy">{verifiedStudent?.nama}</strong>. Rencana karir dan Testimoni Anda telah berhasil dikirimkan.
            </p>
            
            <button
              type="button"
              onClick={() => {
                setSubmitSuccess(false);
                setTestimonialDone(false);
                setVerifiedStudent(null);
                setCredentials({ nis: '', tanggal_lahir: '', captcha_code: '' });
                fetchCaptcha();
              }}
              className="w-full py-4 bg-smansa-navy text-white hover:bg-blue-900 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl cursor-pointer"
            >
              Kembali ke Halaman Awal
            </button>
          </motion.div>
        </div>
      );
    }
  }

  // Main UI render
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
        </Link>

        {/* 1. PORTAL LOGIN / VERIFIKASI */}
        {!verifiedStudent ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-blue-50/50 text-smansa-navy border border-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Lock className="w-10 h-10 text-smansa-navy" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-smansa-navy mb-4 tracking-tight">Portal Tracking Alumni</h1>
              <p className="text-gray-600 text-lg max-w-xl mx-auto">
                Silakan verifikasi NIS, Tanggal Lahir, dan masukkan kode CAPTCHA untuk mengisi data rencana karir alumni mandiri.
              </p>
            </div>

            {portalStatus.loading ? (
              <div className="bg-white rounded-[2rem] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-smansa-navy"></div>
                <p className="text-gray-500 font-medium">Memverifikasi status portal...</p>
              </div>
            ) : !portalStatus.isOpen ? (
              <div className="bg-white rounded-[2rem] p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-red-800 mb-2">Portal Ditutup</h3>
                <p className="text-gray-650 leading-relaxed text-sm max-w-sm mx-auto">
                  {portalStatus.message || 'Mohon maaf, pengisian penelusuran alumni mandiri saat ini ditutup oleh administrator sekolah.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 max-w-lg mx-auto">
                {verifyError && (
                  <div className="mb-6 p-5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-3xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                    <span className="font-semibold">{verifyError}</span>
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                  <div>
                    <label className={labelClass}>Nomor Induk Siswa (NIS)</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: 2021004"
                      value={credentials.nis}
                      onChange={(e) => setCredentials({ ...credentials, nis: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Tanggal Lahir</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={credentials.tanggal_lahir}
                        onChange={(e) => setCredentials({ ...credentials, tanggal_lahir: e.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  {/* CAPTCHA SECTION */}
                  <div className="bg-gray-50 border border-gray-100 rounded-3xl p-5 space-y-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Keamanan (Captcha)</label>
                    <div className="flex items-center gap-4">
                      {captchaImage ? (
                        <div className="border border-gray-200 bg-white rounded-2xl overflow-hidden p-1 flex items-center shadow-sm">
                          <img src={captchaImage} alt="Captcha" className="h-12 w-32 object-contain" />
                        </div>
                      ) : (
                        <div className="h-12 w-32 bg-gray-200 rounded-2xl animate-pulse"></div>
                      )}
                      
                      <button 
                        type="button" 
                        onClick={fetchCaptcha} 
                        className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors shadow-sm"
                        title="Reload CAPTCHA"
                      >
                        <RefreshCw className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    <div>
                      <input 
                        type="text" 
                        placeholder="Masukkan 5 angka di atas..."
                        value={credentials.captcha_code}
                        onChange={(e) => setCredentials({ ...credentials, captcha_code: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-full px-5 py-3 text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-4 bg-smansa-navy text-white hover:bg-blue-900 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:scale-102 shadow-xl hover:shadow-2xl disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isVerifying ? 'Memverifikasi...' : 'Masuk & Mulai Pengisian'}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        ) : (
          
          /* 2. FORM RENCANA KARIR ALUMNI (VERIFIED) */
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            {/* Header info */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 bg-smansa-gold h-full"></div>
              <div>
                <p className="text-xs font-bold text-smansa-gold uppercase tracking-widest mb-1">Status Verifikasi: Sukses</p>
                <h2 className="text-2xl font-bold text-smansa-navy mb-2">{verifiedStudent.nama}</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-gray-400"/> NIS: {verifiedStudent.nis}</span>
                  {verifiedStudent.nisn && <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-gray-400"/> NISN: {verifiedStudent.nisn}</span>}
                  {verifiedStudent.kelas && <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-gray-400"/> Kelas: {verifiedStudent.kelas}</span>}
                </div>
              </div>
              <div className="shrink-0">
                <span className="bg-blue-50 text-blue-800 text-xs font-bold px-4 py-2 rounded-full border border-blue-100/50">
                  Lulusan Tahun {verifiedStudent.tahun_lulus}
                </span>
              </div>
            </div>

            {status && (
              <div className="mb-8 p-5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-3xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <span className="font-semibold">{status.message}</span>
              </div>
            )}

            {/* Career choice questionnaire form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 space-y-10">
              
              {/* Category Selector Card Radio Grid */}
              <div>
                <label className="block text-sm font-bold text-smansa-navy mb-4 uppercase tracking-wider text-center">Pilih Rencana Karir Utama Anda</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Kuliah */}
                  <label className={`cursor-pointer border-2 rounded-[2rem] p-6 flex flex-col justify-between h-44 hover:border-blue-400 transition-all group ${form.kategori_pilihan === 'kuliah' ? 'bg-smansa-navy text-white border-smansa-navy shadow-xl shadow-blue-900/10' : 'bg-gray-55 border-gray-200 text-gray-600'}`}>
                    <input 
                      type="radio" 
                      name="kategori_pilihan" 
                      value="kuliah" 
                      checked={form.kategori_pilihan === 'kuliah'} 
                      onChange={() => setForm(prev => ({ ...prev, kategori_pilihan: 'kuliah' }))} 
                      className="sr-only"
                    />
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${form.kategori_pilihan === 'kuliah' ? 'bg-blue-950 border-blue-900 text-white' : 'bg-white border-gray-200 text-gray-600 group-hover:text-blue-500'}`}>
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base mb-1">Melanjutkan Kuliah</h4>
                      <p className={`text-[10px] leading-relaxed ${form.kategori_pilihan === 'kuliah' ? 'text-blue-200/90' : 'text-gray-400'}`}>Melanjutkan pendidikan ke PTN, PTS, atau Sekolah Kedinasan.</p>
                    </div>
                  </label>

                  {/* Kerja */}
                  <label className={`cursor-pointer border-2 rounded-[2rem] p-6 flex flex-col justify-between h-44 hover:border-blue-400 transition-all group ${form.kategori_pilihan === 'kerja' ? 'bg-smansa-navy text-white border-smansa-navy shadow-xl shadow-blue-900/10' : 'bg-gray-55 border-gray-200 text-gray-600'}`}>
                    <input 
                      type="radio" 
                      name="kategori_pilihan" 
                      value="kerja" 
                      checked={form.kategori_pilihan === 'kerja'} 
                      onChange={() => setForm(prev => ({ ...prev, kategori_pilihan: 'kerja' }))} 
                      className="sr-only"
                    />
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${form.kategori_pilihan === 'kerja' ? 'bg-blue-950 border-blue-900 text-white' : 'bg-white border-gray-200 text-gray-600 group-hover:text-blue-500'}`}>
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base mb-1">Langsung Kerja</h4>
                      <p className={`text-[10px] leading-relaxed ${form.kategori_pilihan === 'kerja' ? 'text-blue-200/90' : 'text-gray-400'}`}>Bekerja di perusahaan swasta, BUMN, instansi, atau TNI/POLRI.</p>
                    </div>
                  </label>

                  {/* Bisnis */}
                  <label className={`cursor-pointer border-2 rounded-[2rem] p-6 flex flex-col justify-between h-44 hover:border-blue-400 transition-all group ${form.kategori_pilihan === 'bisnis' ? 'bg-smansa-navy text-white border-smansa-navy shadow-xl shadow-blue-900/10' : 'bg-gray-55 border-gray-200 text-gray-600'}`}>
                    <input 
                      type="radio" 
                      name="kategori_pilihan" 
                      value="bisnis" 
                      checked={form.kategori_pilihan === 'bisnis'} 
                      onChange={() => setForm(prev => ({ ...prev, kategori_pilihan: 'bisnis' }))} 
                      className="sr-only"
                    />
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${form.kategori_pilihan === 'bisnis' ? 'bg-blue-950 border-blue-900 text-white' : 'bg-white border-gray-200 text-gray-600 group-hover:text-blue-500'}`}>
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base mb-1">Berwirausaha</h4>
                      <p className={`text-[10px] leading-relaxed ${form.kategori_pilihan === 'bisnis' ? 'text-blue-200/90' : 'text-gray-400'}`}>Mendirikan usaha mandiri, UMKM, niaga, maupun startup baru.</p>
                    </div>
                  </label>

                </div>
              </div>

              {/* DYNAMIC FORM SEGMENTS */}
              <div className="pt-6 border-t border-gray-150">
                <AnimatePresence mode="wait">
                  
                  {/* 1. KULIAH FIELDS */}
                  {form.kategori_pilihan === 'kuliah' && (
                    <motion.div 
                      key="kuliah-fields" 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }} 
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Jalur Seleksi <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <select 
                              value={form.jalur_seleksi} 
                              onChange={(e) => setForm({ ...form, jalur_seleksi: e.target.value })} 
                              className={selectClass}
                              required
                            >
                              <option value="">-- Pilih Jalur Seleksi --</option>
                              <option value="SNBP">SNBP (Prestasi Rapor)</option>
                              <option value="SNBT">SNBT (Ujian Tertulis UTBK)</option>
                              <option value="Mandiri">Mandiri PTN</option>
                              <option value="Kedinasan">Sekolah Kedinasan (IPDN, STAN, dll)</option>
                              <option value="Swasta">PTS / Swasta</option>
                              <option value="Lainnya">Lainnya</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none text-gray-450">
                              <Calendar className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className={labelClass}>Status Kelulusan <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <select 
                              value={form.status_seleksi} 
                              onChange={(e) => setForm({ ...form, status_seleksi: e.target.value })} 
                              className={selectClass}
                              required
                            >
                              <option value="Rencana">Masih Rencana / Belum Pengumuman</option>
                              <option value="Diterima">Sudah Diterima</option>
                              <option value="Tidak Diterima">Tidak Diterima</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-6">
                        <h3 className="font-bold text-xs text-blue-900 uppercase tracking-widest flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-blue-700"/> Pilihan 1 (Prioritas Utama)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className={labelClass}>Universitas / Institut <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              placeholder="Contoh: Universitas Indonesia"
                              value={form.univ_pilihan_1}
                              onChange={(e) => setForm({ ...form, univ_pilihan_1: e.target.value })}
                              className={inputClass}
                              required
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Program Studi / Jurusan <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              placeholder="Contoh: Teknik Informatika"
                              value={form.jurusan_pilihan_1}
                              onChange={(e) => setForm({ ...form, jurusan_pilihan_1: e.target.value })}
                              className={inputClass}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-6">
                        <h3 className="font-bold text-xs text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-gray-400"/> Pilihan 2 (Alternatif / Opsional)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className={labelClass}>Universitas / Institut</label>
                            <input 
                              type="text" 
                              placeholder="Contoh: Universitas Brawijaya"
                              value={form.univ_pilihan_2}
                              onChange={(e) => setForm({ ...form, univ_pilihan_2: e.target.value })}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Program Studi / Jurusan</label>
                            <input 
                              type="text" 
                              placeholder="Contoh: Sistem Informasi"
                              value={form.jurusan_pilihan_2}
                              onChange={(e) => setForm({ ...form, jurusan_pilihan_2: e.target.value })}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 2. KERJA FIELDS */}
                  {form.kategori_pilihan === 'kerja' && (
                    <motion.div 
                      key="kerja-fields" 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }} 
                      className="space-y-6"
                    >
                      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-6">
                        <h3 className="font-bold text-xs text-blue-900 uppercase tracking-widest flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-700"/> Target Karir & Industri Pekerjaan
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className={labelClass}>Nama Perusahaan / Instansi Target <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              placeholder="Contoh: PT Telkom Indonesia, Kepolisian RI"
                              value={form.nama_perusahaan}
                              onChange={(e) => setForm({ ...form, nama_perusahaan: e.target.value })}
                              className={inputClass}
                              required
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Posisi / Pekerjaan Target <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              placeholder="Contoh: Software Engineer, Staf Administrasi"
                              value={form.posisi_pekerjaan}
                              onChange={(e) => setForm({ ...form, posisi_pekerjaan: e.target.value })}
                              className={inputClass}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className={labelClass}>Estimasi Gaji Bulanan Target</label>
                          <div className="relative">
                            <select 
                              value={form.estimasi_gaji} 
                              onChange={(e) => setForm({ ...form, estimasi_gaji: e.target.value })} 
                              className={selectClass}
                            >
                              <option value="">-- Pilih Estimasi Gaji --</option>
                              <option value="< 3 Juta">Kurang dari Rp 3.000.000</option>
                              <option value="3 Juta - 5 Juta">Rp 3.000.000 - Rp 5.000.000</option>
                              <option value="5 Juta - 10 Juta">Rp 5.000.000 - Rp 10.000.000</option>
                              <option value="> 10 Juta">Lebih dari Rp 10.000.000</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none text-gray-450">
                              <Coins className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 3. BISNIS FIELDS */}
                  {form.kategori_pilihan === 'bisnis' && (
                    <motion.div 
                      key="bisnis-fields" 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }} 
                      className="space-y-6"
                    >
                      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-6">
                        <h3 className="font-bold text-xs text-blue-900 uppercase tracking-widest flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-700"/> Bidang Rintisan & Wirausaha
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className={labelClass}>Nama Bisnis / Brand Target <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              placeholder="Contoh: Kopi SMANSA, Toko Online Fashion"
                              value={form.nama_bisnis}
                              onChange={(e) => setForm({ ...form, nama_bisnis: e.target.value })}
                              className={inputClass}
                              required
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Sektor / Bidang Bisnis <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              placeholder="Contoh: Kuliner (F&B), Retail, IT"
                              value={form.bidang_bisnis}
                              onChange={(e) => setForm({ ...form, bidang_bisnis: e.target.value })}
                              className={inputClass}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className={labelClass}>Estimasi Modal Awal Target</label>
                          <div className="relative">
                            <select 
                              value={form.modal_awal} 
                              onChange={(e) => setForm({ ...form, modal_awal: e.target.value })} 
                              className={selectClass}
                            >
                              <option value="">-- Pilih Rentang Modal Awal --</option>
                              <option value="< 5 Juta">Kurang dari Rp 5.000.000</option>
                              <option value="5 Juta - 20 Juta">Rp 5.000.000 - Rp 20.000.000</option>
                              <option value="20 Juta - 100 Juta">Rp 20.000.000 - Rp 100.000.000</option>
                              <option value="> 100 Juta">Diatas Rp 100.000.000</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none text-gray-450">
                              <Coins className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                </AnimatePresence>
              </div>

              {/* Form submit buttons */}
              <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <button
                  type="button"
                  onClick={() => setVerifiedStudent(null)}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-250 hover:bg-gray-100 text-gray-600 rounded-full font-bold text-sm transition-colors cursor-pointer w-full sm:w-auto"
                >
                  Keluar / Ganti Akun
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-smansa-navy text-white px-10 py-4 rounded-full font-bold text-base inline-flex items-center justify-center gap-3 hover:bg-blue-900 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Simpan Rencana Karir
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
