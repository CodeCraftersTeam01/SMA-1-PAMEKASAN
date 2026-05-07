import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AlumniTracking = () => {
  const { user, token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    semester_1: '',
    semester_2: '',
    semester_3: '',
    semester_4: '',
    semester_5: '',
    universitas_1: '',
    jurusan_1: '',
    universitas_2: '',
    jurusan_2: ''
  });

  // Strict Gating: Check if student is grade 12
  // We check both student_grade and grade to handle different possible structures from backend
  // const isGrade12 = user?.data_akademik?.grade === '12' || user?.data_akademik?.grade === 12 || user?.student_grade === '12' || user?.student_grade === 12 || user?.nis === '123456';
  const isGrade12 = true; // FORCE TRUE FOR TESTING

  if (!isGrade12) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-center shadow-sm">
        <svg className="w-16 h-16 mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-bold mb-2">Akses Ditolak: Fitur ini khusus untuk siswa Kelas 12.</h2>
        <p className="text-sm opacity-80 max-w-md">
          Anda belum bisa mengakses formulir penelusuran alumni ini. Fitur ini hanya diperuntukkan bagi siswa tingkat akhir (Kelas 12) untuk pendataan rencana pendidikan lanjutan.
        </p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep2 = () => {
    return formData.semester_1 && formData.semester_2 && formData.semester_3 && formData.semester_4 && formData.semester_5;
  };

  const validateStep3 = () => {
    return formData.universitas_1 && formData.jurusan_1; // Pilihan 2 optional
  };

  const handleNext = () => {
    if (currentStep === 2 && !validateStep2()) {
      alert("Harap lengkapi semua nilai rapor sebelum melanjutkan.");
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) {
       alert("Harap lengkapi Universitas dan Jurusan Pilihan 1.");
       return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        univ_pilihan_1: formData.universitas_1,
        jurusan_pilihan_1: formData.jurusan_1,
        univ_pilihan_2: formData.universitas_2,
        jurusan_pilihan_2: formData.jurusan_2,
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
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-center shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Data Berhasil Disimpan!</h2>
        <p className="text-sm opacity-80 max-w-md">
          Terima kasih telah melengkapi data penelusuran alumni. Data Anda sangat berarti bagi sekolah.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] border border-slate-100 p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800">Form Penelusuran Alumni</h2>
        <p className="text-sm text-slate-500">Lengkapi data di bawah ini dengan benar untuk keperluan pendataan alumni SMAN 1 Pamekasan.</p>
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
          <span className="text-[10px] mt-2 font-semibold text-slate-500">Akademik</span>
          <div className={`absolute top-5 left-[50%] w-full h-[2px] ${currentStep >= 3 ? 'bg-slate-900' : 'bg-slate-100'}`}></div>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 3 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
          <span className="text-[10px] mt-2 font-semibold text-slate-500">Rencana Karir</span>
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
                    value={user?.nis || user?.data_akademik?.nis || ''}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-slate-700">NISN</label>
                  <input
                    type="text"
                    value={user?.data_akademik?.nisn || ''}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 focus:outline-none"
                  />
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  value={user?.data_akademik?.nama_lengkap || user?.name || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 focus:outline-none"
                />
              </div>
          </div>
        )}

        {/* Step 2: Akademik */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <p className="text-sm text-slate-600 mb-4">Masukkan nilai rata-rata rapor Anda dari Semester 1 hingga Semester 5.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5].map(sem => (
                  <div key={sem} className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-slate-700">Nilai Semester {sem} <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      name={`semester_${sem}`}
                      value={formData[`semester_${sem}`]}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all"
                    />
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Step 3: Rencana Karir */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             
             <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
               <h3 className="font-semibold text-sm text-blue-800">Pilihan 1 (Utama)</h3>
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all"
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all"
                    />
                  </div>
               </div>
             </div>

             <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
               <h3 className="font-semibold text-sm text-slate-600">Pilihan 2 (Alternatif / Opsional)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-slate-700">Universitas Pilihan 2</label>
                    <input
                      type="text"
                      name="universitas_2"
                      value={formData.universitas_2}
                      onChange={handleInputChange}
                      placeholder="Contoh: Universitas Airlangga"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all"
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all"
                    />
                  </div>
               </div>
             </div>

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
                'Simpan Data'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AlumniTracking;
