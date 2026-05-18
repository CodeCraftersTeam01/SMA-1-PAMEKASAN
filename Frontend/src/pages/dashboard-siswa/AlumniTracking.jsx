import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AlumniTracking = () => {
  const { user, token, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    kategori_pilihan: 'kuliah', // 'kuliah' | 'kerja' | 'bisnis'
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

  // Prepopulate form if user already has tracking data
  useEffect(() => {
    const tracking = user?.siswa?.rencana_karir;
    if (tracking) {
      setFormData({
        kategori_pilihan: tracking.kategori_pilihan || 'kuliah',
        universitas_1: tracking.univ_pilihan_1 || '',
        jurusan_1: tracking.jurusan_pilihan_1 || '',
        universitas_2: tracking.univ_pilihan_2 || '',
        jurusan_2: tracking.jurusan_pilihan_2 || '',
        jalur_seleksi: tracking.jalur_seleksi || '',
        status_seleksi: tracking.status_seleksi || 'Rencana',
        nama_perusahaan: tracking.nama_perusahaan || '',
        posisi_pekerjaan: tracking.posisi_pekerjaan || '',
        estimasi_gaji: tracking.estimasi_gaji || '',
        bidang_bisnis: tracking.bidang_bisnis || '',
        nama_bisnis: tracking.nama_bisnis || '',
        modal_awal: tracking.modal_awal || ''
      });
    }
  }, [user]);

  const [isAllowed, setIsAllowed] = useState(null); // null = loading check, true = allowed, false = rejected
  const [errorMessage, setErrorMessage] = useState('');

  // Check tracking configuration & academic year permission
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/pengaturan-tracking`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        
        const config = response.data;
        if (!config || !config.is_open) {
          setIsAllowed(false);
          setErrorMessage("Akses Ditolak: Halaman kuesioner alumni tracking saat ini sedang ditutup oleh Admin.");
          return;
        }

        const studentYearId = user?.siswa?.tahun_ajaran_id;
        if (!studentYearId || studentYearId != config.tahun_ajaran_id) {
          setIsAllowed(false);
          setErrorMessage("Akses Ditolak: Tahun Ajaran Anda tidak memiliki hak akses untuk mengisi kuisioner alumni tracking.");
          return;
        }

        setIsAllowed(true);
      } catch (err) {
        console.error("Failed to check tracking access:", err);
        // Fallback: in case of local network issue, allow access
        setIsAllowed(true);
      }
    };

    if (user && token) {
      checkAccess();
    }
  }, [user, token, API_BASE_URL]);

  if (isAllowed === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <div className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 mt-4 uppercase tracking-wider">Memverifikasi Hak Akses Kuesioner...</p>
      </div>
    );
  }

  if (isAllowed === false) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl flex flex-col items-center justify-center min-h-[350px] text-center shadow-sm">
        <svg className="w-16 h-16 mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
        <p className="text-sm opacity-80 max-w-md">
          {errorMessage || "Tahun Ajaran Anda tidak memiliki akses untuk mengisi penelusuran alumni."}
        </p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectCategory = (category) => {
    setFormData(prev => ({ ...prev, kategori_pilihan: category }));
  };

  const validateStep3 = () => {
    const { kategori_pilihan, universitas_1, jurusan_1, nama_perusahaan, posisi_pekerjaan, bidang_bisnis, nama_bisnis } = formData;
    if (kategori_pilihan === 'kuliah') {
      return universitas_1 && jurusan_1;
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

      const response = await axios.post(`${API_BASE_URL}/api/student/tracking`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        setSubmitSuccess(true);
        if (refreshUser) await refreshUser();
      }
    } catch (error) {
      console.error('Error submitting tracking form:', error);
      setSubmitError(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[350px] text-center shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Rencana Karir Berhasil Disimpan!</h2>
        <p className="text-sm opacity-80 max-w-md mb-6">
          Terima kasih telah melengkapi data penelusuran karir alumni. Data Anda tersimpan dengan aman dan sangat berarti bagi kemajuan sekolah.
        </p>
        <button
          onClick={() => { setSubmitSuccess(false); setCurrentStep(1); }}
          className="px-6 py-2.5 text-xs font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-all"
        >
          Lihat / Ubah Data Rencana
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] border border-slate-100 p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800">Form Rencana Karir Alumni</h2>
        <p className="text-sm text-slate-500">Lengkapi data rencana studi lanjut, karir profesional, atau kewirausahaan Anda di bawah ini.</p>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center mb-8">
        <div className="flex-1 flex flex-col items-center relative">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
          <span className="text-[10px] mt-2 font-semibold text-slate-500">Identitas</span>
          <div className={`absolute top-5 left-[50%] w-full h-[2px] ${currentStep >= 2 ? 'bg-slate-900' : 'bg-slate-100'}`}></div>
        </div>
        <div className="flex-1 flex flex-col items-center relative">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
          <span className="text-[10px] mt-2 font-semibold text-slate-500">Pilih Jalur</span>
          <div className={`absolute top-5 left-[50%] w-full h-[2px] ${currentStep >= 3 ? 'bg-slate-900' : 'bg-slate-100'}`}></div>
        </div>
        <div className="flex-1 flex flex-col items-center relative">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 3 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
          <span className="text-[10px] mt-2 font-semibold text-slate-500">Rencana Detail</span>
        </div>
      </div>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
           <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Identitas */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-slate-700">NIS</label>
                  <input
                    type="text"
                    value={user?.siswa?.nis || user?.nis || user?.data_akademik?.nis || ''}
                    disabled
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-slate-700">NISN</label>
                  <input
                    type="text"
                    value={user?.siswa?.pendaftaran?.nisn || user?.data_akademik?.nisn || ''}
                    disabled
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 focus:outline-none"
                  />
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  value={user?.siswa?.nama_lengkap || user?.data_akademik?.nama_lengkap || user?.name || ''}
                  disabled
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 focus:outline-none"
                />
              </div>
          </div>
        )}

        {/* Step 2: Kategori Karir Selector */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="text-center max-w-md mx-auto mb-6">
               <h3 className="text-base font-bold text-slate-800">Pilih Jalur Rencana Karir Anda</h3>
               <p className="text-xs text-slate-500 mt-1">Langkah awal untuk mendata cita-cita dan rencana karir setelah Anda menyelesaikan pendidikan sekolah.</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
               <button
                 type="button"
                 onClick={() => selectCategory('kuliah')}
                 className={`p-6 rounded-3xl border text-center transition-all flex flex-col items-center justify-center gap-3 ${formData.kategori_pilihan === 'kuliah' ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.02]' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-white hover:border-slate-300'}`}
               >
                 <span className={`p-3 rounded-2xl ${formData.kategori_pilihan === 'kuliah' ? 'bg-white/10' : 'bg-white shadow-sm border border-slate-100'}`}>
                   <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                   </svg>
                 </span>
                 <div>
                   <h4 className="text-sm font-bold">Kuliah</h4>
                   <p className={`text-[10px] mt-1 ${formData.kategori_pilihan === 'kuliah' ? 'text-slate-300' : 'text-slate-400'}`}>Pendidikan Tinggi (PTN/PTS)</p>
                 </div>
               </button>

               <button
                 type="button"
                 onClick={() => selectCategory('kerja')}
                 className={`p-6 rounded-3xl border text-center transition-all flex flex-col items-center justify-center gap-3 ${formData.kategori_pilihan === 'kerja' ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.02]' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-white hover:border-slate-300'}`}
               >
                 <span className={`p-3 rounded-2xl ${formData.kategori_pilihan === 'kerja' ? 'bg-white/10' : 'bg-white shadow-sm border border-slate-100'}`}>
                   <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                   </svg>
                 </span>
                 <div>
                   <h4 className="text-sm font-bold">Bekerja</h4>
                   <p className={`text-[10px] mt-1 ${formData.kategori_pilihan === 'kerja' ? 'text-slate-300' : 'text-slate-400'}`}>Karir Profesional / Industri</p>
                 </div>
               </button>

               <button
                 type="button"
                 onClick={() => selectCategory('bisnis')}
                 className={`p-6 rounded-3xl border text-center transition-all flex flex-col items-center justify-center gap-3 ${formData.kategori_pilihan === 'bisnis' ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.02]' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-white hover:border-slate-300'}`}
               >
                 <span className={`p-3 rounded-2xl ${formData.kategori_pilihan === 'bisnis' ? 'bg-white/10' : 'bg-white shadow-sm border border-slate-100'}`}>
                   <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                   </svg>
                 </span>
                 <div>
                   <h4 className="text-sm font-bold">Wirausaha</h4>
                   <p className={`text-[10px] mt-1 ${formData.kategori_pilihan === 'bisnis' ? 'text-slate-300' : 'text-slate-400'}`}>Wirausaha / Bisnis Mandiri</p>
                 </div>
               </button>
             </div>
          </div>
        )}

        {/* Step 3: Rencana Karir Detail Input */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             
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
                         className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm"
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
                           className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm"
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
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
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
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
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
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
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
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
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
                         className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
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
                           className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
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
                           className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm"
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
                         className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
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
                           className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
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
                           className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm"
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

          </div>
        )}

        {/* Form Actions */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1 || isSubmitting}
            className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-colors ${currentStep === 1 ? 'text-slate-400 bg-slate-50 cursor-not-allowed' : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50'}`}
          >
            Kembali
          </button>
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 text-sm font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm shadow-slate-200"
            >
              Selanjutnya
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm shadow-slate-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
          )}
        </div>
      </form>
    </div>
  );
};

export default AlumniTracking;
