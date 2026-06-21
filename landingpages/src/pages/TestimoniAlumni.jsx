import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  RefreshCw, 
  Lock, 
  ShieldAlert, 
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TestimonialForm from '../components/TestimonialForm';

const API_BASE = 'http://localhost:8000/api/public';

export default function TestimoniAlumni() {
  const [portalStatus, setPortalStatus] = useState({ isOpen: true, message: '', loading: true });
  
  // Login State
  const [credentials, setCredentials] = useState({ nis: '', tanggal_lahir: '', captcha_code: '' });
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  
  // Testimonial State
  const [testimonialDone, setTestimonialDone] = useState(false);
  const [defaultOccupation, setDefaultOccupation] = useState('');

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
        
        let occ = '';
        if (data.rencana_karir) {
          const rk = data.rencana_karir;
          if (rk.kategori_pilihan === 'kuliah') {
            occ = rk.univ_pilihan_1 ? rk.univ_pilihan_1 + (rk.jurusan_pilihan_1 ? ' - ' + rk.jurusan_pilihan_1 : '') : '';
          } else if (rk.kategori_pilihan === 'kerja') {
            occ = rk.nama_perusahaan ? rk.nama_perusahaan + (rk.posisi_pekerjaan ? ' - ' + rk.posisi_pekerjaan : '') : '';
          } else if (rk.kategori_pilihan === 'bisnis') {
            occ = rk.nama_bisnis ? rk.nama_bisnis + (rk.bidang_bisnis ? ' - ' + rk.bidang_bisnis : '') : '';
          }
        }
        setDefaultOccupation(occ);
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

  const inputClass = "w-full bg-white border border-gray-200 rounded-full px-6 py-3.5 text-gray-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm";
  const labelClass = "block text-xs font-bold text-smansa-navy mb-2 uppercase tracking-wider ml-2";

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
        </Link>

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
              <h1 className="text-4xl md:text-5xl font-bold text-smansa-navy mb-4 tracking-tight">Kirim Testimoni</h1>
              <p className="text-gray-600 text-lg max-w-xl mx-auto">
                Silakan verifikasi data Alumni Anda menggunakan NIS dan Tanggal Lahir.
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
                  {portalStatus.message || 'Mohon maaf, portal ini saat ini ditutup oleh administrator sekolah.'}
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
                    {isVerifying ? 'Memverifikasi...' : 'Verifikasi Data Alumni'}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            {!testimonialDone ? (
              <>
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.03)] mb-8">
                  <h2 className="text-2xl font-bold text-smansa-navy mb-2 tracking-tight">Halo, {verifiedStudent.nama}!</h2>
                  <p className="text-gray-500 text-sm">
                    Silakan isi form di bawah untuk mengirimkan testimoni Anda.
                  </p>
                </div>

                <TestimonialForm 
                  lockedRole="alumni"
                  defaultName={verifiedStudent.nama || ""}
                  defaultGraduationYear={verifiedStudent.tahun_lulus || ""}
                  defaultOccupation={defaultOccupation}
                  onSuccessCallback={() => setTestimonialDone(true)}
                />
              </>
            ) : (
              <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-blue-400 to-blue-600"></div>
                
                <h2 className="text-3xl font-bold text-smansa-navy mb-4 tracking-tight">Terima Kasih!</h2>
                <p className="text-gray-500 leading-relaxed max-w-sm mx-auto mb-10 text-base">
                  Testimoni Anda telah berhasil dikirimkan dan menunggu persetujuan Admin.
                </p>
                
                <Link
                  to="/"
                  className="inline-block px-10 py-4 bg-smansa-navy text-white hover:bg-blue-900 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
