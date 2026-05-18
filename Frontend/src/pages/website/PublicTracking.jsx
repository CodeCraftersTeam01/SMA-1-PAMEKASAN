import React, { useState } from 'react';
import axios from 'axios';

const PublicTracking = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  
  // Verification State
  const [credentials, setCredentials] = useState({ nis: '', nisn: '' });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifiedStudent, setVerifiedStudent] = useState(null); // holds student data once verified

  // Questionnaire Steps & State
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    kategori_pilihan: 'kuliah',
    universitas_1: '',
    jurusan_1: '',
    universitas_2: '',
    jurusan_2: '',
    jalur_seleksi: '',
    status_seleksi: 'Rencana',
    nama_perusahaan: '',
    posisi_pekerjaan: '',
    estimasi_gaji: '',
    bidang_bisnis: '',
    nama_bisnis: '',
    modal_awal: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handle credentials verification
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!credentials.nis || !credentials.nisn) {
      setVerifyError("Harap lengkapi NIS dan NISN Anda.");
      return;
    }

    setIsVerifying(true);
    setVerifyError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/public/alumni-tracking/verify`, {
        nis: credentials.nis,
        nisn: credentials.nisn
      });

      if (response.status === 200) {
        const result = response.data;
        setVerifiedStudent(result.siswa);
        
        // Prepopulate if they already filled it
        if (result.rencana_karir) {
          const rk = result.rencana_karir;
          setFormData({
            kategori_pilihan: rk.kategori_pilihan || 'kuliah',
            universitas_1: rk.univ_pilihan_1 || '',
            jurusan_1: rk.jurusan_pilihan_1 || '',
            universitas_2: rk.univ_pilihan_2 || '',
            jurusan_2: rk.jurusan_pilihan_2 || '',
            jalur_seleksi: rk.jalur_seleksi || '',
            status_seleksi: rk.status_seleksi || 'Rencana',
            nama_perusahaan: rk.nama_perusahaan || '',
            posisi_pekerjaan: rk.posisi_pekerjaan || '',
            estimasi_gaji: rk.estimasi_gaji || '',
            bidang_bisnis: rk.bidang_bisnis || '',
            nama_bisnis: rk.nama_bisnis || '',
            modal_awal: rk.modal_awal || ''
          });
        }
        setCurrentStep(1); // Go to step 1 of questionnaire
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerifyError(error.response?.data?.message || "Gagal verifikasi. Periksa kembali kombinasi NIS & NISN Anda.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectCategory = (category) => {
    setFormData(prev => ({ ...prev, kategori_pilihan: category }));
  };

  const validateStep3 = () => {
    const { kategori_pilihan, universitas_1, jurusan_1, nama_perusahaan, posisi_pekerjaan, bidang_bisnis, nama_bisnis, jalur_seleksi, status_seleksi } = formData;
    if (kategori_pilihan === 'kuliah') {
      return jalur_seleksi && status_seleksi && universitas_1 && jurusan_1;
    }
    if (kategori_pilihan === 'kerja') {
      return nama_perusahaan && posisi_pekerjaan;
    }
    if (kategori_pilihan === 'bisnis') {
      return bidang_bisnis && nama_bisnis;
    }
    return false;
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) {
       alert("Harap lengkapi semua field wajib (*) bertanda bintang.");
       return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        nis: credentials.nis,
        nisn: credentials.nisn,
        kategori_pilihan: formData.kategori_pilihan,
        
        // Kuliah
        univ_pilihan_1: formData.kategori_pilihan === 'kuliah' ? formData.universitas_1 : null,
        jurusan_pilihan_1: formData.kategori_pilihan === 'kuliah' ? formData.jurusan_1 : null,
        univ_pilihan_2: formData.kategori_pilihan === 'kuliah' ? formData.universitas_2 : null,
        jurusan_pilihan_2: formData.kategori_pilihan === 'kuliah' ? formData.jurusan_2 : null,
        jalur_seleksi: formData.kategori_pilihan === 'kuliah' ? formData.jalur_seleksi : null,
        status_seleksi: formData.kategori_pilihan === 'kuliah' ? formData.status_seleksi : null,

        // Kerja
        nama_perusahaan: formData.kategori_pilihan === 'kerja' ? formData.nama_perusahaan : null,
        posisi_pekerjaan: formData.kategori_pilihan === 'kerja' ? formData.posisi_pekerjaan : null,
        estimasi_gaji: formData.kategori_pilihan === 'kerja' ? formData.estimasi_gaji : null,

        // Bisnis
        bidang_bisnis: formData.kategori_pilihan === 'bisnis' ? formData.bidang_bisnis : null,
        nama_bisnis: formData.kategori_pilihan === 'bisnis' ? formData.nama_bisnis : null,
        modal_awal: formData.kategori_pilihan === 'bisnis' ? formData.modal_awal : null,
      };

      const response = await axios.post(`${API_BASE_URL}/api/public/alumni-tracking/submit`, payload);

      if (response.status === 200 || response.status === 201) {
        setSubmitSuccess(true);
      }
    } catch (error) {
      console.error('Error submitting public tracking form:', error);
      setSubmitError(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI SUCCESS PAGE
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-slate-200 selection:text-slate-800">
        <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-850 mb-2">Penelusuran Berhasil Disimpan!</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
            Terima kasih {verifiedStudent?.nama}. Data rencana karir alumni Anda telah terekam dengan aman dalam sistem SMAN 1 Pamekasan.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitSuccess(false);
              setVerifiedStudent(null);
              setCredentials({ nis: '', nisn: '' });
              setCurrentStep(1);
            }}
            className="w-full py-3.5 text-xs font-semibold rounded-2xl text-white bg-slate-900 hover:bg-slate-800 transition-all font-bold tracking-wider uppercase active:scale-98 cursor-pointer"
          >
            Selesai & Keluar
          </button>
        </div>
      </div>
    );
  }

  // Status State
  const [portalStatus, setPortalStatus] = useState({ isOpen: true, message: '', loading: true });

  // Fetch Portal Status on Mount
  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/public/alumni-tracking/status`);
        setPortalStatus({
          isOpen: response.data.is_open,
          message: response.data.message,
          loading: false
        });
      } catch (error) {
        setPortalStatus({
          isOpen: false,
          message: 'Gagal terhubung ke server. Silakan coba lagi nanti.',
          loading: false
        });
      }
    };
    fetchStatus();
  }, [API_BASE_URL]);

  // PORTAL VERIFIKASI (Verification Portal UI - Light Mode matching student login portal)
  if (!verifiedStudent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        
        {/* Subtle Background Art */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-slate-100 blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-900"></div>
          
          <div className="mb-6 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <svg className="w-6 h-6 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V7a4 4 0 00-8 0v4c0 2.5 1.96 4.714 4.542 5.291M21 12c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09a13.916 13.916 0 002.138-8.441V7a4 4 0 00-8 0v4c0 2.5 1.96 4.714 4.542 5.291M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1.5">
              Penelusuran Alumni
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              {portalStatus.loading 
                ? 'Memeriksa status portal...' 
                : portalStatus.isOpen 
                  ? 'Silakan verifikasi NIS & NISN Anda untuk memulai pengisian rencana karir alumni mandiri.'
                  : 'Mohon maaf, layanan ini tidak tersedia saat ini.'}
            </p>
          </div>

          {portalStatus.loading ? (
            <div className="py-12 flex justify-center">
              <svg className="animate-spin w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : !portalStatus.isOpen ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center my-6">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-red-800 mb-1">Akses Ditolak</h3>
              <p className="text-xs text-red-600 leading-relaxed font-medium">
                {portalStatus.message || 'Pengisian penelusuran alumni mandiri saat ini sedang ditutup oleh pihak sekolah.'}
              </p>
            </div>
          ) : (
            <>
              {verifyError && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl flex items-center gap-2.5">
                  <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{verifyError}</span>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nomor Induk Siswa (NIS)</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan NIS..."
                    value={credentials.nis}
                    onChange={(e) => setCredentials({ ...credentials, nis: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3 px-4 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/10 focus:border-slate-500 transition-all font-semibold"
                    disabled={isVerifying}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nomor Induk Siswa Nasional (NISN)</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan NISN..."
                    value={credentials.nisn}
                    onChange={(e) => setCredentials({ ...credentials, nisn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3 px-4 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/10 focus:border-slate-500 transition-all font-semibold"
                    disabled={isVerifying}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Memverifikasi...</span>
                    </>
                  ) : "Masuk & Mulai Pengisian"}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <a href="/" className="text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Beranda Utama
            </a>
          </div>
        </div>
      </div>
    );
  }

  // KUISIONER MULTI-STEP ALUMNI (Light Mode theme matching Student Dashboard perfectly)
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-900"></div>

        {/* Top Mini Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Form Rencana Karir Alumni</h2>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Siswa: {verifiedStudent.nama} ({verifiedStudent.nis})</p>
          </div>
          <span className="self-start sm:self-center px-3 py-1 font-bold text-[9px] uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200/50 rounded-full">
            Tahun Lulus: {verifiedStudent.tahun_lulus}
          </span>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center mb-8 bg-slate-50 p-4 border border-slate-100 rounded-2xl">
          <div className="flex-1 flex flex-col items-center relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 1 ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>1</div>
            <span className="text-[9px] mt-1.5 font-bold uppercase tracking-wider text-slate-500">Identitas</span>
            <div className={`absolute top-4 left-[50%] w-full h-[2px] ${currentStep >= 2 ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
          </div>
          <div className="flex-1 flex flex-col items-center relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 2 ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>2</div>
            <span className="text-[9px] mt-1.5 font-bold uppercase tracking-wider text-slate-500">Pilih Jalur</span>
            <div className={`absolute top-4 left-[50%] w-full h-[2px] ${currentStep >= 3 ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
          </div>
          <div className="flex-1 flex flex-col items-center relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 3 ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>3</div>
            <span className="text-[9px] mt-1.5 font-bold uppercase tracking-wider text-slate-500">Rencana Detail</span>
          </div>
        </div>

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-150 text-red-600 text-xs rounded-2xl flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{submitError}</span>
          </div>
        )}

        {/* STEP 1: IDENTITAS (Review information) */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Verifikasi Data Akademik
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600">
                <div className="bg-white p-3.5 rounded-xl border border-slate-150">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nama Lengkap</p>
                  <p className="text-sm font-semibold text-slate-800">{verifiedStudent.nama}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-150">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nomor Induk Siswa (NIS)</p>
                  <p className="text-sm font-semibold text-slate-800">{verifiedStudent.nis}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-150">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nomor Induk Siswa Nasional (NISN)</p>
                  <p className="text-sm font-semibold text-slate-800">{verifiedStudent.nisn}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-150">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Tahun Lulus</p>
                  <p className="text-sm font-semibold text-slate-800">{verifiedStudent.tahun_lulus}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex gap-3 text-xs text-slate-600">
              <svg className="w-5 h-5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="leading-relaxed">
                Silakan klik tombol "Lanjutkan" jika data di atas sudah benar untuk mulai memilih rencana karir Anda setelah lulus sekolah.
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVerifiedStudent(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all font-semibold text-xs cursor-pointer"
              >
                Ganti Siswa (Keluar)
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PILIH JALUR (Category Selector) */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Pilih Jalur Rencana Karir</h3>
              <p className="text-xs text-slate-400">Pilih salah satu dari 3 jalur di bawah ini yang menggambarkan rencana utama Anda setelah lulus.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Option: Kuliah */}
              <div 
                onClick={() => selectCategory('kuliah')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer hover:border-slate-400 flex flex-col justify-between h-44 ${formData.kategori_pilihan === 'kuliah' ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${formData.kategori_pilihan === 'kuliah' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <div>
                  <h4 className={`font-bold text-sm mb-1 ${formData.kategori_pilihan === 'kuliah' ? 'text-white' : 'text-slate-800'}`}>Kuliah</h4>
                  <p className={`text-[10px] leading-relaxed font-semibold ${formData.kategori_pilihan === 'kuliah' ? 'text-slate-300' : 'text-slate-400'}`}>Melanjutkan pendidikan tinggi di perguruan tinggi negeri maupun swasta.</p>
                </div>
              </div>

              {/* Option: Bekerja */}
              <div 
                onClick={() => selectCategory('kerja')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer hover:border-slate-400 flex flex-col justify-between h-44 ${formData.kategori_pilihan === 'kerja' ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${formData.kategori_pilihan === 'kerja' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className={`font-bold text-sm mb-1 ${formData.kategori_pilihan === 'kerja' ? 'text-white' : 'text-slate-800'}`}>Kerja</h4>
                  <p className={`text-[10px] leading-relaxed font-semibold ${formData.kategori_pilihan === 'kerja' ? 'text-slate-300' : 'text-slate-400'}`}>Masuk ke dunia profesional karir, baik BUMN, swasta, TNI/POLRI, maupun instansi.</p>
                </div>
              </div>

              {/* Option: Wirausaha */}
              <div 
                onClick={() => selectCategory('bisnis')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer hover:border-slate-400 flex flex-col justify-between h-44 ${formData.kategori_pilihan === 'bisnis' ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${formData.kategori_pilihan === 'bisnis' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className={`font-bold text-sm mb-1 ${formData.kategori_pilihan === 'bisnis' ? 'text-white' : 'text-slate-800'}`}>Wirausaha</h4>
                  <p className={`text-[10px] leading-relaxed font-semibold ${formData.kategori_pilihan === 'bisnis' ? 'text-slate-300' : 'text-slate-400'}`}>Membangun rintisan usaha mandiri, startup, UMKM, dagang, maupun industri kreatif.</p>
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all font-semibold text-xs cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DETAIL RENCANA (Dynamic Input Fields - Light Theme) */}
        {currentStep === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             
             {/* 1. KULIAH FORM */}
             {formData.kategori_pilihan === 'kuliah' && (
               <div className="space-y-5">
                 
                 <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-4">
                   <h3 className="font-bold text-xs text-emerald-800 uppercase tracking-wider">Metode Seleksi Kampus</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1.5 animate-in fade-in duration-300">
                       <label className="text-[12px] font-semibold text-slate-700">Jalur Seleksi <span className="text-red-500">*</span></label>
                       <select
                         name="jalur_seleksi"
                         value={formData.jalur_seleksi}
                         onChange={handleInputChange}
                         required
                         className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm font-semibold"
                       >
                         <option value="">-- Pilih Jalur Seleksi --</option>
                         <option value="SNBP">SNBP (Seleksi Nasional Berdasarkan Prestasi)</option>
                         <option value="SNBT">SNBT (Seleksi Nasional Berdasarkan Tes)</option>
                         <option value="Mandiri">Seleksi Mandiri PTN</option>
                         <option value="Kedinasan">Sekolah Kedinasan</option>
                         <option value="Swasta">PTS / Kampus Swasta</option>
                         <option value="Lainnya">Lainnya</option>
                       </select>
                     </div>

                     {formData.jalur_seleksi && (
                       <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                         <label className="text-[12px] font-semibold text-slate-700">Status Kelulusan <span className="text-red-500">*</span></label>
                         <select
                           name="status_seleksi"
                           value={formData.status_seleksi}
                           onChange={handleInputChange}
                           required
                           className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm font-semibold"
                         >
                           <option value="Rencana">Masih Rencana / Belum Pengumuman</option>
                           <option value="Diterima">Sudah Diterima</option>
                           <option value="Tidak Diterima">Tidak Diterima</option>
                         </select>
                       </div>
                     )}
                   </div>
                 </div>

                 {formData.jalur_seleksi && formData.status_seleksi && (
                   <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                     <h3 className="font-bold text-xs text-blue-800 uppercase tracking-wider">Pilihan 1 (Utama)</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-semibold text-slate-700">Universitas Pilihan 1 <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="universitas_1"
                            value={formData.universitas_1}
                            onChange={handleInputChange}
                            placeholder="Contoh: Universitas Gadjah Mada"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-semibold text-slate-700">Jurusan Pilihan 1 <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="jurusan_1"
                            value={formData.jurusan_1}
                            onChange={handleInputChange}
                            placeholder="Contoh: Kedokteran"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm font-semibold"
                          />
                        </div>
                     </div>
                   </div>
                 )}

                 {formData.jalur_seleksi && formData.status_seleksi && formData.universitas_1 && formData.jurusan_1 && (
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                     <h3 className="font-bold text-xs text-slate-600 uppercase tracking-wider">Pilihan 2 (Alternatif / Opsional)</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-semibold text-slate-700">Universitas Pilihan 2</label>
                          <input
                            type="text"
                            name="universitas_2"
                            value={formData.universitas_2}
                            onChange={handleInputChange}
                            placeholder="Contoh: Universitas Airlangga"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-semibold text-slate-700">Jurusan Pilihan 2</label>
                          <input
                            type="text"
                            name="jurusan_2"
                            value={formData.jurusan_2}
                            onChange={handleInputChange}
                            placeholder="Contoh: Farmasi"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm font-semibold"
                          />
                        </div>
                     </div>
                   </div>
                 )}

               </div>
             )}

             {/* 2. BEKERJA FORM */}
             {formData.kategori_pilihan === 'kerja' && (
               <div className="space-y-5">
                 <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                   <h3 className="font-bold text-xs text-blue-800 uppercase tracking-wider">Rencana Karir Profesional</h3>
                   
                   <div className="grid grid-cols-1 gap-4">
                     <div className="space-y-1.5 animate-in fade-in duration-300">
                       <label className="text-[12px] font-semibold text-slate-700">Nama Perusahaan / Industri Target <span className="text-red-500">*</span></label>
                       <input
                         type="text"
                         name="nama_perusahaan"
                         value={formData.nama_perusahaan}
                         onChange={handleInputChange}
                         placeholder="Contoh: PT Telkom Indonesia, Perbankan, BUMN"
                         required
                         className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm font-semibold"
                       />
                     </div>

                     {formData.nama_perusahaan && (
                       <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                         <label className="text-[12px] font-semibold text-slate-700">Posisi / Pekerjaan Target <span className="text-red-500">*</span></label>
                         <input
                           type="text"
                           name="posisi_pekerjaan"
                           value={formData.posisi_pekerjaan}
                           onChange={handleInputChange}
                           placeholder="Contoh: Software Engineer, Staf Administrasi"
                           required
                           className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm font-semibold"
                         />
                       </div>
                     )}

                     {formData.nama_perusahaan && formData.posisi_pekerjaan && (
                       <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                         <label className="text-[12px] font-semibold text-slate-700">Estimasi Gaji Bulanan Target (Opsional)</label>
                         <select
                           name="estimasi_gaji"
                           value={formData.estimasi_gaji}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm font-semibold cursor-pointer"
                         >
                           <option value="">-- Pilih Estimasi Gaji --</option>
                           <option value="< 3 Juta">Kurang dari Rp 3.000.000</option>
                           <option value="3 Juta - 5 Juta">Rp 3.000.000 - Rp 5.000.000</option>
                           <option value="5 Juta - 10 Juta">Rp 5.000.000 - Rp 10.000.000</option>
                           <option value="> 10 Juta">Diatas Rp 10.000.000</option>
                         </select>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             )}

             {/* 3. WIRAUSAHA FORM */}
             {formData.kategori_pilihan === 'bisnis' && (
               <div className="space-y-5">
                 <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                   <h3 className="font-bold text-xs text-blue-800 uppercase tracking-wider">Rencana Wirausaha / Bisnis Mandiri</h3>
                   
                   <div className="grid grid-cols-1 gap-4">
                     <div className="space-y-1.5 animate-in fade-in duration-300">
                       <label className="text-[12px] font-semibold text-slate-700">Bidang / Sektor Bisnis <span className="text-red-500">*</span></label>
                       <input
                         type="text"
                         name="bidang_bisnis"
                         value={formData.bidang_bisnis}
                         onChange={handleInputChange}
                         placeholder="Contoh: Kuliner, Fashion, Teknologi Informasi"
                         required
                         className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm font-semibold"
                       />
                     </div>

                     {formData.bidang_bisnis && (
                       <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                         <label className="text-[12px] font-semibold text-slate-700">Nama Bisnis / Rencana Ide Usaha <span className="text-red-500">*</span></label>
                         <input
                           type="text"
                           name="nama_bisnis"
                           value={formData.nama_bisnis}
                           onChange={handleInputChange}
                           placeholder="Contoh: Café Kopi, Startup E-commerce"
                           required
                           className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm font-semibold"
                         />
                       </div>
                     )}

                     {formData.bidang_bisnis && formData.nama_bisnis && (
                       <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                         <label className="text-[12px] font-semibold text-slate-700">Kebutuhan Estimasi Modal Awal (Opsional)</label>
                         <select
                           name="modal_awal"
                           value={formData.modal_awal}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm font-semibold cursor-pointer"
                         >
                           <option value="">-- Pilih Rentang Modal Awal --</option>
                           <option value="< 5 Juta">Kurang dari Rp 5.000.000</option>
                           <option value="5 Juta - 20 Juta">Rp 5.000.000 - Rp 20.000.000</option>
                           <option value="20 Juta - 100 Juta">Rp 20.000.000 - Rp 100.000.000</option>
                           <option value="> 100 Juta">Diatas Rp 100.000.000</option>
                         </select>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             )}

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-medium rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm shadow-slate-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Rencana Karir'
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default PublicTracking;
