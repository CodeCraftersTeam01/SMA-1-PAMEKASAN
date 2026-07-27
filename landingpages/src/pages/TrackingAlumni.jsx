import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
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
  Coins,
  Search,
  PenTool,
  MapPin,
  Users
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
  const [entryMode, setEntryMode] = useState(null); // 'auto', 'manual', or null
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'directory', 'form'
  const [alumniList, setAlumniList] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [flyToCoords, setFlyToCoords] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const mapRef = useRef(null);

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

    // Koordinat
    latitude: '',
    longitude: '',
  });

  const [manualProfile, setManualProfile] = useState({
    nama_lengkap: '',
    tahun_lulus: '',
    jurusan: 'MIPA',
    email: '',
    nomor_hp: '',
    alamat_domisili: '',
    latitude: '',
    longitude: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
    fetchAlumniData(null);
  }, []);

  const fetchAlumniData = async (mapObj) => {
    try {
      const res = await fetch(`${API_BASE}/alumni-tracking/map-data`, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY || 'smansa123',
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setAlumniList(data.data || []);
        if (mapObj) {
          addMarkersToMap(mapObj, data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch alumni map data:', err);
    } finally {
      setMapLoading(false);
    }
  };

  const addMarkersToMap = (map, list) => {
    if (!window.L) return;
    list.forEach(al => {
      if (al.latitude && al.longitude) {
        const iconColor = al.status_saat_ini === 'kuliah' ? 'blue' 
                        : al.status_saat_ini === 'kerja' ? 'emerald' 
                        : al.status_saat_ini === 'wirausaha' ? 'amber' : 'gray';

        const customMarkerIcon = window.L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div class="w-8 h-8 rounded-full bg-${
            iconColor === 'emerald' ? 'emerald-500' : iconColor === 'amber' ? 'amber-500' : 'blue-500'
          } border-2 border-white flex items-center justify-center shadow-lg text-white font-bold text-xs"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        const marker = window.L.marker([al.latitude, al.longitude], { icon: customMarkerIcon }).addTo(map);

        marker.bindPopup(`<strong>${al.nama_lengkap}</strong><br>Lulusan ${al.tahun_lulus}`);
        
        marker.on('click', () => {
          setSelectedAlumni(al);
        });
      }
    });
  };

  useEffect(() => {
    if (activeTab !== 'map') return;

    let mapInstance = null;
    let linkTag = null;
    let scriptTag = null;

    const loadLeaflet = () => {
      if (!document.getElementById('leaflet-css')) {
        linkTag = document.createElement('link');
        linkTag.id = 'leaflet-css';
        linkTag.rel = 'stylesheet';
        linkTag.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(linkTag);
      }

      if (!window.L) {
        scriptTag = document.createElement('script');
        scriptTag.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        scriptTag.async = true;
        scriptTag.onload = () => {
          initializeMap();
        };
        document.head.appendChild(scriptTag);
      } else {
        setTimeout(initializeMap, 100);
      }
    };

    const initializeMap = () => {
      const mapContainer = document.getElementById('alumni-map');
      if (!mapContainer) {
        // Retry in 50ms if the container is not in the DOM yet due to active transitions
        setTimeout(initializeMap, 50);
        return;
      }
      if (!window.L) return;

      // Prevent double initialization if map is already instantiated
      if (mapRef.current) return;

      mapInstance = window.L.map('alumni-map', {
        zoomControl: false
      }).setView([-7.1613, 113.4831], 7);
      
      mapRef.current = mapInstance;

      window.L.control.zoom({
        position: 'topright'
      }).addTo(mapInstance);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      // Check if we need to fly to specific coords (selected alumnus)
      if (flyToCoords) {
        mapInstance.setView(flyToCoords, 14);
        setFlyToCoords(null);
      }

      fetchAlumniData(mapInstance);

      // Fix Leaflet grey tiles sizing issues during transition animations
      setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
      }, 100);
      setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
      }, 300);
      setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
      }, 600);
    };

    loadLeaflet();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeTab, flyToCoords]);

  // Handle layout shifts or state shifts that could cause grey Leaflet tiles (especially during details viewing)
  useEffect(() => {
    if (activeTab === 'map' && mapRef.current) {
      const map = mapRef.current;
      setTimeout(() => map && map.invalidateSize(), 50);
      setTimeout(() => map && map.invalidateSize(), 200);
      setTimeout(() => map && map.invalidateSize(), 450);
    }
  }, [selectedAlumni, activeTab]);

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
        setForm(prev => ({
          ...prev,
          latitude: data.siswa.latitude || '',
          longitude: data.siswa.longitude || '',
        }));
        if (data.rencana_karir) {
          const rk = data.rencana_karir;
          setForm(prev => ({
            ...prev,
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
          }));
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

    const payload = verifiedStudent?.is_manual
      ? {
          is_manual: true,
          nama_lengkap: manualProfile.nama_lengkap,
          tahun_lulus: manualProfile.tahun_lulus,
          jurusan: manualProfile.jurusan,
          email: manualProfile.email,
          nomor_hp: manualProfile.nomor_hp,
          alamat_domisili: manualProfile.alamat_domisili,
          latitude: manualProfile.latitude,
          longitude: manualProfile.longitude,
          captcha_key: captchaKey,
          captcha_code: credentials.captcha_code,
          kategori_pilihan: form.kategori_pilihan,
          univ_pilihan_1: form.kategori_pilihan === 'kuliah' ? form.univ_pilihan_1 : null,
          jurusan_pilihan_1: form.kategori_pilihan === 'kuliah' ? form.jurusan_pilihan_1 : null,
          univ_pilihan_2: form.kategori_pilihan === 'kuliah' ? form.univ_pilihan_2 : null,
          jurusan_pilihan_2: form.kategori_pilihan === 'kuliah' ? form.jurusan_pilihan_2 : null,
          jalur_seleksi: form.kategori_pilihan === 'kuliah' ? form.jalur_seleksi : null,
          status_seleksi: form.kategori_pilihan === 'kuliah' ? form.status_seleksi : null,
          nama_perusahaan: form.kategori_pilihan === 'kerja' ? form.nama_perusahaan : null,
          posisi_pekerjaan: form.kategori_pilihan === 'kerja' ? form.posisi_pekerjaan : null,
          estimasi_gaji: form.kategori_pilihan === 'kerja' ? form.estimasi_gaji : null,
          bidang_bisnis: form.kategori_pilihan === 'bisnis' ? form.bidang_bisnis : null,
          nama_bisnis: form.kategori_pilihan === 'bisnis' ? form.nama_bisnis : null,
          modal_awal: form.kategori_pilihan === 'bisnis' ? form.modal_awal : null,
        }
      : {
          nis: credentials.nis,
          tanggal_lahir: credentials.tanggal_lahir,
          kategori_pilihan: form.kategori_pilihan,
          latitude: form.latitude,
          longitude: form.longitude,
          univ_pilihan_1: form.kategori_pilihan === 'kuliah' ? form.univ_pilihan_1 : null,
          jurusan_pilihan_1: form.kategori_pilihan === 'kuliah' ? form.jurusan_pilihan_1 : null,
          univ_pilihan_2: form.kategori_pilihan === 'kuliah' ? form.univ_pilihan_2 : null,
          jurusan_pilihan_2: form.kategori_pilihan === 'kuliah' ? form.jurusan_pilihan_2 : null,
          jalur_seleksi: form.kategori_pilihan === 'kuliah' ? form.jalur_seleksi : null,
          status_seleksi: form.kategori_pilihan === 'kuliah' ? form.status_seleksi : null,
          nama_perusahaan: form.kategori_pilihan === 'kerja' ? form.nama_perusahaan : null,
          posisi_pekerjaan: form.kategori_pilihan === 'kerja' ? form.posisi_pekerjaan : null,
          estimasi_gaji: form.kategori_pilihan === 'kerja' ? form.estimasi_gaji : null,
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
        if (verifiedStudent?.is_manual) {
          setVerifiedStudent({
            is_manual: true,
            nama: manualProfile.nama_lengkap,
            tahun_lulus: manualProfile.tahun_lulus,
            nis: '',
            nisn: '',
            kelas: manualProfile.jurusan,
          });
        }
        setSubmitSuccess(true);
      } else {
        setStatus({ type: 'error', message: data.message || 'Terjadi kesalahan saat menyimpan data.' });
        if (verifiedStudent?.is_manual) {
          fetchCaptcha();
        }
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
              <div className="absolute top-0 left-0 w-full h-1.25 bg-linear-to-r from-green-400 to-emerald-500"></div>
              
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
                  setEntryMode(null);
                  setCredentials({ nis: '', tanggal_lahir: '', captcha_code: '' });
                  setManualProfile({
                    nama_lengkap: '',
                    tahun_lulus: '',
                    jurusan: 'MIPA',
                    email: '',
                    nomor_hp: '',
                    alamat_domisili: '',
                  });
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
            <div className="absolute top-0 left-0 w-full h-1.25 bg-linear-to-r from-blue-400 to-blue-600"></div>
            
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
                setEntryMode(null);
                setCredentials({ nis: '', tanggal_lahir: '', captcha_code: '' });
                setManualProfile({
                  nama_lengkap: '',
                  tahun_lulus: '',
                  jurusan: 'MIPA',
                  email: '',
                  nomor_hp: '',
                  alamat_domisili: '',
                });
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
      <SEO 
        title="Penelusuran Alumni (Tracer Study)"
        description="Sistem Penelusuran Alumni (Tracer Study) Resmi SMAN 1 Pamekasan. Membantu memetakan sebaran alumni di perguruan tinggi dan dunia kerja."
        keywords="tracer study SMAN 1 Pamekasan, alumni SMANSA, penelusuran alumni, SMAN 1 Pamekasan"
      />
      <div className={`mx-auto px-6 lg:px-8 transition-all duration-300 ${activeTab === 'form' ? 'max-w-3xl' : 'max-w-7xl'}`}>
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
        </Link>

        {/* TOP CONTROLS BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white p-4 rounded-4xl border border-gray-100 shadow-sm">
          {/* Left: View Tabs */}
          <div className="flex bg-gray-55 p-1 rounded-full border border-gray-100/50 w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('map');
              }}
              className={`flex-1 md:flex-none px-6 py-3 text-xs sm:text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'map' ? 'bg-smansa-navy text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <MapPin className="w-4 h-4" /> Peta Sebaran
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('directory');
              }}
              className={`flex-1 md:flex-none px-6 py-3 text-xs sm:text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'directory' ? 'bg-smansa-navy text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <Users className="w-4 h-4" /> Direktori Alumni
            </button>
          </div>

          {/* Right: Prominent Call-to-action Button */}
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer ${
              activeTab === 'form' 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-linear-to-r from-blue-600 to-blue-800 text-white hover:scale-105'
            }`}
          >
            <PenTool className="w-4 h-4" />
            {activeTab === 'form' ? 'Sedang Mengisi Form...' : 'Isi Data Alumni (Tracer Study)'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* TAB 1: PETA SEBARAN */}
          {activeTab === 'map' && (
            <motion.div
              key="map-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-smansa-navy mb-2 tracking-tight">Peta Sebaran Alumni</h1>
                <p className="text-gray-500 text-sm max-w-lg mx-auto">
                  Visualisasi sebaran tempat tinggal, studi lanjutan, dan karir alumni SMAN 1 Pamekasan di seluruh Indonesia.
                </p>
              </div>

              {/* Statistics counters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-6">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Terdata</span>
                  <span className="text-2xl font-black text-smansa-navy">{alumniList.length}</span>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center border-l-4 border-l-blue-500">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Kuliah</span>
                  <span className="text-2xl font-black text-blue-600">
                    {alumniList.filter(al => al.status_saat_ini === 'kuliah').length}
                  </span>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center border-l-4 border-l-emerald-500">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Bekerja</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {alumniList.filter(al => al.status_saat_ini === 'kerja').length}
                  </span>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center border-l-4 border-l-amber-500">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Wirausaha</span>
                  <span className="text-2xl font-black text-amber-600">
                    {alumniList.filter(al => al.status_saat_ini === 'wirausaha').length}
                  </span>
                </div>
              </div>

              {/* Leaflet map container */}
              <div className="relative rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-gray-100">
                <div id="alumni-map" className="w-full h-150 z-10"></div>
                
                {mapLoading && (
                  <div className="absolute inset-0 bg-white/80 z-1001 flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-smansa-navy"></div>
                    <p className="text-sm font-semibold text-gray-500">Memuat peta sebaran...</p>
                  </div>
                )}

                {/* Selected Alumnus Card Overlay */}
                {selectedAlumni && (
                  <div className="absolute bottom-6 right-6 z-1000 bg-white rounded-3xl p-6 border border-gray-100 shadow-2xl max-w-sm w-full animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          selectedAlumni.status_saat_ini === 'kuliah' ? 'bg-blue-50 text-blue-700' :
                          selectedAlumni.status_saat_ini === 'kerja' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {selectedAlumni.status_saat_ini === 'kuliah' ? 'Kuliah' :
                           selectedAlumni.status_saat_ini === 'kerja' ? 'Kerja' : 'Wirausaha'}
                        </span>
                        <h4 className="text-lg font-bold text-smansa-navy mt-2">{selectedAlumni.nama_lengkap}</h4>
                        <p className="text-xs text-gray-500 font-semibold">Lulusan {selectedAlumni.tahun_lulus} | {selectedAlumni.jurusan || 'Alumni'}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setSelectedAlumni(null)}
                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-gray-100 text-sm">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Target / Instansi</span>
                        <p className="text-gray-800 font-bold">{selectedAlumni.nama_instansi || '-'}</p>
                      </div>
                      {selectedAlumni.posisi_jurusan && (
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Prodi / Posisi</span>
                          <p className="text-gray-700 font-medium">{selectedAlumni.posisi_jurusan}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Latitude</span>
                          <p className="text-xs text-gray-650 font-mono">{selectedAlumni.latitude}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Longitude</span>
                          <p className="text-xs text-gray-655 font-mono">{selectedAlumni.longitude}</p>
                        </div>
                      </div>
                      {selectedAlumni.alamat_domisili && (
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Alamat</span>
                          <p className="text-xs text-gray-600 leading-relaxed">{selectedAlumni.alamat_domisili}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: DIREKTORI ALUMNI */}
          {activeTab === 'directory' && (
            <motion.div
              key="directory-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-smansa-navy mb-2 tracking-tight">Direktori Alumni</h1>
                <p className="text-gray-500 text-sm max-w-lg mx-auto">
                  Cari dan telusuri informasi karir serta studi lanjutan dari seluruh alumni SMAN 1 Pamekasan yang telah mengisi kuesioner.
                </p>
              </div>

              {/* Filters Box */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-1/3">
                  <input
                    type="text"
                    placeholder="Cari nama alumni atau instansi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-200 rounded-full px-5 py-3 outline-none text-sm text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
                  />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="flex-1 md:flex-none bg-gray-55 border border-gray-200 rounded-full px-5 py-3 outline-none text-sm text-gray-700 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="">Semua Tahun Lulus</option>
                    {[...new Set(alumniList.map(al => al.tahun_lulus).filter(Boolean))].sort((a, b) => b - a).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 md:flex-none bg-gray-55 border border-gray-200 rounded-full px-5 py-3 outline-none text-sm text-gray-700 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="">Semua Kategori Karir</option>
                    <option value="kuliah">Kuliah</option>
                    <option value="kerja">Kerja</option>
                    <option value="wirausaha">Wirausaha</option>
                  </select>
                </div>
              </div>

              {/* Grid lists */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {alumniList
                  .filter(al => {
                    const name = al.nama_lengkap || '';
                    const instansi = al.nama_instansi || '';
                    const matchSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      instansi.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchYear = yearFilter === '' || (al.tahun_lulus && al.tahun_lulus.toString() === yearFilter);
                    const matchStatus = statusFilter === '' || al.status_saat_ini === statusFilter;
                    return matchSearch && matchYear && matchStatus;
                  })
                  .map(al => (
                    <div 
                      key={al.id}
                      className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white ${
                            al.status_saat_ini === 'kuliah' ? 'bg-blue-600' :
                            al.status_saat_ini === 'kerja' ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}>
                            {(al.nama_lengkap || '?').charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-smansa-navy text-base leading-tight">{al.nama_lengkap || '-'}</h4>
                            <span className="text-xs text-gray-400 font-semibold">Lulusan {al.tahun_lulus || '-'} | {al.jurusan || 'Alumni'}</span>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-gray-50 pt-3 text-sm">
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Status Karir</span>
                            <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mt-0.5 ${
                              al.status_saat_ini === 'kuliah' ? 'bg-blue-50 text-blue-700' :
                              al.status_saat_ini === 'kerja' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {al.status_saat_ini === 'kuliah' ? 'Melanjutkan Kuliah' :
                               al.status_saat_ini === 'kerja' ? 'Bekerja' : 'Berwirausaha'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Target / Instansi</span>
                            <p className="text-gray-800 font-bold leading-tight">{al.nama_instansi || '-'}</p>
                          </div>
                          {al.posisi_jurusan && (
                            <div>
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Prodi / Posisi</span>
                              <p className="text-gray-700 font-medium leading-tight">{al.posisi_jurusan}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {al.latitude && al.longitude && (
                        <button
                          type="button"
                          onClick={() => {
                            const lat = parseFloat(al.latitude);
                            const lng = parseFloat(al.longitude);
                            if (!isNaN(lat) && !isNaN(lng)) {
                              setFlyToCoords([lat, lng]);
                              setSelectedAlumni(al);
                              setActiveTab('map');
                            }
                          }}
                          className="mt-6 w-full py-2.5 bg-gray-55 hover:bg-blue-50 hover:text-blue-600 rounded-full text-xs font-bold text-gray-500 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" /> Lihat di Peta
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: ISI TRACER STUDY FORM (PORTAL/QUESTIONNAIRE) */}
          {activeTab === 'form' && (
            <motion.div
              key="form-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl mx-auto"
            >
              {entryMode !== null && (
                <div className="mb-6 flex justify-start">
                  <button
                    type="button"
                    onClick={() => {
                      setVerifiedStudent(null);
                      setEntryMode(null);
                      setCredentials({ nis: '', tanggal_lahir: '', captcha_code: '' });
                      setManualProfile({
                        nama_lengkap: '',
                        tahun_lulus: '',
                        jurusan: 'MIPA',
                        email: '',
                        nomor_hp: '',
                        alamat_domisili: '',
                        latitude: '',
                        longitude: '',
                      });
                      fetchCaptcha();
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-850 hover:bg-gray-100 transition-all cursor-pointer bg-white px-5 py-2.5 rounded-full border border-gray-150 shadow-sm"
                  >
                    &larr; Kembali ke Pilihan Jalur (Ubah Metode)
                  </button>
                </div>
              )}
              {!verifiedStudent ? (
                <div className="w-full">
                  <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-blue-50/50 text-smansa-navy border border-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Lock className="w-10 h-10 text-smansa-navy" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-smansa-navy mb-4 tracking-tight">Portal Tracking Alumni</h1>
                    <p className="text-gray-600 text-lg max-w-xl mx-auto">
                      {entryMode === 'auto'
                        ? 'Silakan verifikasi NIS, Tanggal Lahir, dan masukkan kode CAPTCHA untuk memuat data Anda.'
                        : 'Pilih jalur pengisian data penelusuran (tracer study) alumni di bawah ini.'}
                    </p>
                  </div>

                  {portalStatus.loading ? (
                    <div className="bg-white rounded-4xl p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-smansa-navy"></div>
                      <p className="text-gray-500 font-medium">Memverifikasi status portal...</p>
                    </div>
                  ) : !portalStatus.isOpen ? (
                    <div className="bg-white rounded-4xl p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                      <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="text-xl font-bold text-red-800 mb-2">Portal Ditutup</h3>
                      <p className="text-gray-650 leading-relaxed text-sm max-w-sm mx-auto">
                        {portalStatus.message || 'Mohon maaf, pengisian penelusuran alumni mandiri saat ini ditutup oleh administrator sekolah.'}
                      </p>
                    </div>
                  ) : entryMode === null ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mt-6">
                      {/* Auto Verification Path Card */}
                      <div 
                        onClick={() => setEntryMode('auto')}
                        className="bg-white border-2 border-gray-100 hover:border-blue-500 rounded-[2.5rem] p-8 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-pointer text-center flex flex-col items-center justify-between min-h-80 group"
                      >
                        <div className="w-16 h-16 bg-blue-50 border border-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                          <Search className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-smansa-navy mb-3 group-hover:text-blue-600 transition-colors">Cari Otomatis</h3>
                          <p className="text-sm text-gray-500 leading-relaxed px-2">
                            Rekomendasi untuk <strong>Alumni Baru</strong>. Cukup masukkan NIS & Tanggal Lahir untuk memuat data profil Anda langsung dari database sekolah.
                          </p>
                        </div>
                        <span className="mt-6 px-6 py-2.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          Gunakan Jalur Ini
                        </span>
                      </div>

                      {/* Manual Path Card */}
                      <div 
                        onClick={() => {
                          setEntryMode('manual');
                          setVerifiedStudent({
                            is_manual: true,
                            nama: '',
                            nis: '',
                            nisn: '',
                            kelas: '',
                            tahun_lulus: '',
                          });
                          fetchCaptcha();
                        }}
                        className="bg-white border-2 border-gray-100 hover:border-emerald-500 rounded-[2.5rem] p-8 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-pointer text-center flex flex-col items-center justify-between min-h-80 group"
                      >
                        <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                          <PenTool className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-smansa-navy mb-3 group-hover:text-emerald-600 transition-colors">Isi Manual (Alumni Lama)</h3>
                          <p className="text-sm text-gray-500 leading-relaxed px-2">
                            Untuk <strong>Alumni Lama</strong> yang datanya belum tercatat secara digital di database sekolah. Isi data diri & rencana karir secara langsung.
                          </p>
                        </div>
                        <span className="mt-6 px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                          Gunakan Jalur Ini
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-4xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 max-w-lg mx-auto relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.25 bg-linear-to-r from-blue-400 to-blue-600"></div>
                      
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

                      <div className="mt-6 pt-6 border-t border-gray-150 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setEntryMode(null);
                            setCredentials({ nis: '', tanggal_lahir: '', captcha_code: '' });
                          }}
                          className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                        >
                          &larr; Kembali ke Pilihan Jalur
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* 2. FORM RENCANA KARIR ALUMNI (VERIFIED) */
                <div className="w-full">
                  {/* Header info */}
                  <div className="bg-white rounded-4xl p-8 md:p-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 bg-smansa-gold h-full"></div>
                    {verifiedStudent.is_manual ? (
                      <div>
                        <p className="text-xs font-bold text-smansa-gold uppercase tracking-widest mb-1">Status Verifikasi: Pengisian Manual</p>
                        <h2 className="text-2xl font-bold text-smansa-navy mb-2">Formulir Alumni Mandiri</h2>
                        <p className="text-sm text-gray-500 font-medium">Lengkapi identitas kelulusan dan rencana karir Anda pada form di bawah.</p>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>

                  {status && (
                    <div className="mb-8 p-5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-3xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                      <span className="font-semibold">{status.message}</span>
                    </div>
                  )}

                  {/* Career choice questionnaire form */}
                  <form onSubmit={handleSubmit} className="bg-white rounded-4xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 space-y-10">
                    
                    {/* Identitas Alumni (Manual Form) */}
                    {verifiedStudent.is_manual && (
                      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-6">
                        <h3 className="font-bold text-xs text-blue-900 uppercase tracking-widest flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-700"/> Identitas Alumni (Lengkapi Profil Anda)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              placeholder="Masukkan nama lengkap Anda..."
                              value={manualProfile.nama_lengkap}
                              onChange={(e) => setManualProfile({ ...manualProfile, nama_lengkap: e.target.value })}
                              className={inputClass}
                              required
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Tahun Kelulusan <span className="text-red-500">*</span></label>
                            <input 
                              type="number" 
                              placeholder="Contoh: 1998, 2015, 2021"
                              value={manualProfile.tahun_lulus}
                              onChange={(e) => setManualProfile({ ...manualProfile, tahun_lulus: e.target.value })}
                              className={inputClass}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className={labelClass}>Jurusan / Kelas Asal <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              placeholder="Contoh: XII MIPA 2, IPS, Bahasa"
                              value={manualProfile.jurusan}
                              onChange={(e) => setManualProfile({ ...manualProfile, jurusan: e.target.value })}
                              className={inputClass}
                              required
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Nomor HP / WhatsApp (Aktif)</label>
                            <input 
                              type="text" 
                              placeholder="Contoh: 08123456789"
                              value={manualProfile.nomor_hp}
                              onChange={(e) => setManualProfile({ ...manualProfile, nomor_hp: e.target.value })}
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className={labelClass}>Email</label>
                            <input 
                              type="email" 
                              placeholder="Contoh: alumni@email.com"
                              value={manualProfile.email}
                              onChange={(e) => setManualProfile({ ...manualProfile, email: e.target.value })}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Domisili Sekarang (Kota)</label>
                            <input 
                              type="text" 
                              placeholder="Contoh: Pamekasan, Surabaya, Jakarta"
                              value={manualProfile.alamat_domisili}
                              onChange={(e) => setManualProfile({ ...manualProfile, alamat_domisili: e.target.value })}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Category Selector Card Radio Grid */}
                    <div>
                      <label className="block text-sm font-bold text-smansa-navy mb-4 uppercase tracking-wider text-center">Pilih Rencana Karir Utama Anda</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Kuliah */}
                        <label className={`cursor-pointer border-2 rounded-4xl p-6 flex flex-col justify-between h-44 hover:border-blue-400 transition-all group ${form.kategori_pilihan === 'kuliah' ? 'bg-smansa-navy text-white border-smansa-navy shadow-xl shadow-blue-900/10' : 'bg-gray-55 border-gray-200 text-gray-600'}`}>
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
                        <label className={`cursor-pointer border-2 rounded-4xl p-6 flex flex-col justify-between h-44 hover:border-blue-400 transition-all group ${form.kategori_pilihan === 'kerja' ? 'bg-smansa-navy text-white border-smansa-navy shadow-xl shadow-blue-900/10' : 'bg-gray-55 border-gray-200 text-gray-600'}`}>
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
                        <label className={`cursor-pointer border-2 rounded-4xl p-6 flex flex-col justify-between h-44 hover:border-blue-400 transition-all group ${form.kategori_pilihan === 'bisnis' ? 'bg-smansa-navy text-white border-smansa-navy shadow-xl shadow-blue-900/10' : 'bg-gray-55 border-gray-200 text-gray-600'}`}>
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
                                    <option value="SNBP">SNBP (Prestasi)</option>
                                    <option value="SNBT">SNBT (Tulis)</option>
                                    <option value="Mandiri">Mandiri</option>
                                    <option value="Kedinasan">Sekolah Kedinasan</option>
                                    <option value="Luar Negeri">Beasiswa Luar Negeri</option>
                                    <option value="Lainnya">Jalur Lainnya</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none text-gray-450">
                                    <GraduationCap className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className={labelClass}>Status Seleksi <span className="text-red-500">*</span></label>
                                <div className="relative">
                                  <select 
                                    value={form.status_seleksi} 
                                    onChange={(e) => setForm({ ...form, status_seleksi: e.target.value })} 
                                    className={selectClass}
                                    required
                                  >
                                    <option value="Rencana">Rencana / Masih Seleksi</option>
                                    <option value="Diterima">Diterima & Aktif Kuliah</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none text-gray-450">
                                    <CheckCircle className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-6">
                              <h3 className="font-bold text-xs text-blue-900 uppercase tracking-widest flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-blue-700"/> Detail Universitas Pilihan
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label className={labelClass}>Universitas Utama (Pilihan 1) <span className="text-red-500">*</span></label>
                                  <input 
                                    type="text" 
                                    placeholder="Contoh: Universitas Indonesia, ITB"
                                    value={form.univ_pilihan_1}
                                    onChange={(e) => setForm({ ...form, univ_pilihan_1: e.target.value })}
                                    className={inputClass}
                                    required
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>Program Studi (Pilihan 1) <span className="text-red-500">*</span></label>
                                  <input 
                                    type="text" 
                                    placeholder="Contoh: Teknik Informatika, Kedokteran"
                                    value={form.jurusan_pilihan_1}
                                    onChange={(e) => setForm({ ...form, jurusan_pilihan_1: e.target.value })}
                                    className={inputClass}
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-blue-100/50">
                                <div>
                                  <label className={labelClass}>Universitas Cadangan (Pilihan 2)</label>
                                  <input 
                                    type="text" 
                                    placeholder="Contoh: Universitas Brawijaya, Airlangga"
                                    value={form.univ_pilihan_2}
                                    onChange={(e) => setForm({ ...form, univ_pilihan_2: e.target.value })}
                                    className={inputClass}
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>Program Studi (Pilihan 2)</label>
                                  <input 
                                    type="text" 
                                    placeholder="Contoh: Ilmu Komunikasi, Manajemen"
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

                    {/* LOKASI KOORDINAT SECTION (FOR BOTH PATHS) */}
                    <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-6">
                      <h3 className="font-bold text-xs text-blue-900 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-700"/> Koordinat Tempat Tinggal Sekarang (Opsional)
                      </h3>
                      <p className="text-xs text-blue-700/80 leading-relaxed -mt-2">
                        Membantu sekolah memetakan sebaran wilayah alumni secara visual. Anda dapat menggunakan tombol deteksi GPS atau mengisi koordinat secara manual.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Garis Lintang (Latitude)</label>
                          <input 
                            type="text" 
                            placeholder="Contoh: -7.161389"
                            value={verifiedStudent.is_manual ? manualProfile.latitude : form.latitude}
                            onChange={(e) => {
                              if (verifiedStudent.is_manual) {
                                setManualProfile({ ...manualProfile, latitude: e.target.value });
                              } else {
                                setForm({ ...form, latitude: e.target.value });
                              }
                            }}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Garis Bujur (Longitude)</label>
                          <input 
                            type="text" 
                            placeholder="Contoh: 113.483056"
                            value={verifiedStudent.is_manual ? manualProfile.longitude : form.longitude}
                            onChange={(e) => {
                              if (verifiedStudent.is_manual) {
                                setManualProfile({ ...manualProfile, longitude: e.target.value });
                              } else {
                                setForm({ ...form, longitude: e.target.value });
                              }
                            }}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  const lat = position.coords.latitude.toFixed(6);
                                  const lng = position.coords.longitude.toFixed(6);
                                  if (verifiedStudent.is_manual) {
                                    setManualProfile(prev => ({ ...prev, latitude: lat, longitude: lng }));
                                  } else {
                                    setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
                                  }
                                  alert('Berhasil mendapatkan lokasi GPS Anda!');
                                },
                                (error) => {
                                  alert('Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif atau isi manual.');
                                }
                              );
                            } else {
                              alert('Browser Anda tidak mendukung deteksi lokasi otomatis.');
                            }
                          }}
                          className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-full text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md"
                        >
                          <MapPin className="w-4 h-4 text-white" /> Deteksi GPS Otomatis
                        </button>
                      </div>
                    </div>

                    {/* CAPTCHA FOR MANUAL SUBMISSION */}
                    {verifiedStudent.is_manual && (
                      <div className="bg-gray-50 border border-gray-100 rounded-3xl p-5 space-y-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Keamanan (Captcha) <span className="text-red-500">*</span></label>
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
                    )}

                    {/* Form submit buttons */}
                    <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4 justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setVerifiedStudent(null);
                          setEntryMode(null);
                        }}
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
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
